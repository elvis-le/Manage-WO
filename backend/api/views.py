import pandas as pd
import math as pymath

from datetime import date
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["POST"])
def upload_dashboard(request):

    file = request.FILES["file"]

    df = pd.read_excel(
        file,
        header=6,
        engine="openpyxl"
    )

    print(df.columns.tolist())

    df.columns = df.columns.str.strip()

    df = df[
        ~df["Hệ Thống"].isin([
            "SPM",
            "SPM_VTNET"
        ])
    ]

    rows = []

    for _, row in df.iterrows():

        completed = pd.notna(
            row["Thời Điểm FT Hoàn Thành"]
        )

        overdue = (
            pd.notna(
                row["Số Ngày Quá Hạn"]
            )
            and
            row["Số Ngày Quá Hạn"] > 0
        )

        active_overdue = (
                not completed
                and overdue
        )

        status = "in_progress"

        if completed:
            status = "completed"
        elif active_overdue:
            status = "overdue"

        near_due = (
                not completed
                and pd.notna(row["Thời Gian Còn Lại (Giờ)"])
                and row["Thời Gian Còn Lại (Giờ)"] <= 24
                and row["Thời Gian Còn Lại (Giờ)"] > 0
        )

        completed_today = False

        if completed:
            completed_today = (
                    row["Thời Điểm FT Hoàn Thành"].date()
                    == date.today()
            )

        on_time = False

        if (
                completed
                and
                pd.notna(row["Thời Điểm Yêu Cầu Kết Thúc"])
        ):
            on_time = (
                    row["Thời Điểm FT Hoàn Thành"]
                    <=
                    row["Thời Điểm Yêu Cầu Kết Thúc"]
            )

        rows.append({
            "province": (
    str(row["Mã Tỉnh"])
    if pd.notna(row["Mã Tỉnh"])
    else ""
),

            "priority":
                row["Mức Độ Ưu Tiên"],

            "wo_group":
                row["Nhóm WO"],

            "coord_group":
                row["Nhóm Điều Phối"],

            "employee": (
    str(row["Nhân Viên Thực Hiện"])
    if pd.notna(row["Nhân Viên Thực Hiện"])
    else ""
),

            "remain_hour": (
    float(row["Thời Gian Còn Lại (Giờ)"])
    if pd.notna(row["Thời Gian Còn Lại (Giờ)"])
    else 0
),

            "overdue_day": (
    int(row["Số Ngày Quá Hạn"])
    if pd.notna(row["Số Ngày Quá Hạn"])
    else 0
),

            "created_time": (
                row["Thời Điểm Tạo"].isoformat()
                if pd.notna(row["Thời Điểm Tạo"])
                else None
            ),

            "status": status,
            "in_progress": (
    status == "in_progress"
),

            "completed":
                completed,
            "pending":
                not completed
            ,

            "overdue":
                overdue,
            "completed_today": completed_today,
            "near_due": near_due,
            "on_time": on_time,
        })
    for row in rows:
        for key, value in row.items():
            if isinstance(value, float):
                if pymath.isnan(value):
                    print("NAN FOUND:", key)
    return Response({
        "rows": rows
    })