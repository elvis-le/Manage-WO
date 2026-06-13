import pandas as pd
from datetime import date, timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from datetime import datetime, date, timedelta
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction

from .models import ImportBatch, WorkOrder, DispatchAssignment


# --- API ĐĂNG NHẬP ---
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if user is not None:
        if not user.is_active:
            return Response({"error": "Tài khoản đã bị khoá!"}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "username": user.username,
                "role": "admin" if user.is_staff else "user"
            }
        })
    return Response({"error": "Tài khoản hoặc mật khẩu không chính xác!"}, status=status.HTTP_401_UNAUTHORIZED)


# --- API QUẢN LÝ USER (CHỈ ADMIN) ---
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def manage_users(request):
    # Kiểm tra quyền Admin bằng thuộc tính is_staff của Django
    if not request.user.is_staff:
        return Response({"error": "Bạn không có quyền thực hiện hành động này!"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        users = User.objects.all().order_by("-id")
        user_list = []
        for u in users:
            user_list.append({
                "id": u.id,
                "username": u.username,
                "role": "admin" if u.is_staff else "user",
                "is_active": u.is_active
            })
        return Response({"users": user_list})

    elif request.method == "POST":
        username = request.data.get("username")
        password = request.data.get("password")
        role = request.data.get("role", "user")  # 'user' hoặc 'admin'

        if User.objects.filter(username=username).exists():
            return Response({"error": "Tên tài khoản đã tồn tại!"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password)
        if role == "admin":
            user.is_staff = True
        user.save()
        return Response({"success": True, "message": "Tạo tài khoản thành công!"})


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def user_detail_action(request, user_id):
    if not request.user.is_staff:
        return Response({"error": "Bạn không có quyền thực hiện hành động này!"}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "Không tìm thấy người dùng!"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "PUT":
        action = request.data.get("action")  # 'lock', 'unlock', 'change_password'

        if action == "lock":
            user.is_active = False
            user.save()
            return Response({"success": True, "message": "Đã khoá tài khoản!"})

        elif action == "unlock":
            user.is_active = True
            user.save()
            return Response({"success": True, "message": "Đã mở khoá tài khoản!"})

        elif action == "change_password":
            new_password = request.data.get("new_password")
            if not new_password:
                return Response({"error": "Mật khẩu mới không được trống!"}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)
            user.save()
            return Response({"success": True, "message": "Đổi mật khẩu thành công!"})

    elif request.method == "DELETE":
        if user.id == request.user.id:
            return Response({"error": "Bạn không thể tự xoá chính mình!"}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response({"success": True, "message": "Xoá tài khoản thành công!"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def work_orders(request):
    # Luôn lấy batch mới nhất vừa được import
    latest_batch = ImportBatch.objects.order_by('-imported_at').first()

    if not latest_batch:
        return Response({"rows": []})

    queryset = WorkOrder.objects.filter(batch_id=latest_batch.id)
    rows = []

    valid_assignees = set(
        DispatchAssignment.objects.values_list("assignee", flat=True)
    )

    assignment_map = {
        x.assignee: {
            "province": x.province_code,
            "dispatch_group": x.dispatch_group,
            "ft_of": x.ft_of,
        }
        for x in DispatchAssignment.objects.all()
    }

    for wo in queryset:
        completed = wo.status in ["Đóng"]
        close_time = wo.closed_at or wo.completed_at
        completed_today = False

        if completed and close_time:
            completed_today = close_time.date() == date.today() - timedelta(days=1)

        pending = not completed
        overdue = (wo.overdue_days or 0) > 0
        near_due = pending and (wo.remaining_hours or 0) > 0 and (wo.remaining_hours or 0) <= 24

        assignment = assignment_map.get(wo.assignee)
        on_time = False

        if completed and wo.completed_at and wo.due_at:
            on_time = wo.completed_at <= wo.due_at

        rows.append({
            "province": wo.province_code or "",
            "priority": wo.priority_level,
            "wo_group": wo.wo_group,
            "coord_group": wo.dispatch_group,
            "system_name": wo.system_name,
            "employee": wo.assignee or "",
            "is_dispatch_employee": wo.assignee in valid_assignees,
            "dispatch_employee": assignment is not None,
            "dispatch_province": assignment["province"] if assignment else None,
            "dispatch_group": assignment["dispatch_group"] if assignment else None,
            "ft_of": assignment["ft_of"] if assignment else None,
            "penalty": float(wo.penalty_amount or 0),
            "close_time": close_time.isoformat() if close_time else None,
            "work_type": wo.work_type or "",
            "wo_status": wo.status,
            "remain_hour": wo.remaining_hours or 0,
            "overdue_day": wo.overdue_days or 0,
            "completed_today": completed_today,
            "on_time": on_time,
            "wo_id": wo.wo_code,
            "created_time": wo.created_at.isoformat() if wo.created_at else None,
            "completed": completed,
            "pending": pending,
            "overdue": overdue,
            "near_due": near_due,
            "district": wo.district_name,
            "phone": wo.ft_phone,
            "ft_completed": completed,
            "status": "completed" if completed else ("overdue" if overdue else "in_progress"),
        })

    return Response({
        "rows": rows
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_excel(request):
    if not request.user.is_staff:
        return Response({"error": "Bạn không có quyền upload dữ liệu!"}, status=status.HTTP_403_FORBIDDEN)

    # Lấy dữ liệu mảng JSON được gửi từ React (đã được làm sạch và map key)
    data = request.data.get("data", [])
    file_name = request.data.get("file_name", "Data_Uploaded_From_React.xlsx")

    if not data or len(data) == 0:
        return Response({"success": False, "message": "Không có dữ liệu để upload"}, status=400)

    # Hàm hỗ trợ xử lý số liệu an toàn
    def safe_float(val):
        try:
            return float(val) if val not in [None, "", "NaN", "NaT"] else None
        except:
            return None

    def safe_int(val):
        try:
            return int(val) if val not in [None, "", "NaN", "NaT"] else None
        except:
            return None

    try:
        with transaction.atomic():
            # Bước 1: Tạo Batch mới
            batch = ImportBatch.objects.create(
                file_name=file_name,
                total_records=len(data)
            )

            work_order_list = []
            count = 0

            # Bước 2: Chuẩn bị danh sách dữ liệu để insert (Sử dụng key tiếng Anh đã map bên React)
            for row in data:
                wo_code_val = row.get("wo_code")
                # Xử lý trường hợp không có mã WO
                if not wo_code_val or str(wo_code_val).strip() == "":
                    wo_code_val = f"TEMP-{batch.id}-{count}"

                wo = WorkOrder(
                    batch=batch,
                    wo_code=str(wo_code_val).strip(),
                    work_type=row.get("work_type"),
                    status=row.get("status"),
                    system_name=row.get("system_name"),
                    priority_level=row.get("priority_level"),
                    province_code=row.get("province_code"),
                    district_code=row.get("district_code"),
                    district_name=row.get("district_name"),
                    area=row.get("area"),
                    station_code=row.get("station_code"),
                    wo_group=row.get("wo_group"),
                    dispatch_group=row.get("dispatch_group"),
                    creator=row.get("creator"),
                    assignee=row.get("assignee"),
                    ft_comment=row.get("ft_comment"),
                    ft_phone=row.get("ft_phone"),
                    created_at=row.get("created_at"),
                    started_at=row.get("started_at"),
                    due_at=row.get("due_at"),
                    completed_at=row.get("completed_at"),
                    closed_at=row.get("closed_at"),
                    remaining_hours=safe_float(row.get("remaining_hours")),
                    overdue_days=safe_int(row.get("overdue_days")),
                    penalty_amount=safe_float(row.get("penalty_amount")),
                    work_content=row.get("work_content"),
                    description=row.get("description"),
                )
                work_order_list.append(wo)
                count += 1

            # Bước 3: Đẩy hàng loạt vào DB
            WorkOrder.objects.bulk_create(work_order_list, batch_size=5000)

        return Response({
            "success": True,
            "batch_id": batch.id,
            "total_records": count
        })

    except Exception as e:
        return Response({
            "success": False,
            "message": str(e)
        }, status=500)