import traceback

import pandas as pd
from datetime import date, timedelta

from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from datetime import datetime, date, timedelta
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction

from .models import ImportBatch, WorkOrder, DispatchAssignment, DailyProductivity


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
# @permission_classes([IsAuthenticated])
@authentication_classes([])
@permission_classes([AllowAny])
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
# @permission_classes([IsAuthenticated])
@authentication_classes([])
@permission_classes([AllowAny])
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
# @permission_classes([IsAuthenticated])
# @authentication_classes([])
# @permission_classes([AllowAny])
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
        near_due = pending and (wo.remaining_hours or 0) > 0 and (wo.remaining_hours or 0) <= 72

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
# @permission_classes([IsAuthenticated])
def upload_excel(request):
    # Tạm thời vô hiệu hóa việc kiểm tra quyền admin
    # if not request.user.is_staff:
    #     return Response({"error": "Bạn không có quyền upload dữ liệu!"}, status=status.HTTP_403_FORBIDDEN)

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

    # Hàm hỗ trợ cực kỳ quan trọng: Xử lý định dạng ngày tháng từ Excel/JSON
    import datetime  # Đảm bảo bạn đã import thư viện này ở đầu file views.py

    # Hàm hỗ trợ cực kỳ quan trọng: Xử lý định dạng ngày tháng từ Excel/JSON
    def safe_datetime(val):
        if val in [None, "", "NaN", "NaT", "null", "undefined"]:
            return None

        # 1. Nếu là số (Serial date của Excel)
        if isinstance(val, (int, float)):
            try:
                # Excel tính ngày từ 01/01/1900
                return datetime.datetime(1899, 12, 30) + datetime.timedelta(days=float(val))
            except:
                return None

        # 2. Nếu là chuỗi (String do Frontend gửi lên)
        if isinstance(val, str):
            val_str = val.strip()

            # Danh sách các định dạng thời gian có thể xảy ra
            formats_to_try = [
                '%Y-%m-%dT%H:%M:%S.%fZ',  # Định dạng ISO chuẩn từ Javascript (cellDates: true)
                '%Y-%m-%dT%H:%M:%S',  # ISO không có mili-giây
                '%d/%m/%Y %H:%M:%S',  # Kiểu Việt Nam có giờ (14/06/2026 15:30:00)
                '%d/%m/%Y',  # Kiểu Việt Nam chỉ có ngày (14/06/2026)
                '%Y-%m-%d %H:%M:%S',  # Kiểu SQL
                '%Y-%m-%d'  # Kiểu SQL chỉ có ngày
            ]

            for fmt in formats_to_try:
                try:
                    return datetime.datetime.strptime(val_str, fmt)
                except ValueError:
                    continue  # Bỏ qua lỗi và thử định dạng tiếp theo

        return None  # Nếu không parse được bằng bất kỳ cách nào thì trả về None

    try:
        with transaction.atomic():
            # Bước 1: Tạo Batch mới
            batch = ImportBatch.objects.create(
                file_name=file_name,
                total_records=len(data)
            )

            work_order_list = []
            count = 0

            # Bước 2: Chuẩn bị danh sách dữ liệu
            for row in data:
                wo_code_val = row.get("wo_code")
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

                    # CỰC KỲ QUAN TRỌNG: Áp dụng hàm safe_datetime cho các trường thời gian
                    created_at=safe_datetime(row.get("created_at")),
                    started_at=safe_datetime(row.get("started_at")),
                    due_at=safe_datetime(row.get("due_at")),
                    completed_at=safe_datetime(row.get("completed_at")),
                    closed_at=safe_datetime(row.get("closed_at")),

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
        print("=== UPLOAD ERROR ===")
        traceback.print_exc()  # In chi tiết lỗi ra terminal
        print("====================")
        return Response({
            "success": False,
            "message": f"Lỗi lưu DB: {str(e)}"
        }, status=500)


