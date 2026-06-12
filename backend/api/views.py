import pandas as pd
import math as pymath

from datetime import date, timedelta
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from .models import WorkOrder, DispatchAssignment


@api_view(["GET"])
def work_orders(request):

    batch_id = 1

    queryset = WorkOrder.objects.all()

    if batch_id:
        queryset = queryset.filter(
            batch_id=batch_id
        )

    rows = []

    valid_assignees = set(
        DispatchAssignment.objects.values_list(
            "assignee",
            flat=True
        )
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

        completed = (
                wo.status in [
            "Đóng"
        ]
        )

        close_time = (
                wo.closed_at
                or wo.completed_at
        )

        completed_today = False

        if (
                completed
                and close_time
        ):
            completed_today = (
                    close_time.date()
                    == date.today() - timedelta(days=1)
            )

        pending = not completed

        overdue = (
            (wo.overdue_days or 0) > 0
        )

        near_due = (
                pending
                and (wo.remaining_hours or 0) > 0
                and (wo.remaining_hours or 0) <= 72
        )

        assignment = assignment_map.get(
            wo.assignee
        )

        on_time = False

        if (
                completed
                and wo.completed_at
                and wo.due_at
        ):
            on_time = (
                    wo.completed_at <= wo.due_at
            )

        rows.append({
            "province": wo.province_code,
            "priority": wo.priority_level,
            "wo_group": wo.wo_group,

            "coord_group": wo.dispatch_group,
            "t status": wo.dispatch_group,
            "employee": wo.assignee,
            "is_dispatch_employee":
                wo.assignee in valid_assignees,
            "dispatch_employee":
                assignment is not None,

            "dispatch_province":
                assignment["province"]
                if assignment else None,

            "dispatch_group":
                assignment["dispatch_group"]
                if assignment else None,

            "ft_of":
                assignment["ft_of"]
                if assignment else None,
            "penalty": float(wo.penalty_amount or 0),

            "close_time": (
    close_time.isoformat()
    if close_time
    else None
),

            "work_type": wo.work_type,
            "wo_status": wo.status,
            "remain_hour": wo.remaining_hours or 0,
            "overdue_day": wo.overdue_days or 0,
            "completed_today": completed_today,

            "on_time": on_time,
            "wo_id": wo.wo_code,

            "created_time": (
                wo.created_at.isoformat()
                if wo.created_at
                else None
            ),

            "completed": completed,
            "pending": pending,
            "overdue": overdue,
            "near_due": near_due,
            "district": wo.district_name,
            "phone": wo.ft_phone,

            "status": (
                "completed"
                if completed
                else (
                    "overdue"
                    if overdue
                    else "in_progress"
                )
            ),
        })

    return Response({
        "rows": rows
    })

@api_view(["POST"])
def upload_dashboard(request):

    file = request.FILES["file"]

    df = pd.read_excel(
        file,
        header=6,
        engine="openpyxl"
    )

    df.columns = (
        df.columns.astype(str)
        .str.strip()
    )

    print(df.columns.tolist())

    if "Hệ Thống" in df.columns:
        df = df[
            ~df["Hệ Thống"].isin([
                "SPM",
                "SPM_VTNET"
            ])
        ]

    rows = []

    for _, row in df.iterrows():

        
        
        

        wo_status = str(
            row.get("Trạng Thái", "")
        ).strip()

        
        
        

        ft_completed = pd.notna(
            row.get(
                "Thời Điểm FT Hoàn Thành"
            )
        )

        
        
        

        completed = (
            wo_status in [
                "Đóng",
                "FT hoàn thành"
            ]
            or ft_completed
        )



        
        
        

        pending = not completed

        
        
        

        overdue_day = (
            int(row["Số Ngày Quá Hạn"])
            if pd.notna(
                row["Số Ngày Quá Hạn"]
            )
            else 0
        )

        overdue = (
            overdue_day > 0
        )

        
        
        

        remain_hour = (
            float(
                row["Thời Gian Còn Lại (Giờ)"]
            )
            if pd.notna(
                row["Thời Gian Còn Lại (Giờ)"]
            )
            else 0
        )

        
        
        

        near_due = (
            pending
            and remain_hour > 0
            and remain_hour <= 24
        )

        
        
        

        if completed:
            status = "completed"

        elif overdue:
            status = "overdue"

        else:
            status = "in_progress"

        
        
        

        completed_today = False

        if (
            completed
            and pd.notna(
                row.get(
                    "Thời Điểm CD Đóng"
                )
            )
        ):

            completed_today = (
                row[
                    "Thời Điểm CD Đóng"
                ].date()
                == date.today() - timedelta(days=1)
            )

            close_time = None

            if pd.notna(row.get("Thời Điểm CD Đóng")):
                close_time = row["Thời Điểm CD Đóng"]

            elif pd.notna(row.get("Thời Điểm FT Hoàn Thành")):
                close_time = row["Thời Điểm FT Hoàn Thành"]

        
        

        on_time = False

        if (
            ft_completed
            and pd.notna(
                row.get(
                    "Thời Điểm Yêu Cầu Kết Thúc"
                )
            )
        ):

            on_time = (
                row[
                    "Thời Điểm FT Hoàn Thành"
                ]
                <=
                row[
                    "Thời Điểm Yêu Cầu Kết Thúc"
                ]
            )

        
        
        

        rows.append({

            "province": (
                str(row["Mã Tỉnh"])
                if pd.notna(
                    row["Mã Tỉnh"]
                )
                else ""
            ),

            "priority":
                row.get(
                    "Mức Độ Ưu Tiên"
                ),

            "wo_group":
                row.get(
                    "Nhóm WO"
                ),

            "coord_group":
                row.get(
                    "Nhóm Điều Phối"
                ),

            "employee": (
                str(
                    row[
                        "Nhân Viên Thực Hiện"
                    ]
                )
                if pd.notna(
                    row[
                        "Nhân Viên Thực Hiện"
                    ]
                )
                else ""
            ),

            "penalty": (
                float(row["Tiền Phạt Quá Hạn"])
                if pd.notna(row["Tiền Phạt Quá Hạn"])
                else 0
            ),

            "close_time": (
    close_time.isoformat()
    if close_time
    else None
),

            "work_type": (
                str(row["Loại Công Việc"])
                if pd.notna(
                    row.get("Loại Công Việc")
                )
                else ""
            ),

            "wo_status":
                wo_status,

            "remain_hour":
                remain_hour,

            "overdue_day":
                overdue_day,

            "wo_id": str(row["Mã Công Việc"]),

            "created_time": (
                row[
                    "Thời Điểm Tạo"
                ].isoformat()
                if pd.notna(
                    row[
                        "Thời Điểm Tạo"
                    ]
                )
                else None
            ),

            "status":
                status,

            "completed":
                completed,

            "pending":
                pending,

            "overdue":
                overdue,

            "near_due":
                near_due,

            "completed_today":
                completed_today,

            "on_time":
                on_time,

            "ft_completed":
                ft_completed,
        })

    
    for row in rows:

        for key, value in row.items():

            if (
                isinstance(
                    value,
                    float
                )
                and pymath.isnan(value)
            ):
                print(
                    "NAN FOUND:",
                    key
                )

    return Response({
        "rows": rows
    })