@api_view(["POST"])
# @permission_classes([IsAuthenticated])
def upload_productivity(request):
    data = request.data.get("data", [])

    if not data:
        return Response({"success": False, "message": "Không nhận được dữ liệu từ Frontend."}, status=400)

    try:
        # === BƯỚC 1: LẤY DANH SÁCH TỈNH (TỐI ƯU HÓA TRUY VẤN) ===
        # Vì file thuộc KV3, số lượng mã tỉnh rất ít. Lọc theo tỉnh sẽ tránh được việc nhét
        # hàng nghìn tên nhân viên vào câu lệnh SQL gây sập Query Planner của Postgres.
        excel_provinces = set(str(row.get("province_code", "")).strip() for row in data if row.get("province_code"))

        # Lấy danh sách phân công của các tỉnh này lên RAM (Chỉ tốn 1 câu lệnh SQL siêu nhẹ)
        assignments = DispatchAssignment.objects.filter(province_code__in=excel_provinces)

        # Tạo map tra cứu nhanh O(1) trên RAM
        assignment_map = {}
        for assign in assignments:
            key = (assign.assignee, assign.province_code)
            if key not in assignment_map:
                assignment_map[key] = []
            assignment_map[key].append(assign)

        # === BƯỚC 2: SO KHỚP VÀ GOM DỮ LIỆU TRÊN RAM ===
        unmatched_rows = []
        productivity_payload = {}

        for row in data:
            ft_name = str(row.get("ft", "")).strip()
            tt_cum_excel = str(row.get("tt_cum", "")).strip().lower()
            ma_tinh = str(row.get("province_code", "")).strip()
            daytime = row.get("daytime")
            wo_done = row.get("wo_done", 0)

            # LỌC BỎ DÒNG TRỐNG: Giải quyết triệt để vấn đề file bị phình lên 15,040 dòng
            if not ft_name or not daytime:
                continue

            try:
                wo_done = int(wo_done)
            except (ValueError, TypeError):
                wo_done = 0

            possible_assigns = assignment_map.get((ft_name, ma_tinh), [])
            valid_assignee = None

            for assign in possible_assigns:
                ft_of_clean = str(assign.ft_of or "").split('(')[0].strip().lower()
                dispatch_group_clean = str(assign.dispatch_group or "").split('(')[0].strip().lower()

                if ft_of_clean == tt_cum_excel or dispatch_group_clean == tt_cum_excel:
                    valid_assignee = assign
                    break

            if valid_assignee:
                prod_key = (valid_assignee.id, str(daytime))
                # Ghi đè hoặc gom nhóm dữ liệu ngay trên RAM
                productivity_payload[prod_key] = DailyProductivity(
                    assignee=valid_assignee,
                    daytime=daytime,
                    wo_done=wo_done
                )
            else:
                unmatched_rows.append(f"{ft_name} ({tt_cum_excel} - {ma_tinh})")

        # === BƯỚC 3: ĐẨY THẲNG XUỐNG DB DÙNG NATIVE ON CONFLICT DO UPDATE ===
        # Bỏ hoàn toàn bước gọi SQL kiểm tra trùng dữ liệu cũ (Xóa bỏ nguyên nhân gây treo API)
        records_to_save = list(productivity_payload.values())
        success_count = len(records_to_save)

        if records_to_save:
            with transaction.atomic():
                # Sử dụng tính năng tối ưu mạnh mẽ của Django 4.1+ kết hợp hạ tầng Postgres của Supabase
                DailyProductivity.objects.bulk_create(
                    records_to_save,
                    batch_size=1000,
                    update_conflicts=True,  # Kích hoạt chế độ ON CONFLICT của Postgres
                    update_fields=['wo_done'],  # Nếu trùng khóa thì cập nhật lại cột wo_done
                    unique_fields=['assignee', 'daytime']  # Khớp với unique_together trong Model
                )

        return_message = f"Đồng bộ siêu tốc thành công {success_count} dòng năng suất thực tế!"
        if unmatched_rows:
            return_message += f" (Có {len(unmatched_rows)} dòng trống hoặc không khớp phân công hệ thống)"

        return Response({"success": True, "message": return_message})

    except Exception as e:
        traceback.print_exc()
        return Response({"success": False, "message": f"Lỗi xử lý tại Backend: {str(e)}"}, status=500)


@api_view(["GET"])
# @permission_classes([IsAuthenticated])
def get_productivity_dashboard(request):
    try:
        # 1. Tìm 5 ngày gần nhất có dữ liệu trong hệ thống (Tự động linh hoạt không cần fix cứng ngày)
        latest_dates = list(
            DailyProductivity.objects.order_by('-daytime')
            .values_list('daytime', flat=True)
            .distinct()[:5]
        )

        if not latest_dates:
            return Response({"success": True, "data": []})

        # Số ngày thực tế (đề phòng hệ thống mới chỉ có 2-3 ngày dữ liệu)
        num_days = len(latest_dates)

        # 2. Gom nhóm theo nhân viên và tính tổng số WO hoàn thành trong các ngày đó
        stats = DailyProductivity.objects.filter(daytime__in=latest_dates) \
            .values(
            'assignee__assignee',  # Tên NV
            'assignee__province_code',  # Mã tỉnh
            'assignee__ft_of',  # Tên Cụm
            'assignee__dispatch_group'  # Tên Nhóm (phòng hờ ft_of bị trống)
        ) \
            .annotate(total_wo=Sum('wo_done'))

        # 3. Format lại dữ liệu cho khớp 100% với props apiData của React
        result = []
        for row in stats:
            total = row['total_wo'] or 0
            # Tính trung bình và làm tròn 2 chữ số thập phân
            avg = round(total / num_days, 2)

            # Ưu tiên lấy tên Cụm, nếu không có thì lấy tên Nhóm
            group_name = row['assignee__dispatch_group'] or row['assignee__ft_of'] or 'Không xác định'

            # Làm sạch tên nhóm (Bỏ phần trong ngoặc nếu có)
            group_name = group_name.split('(')[0].strip()

            result.append({
                "employee": row['assignee__assignee'],
                "province": row['assignee__province_code'],
                "primary_group": group_name,
                "groups": [group_name],  # Component React đang expect đây là 1 mảng
                "totalWO": total,
                "avg": avg
            })

        # 4. Sắp xếp danh sách: Ai năng suất thấp nhất (avg nhỏ nhất) thì đứng đầu danh sách
        result.sort(key=lambda x: x['avg'])

        return Response({"success": True, "data": result})

    except Exception as e:
        return Response({"success": False, "message": str(e)}, status=500)