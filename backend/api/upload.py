import pandas as pd

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import (
    ImportBatch,
    WorkOrder,
)


@api_view(["POST"])
def upload_excel(request):

    file = request.FILES.get("file")

    if not file:
        return Response({
            "success": False,
            "message": "Không có file"
        }, status=400)

    try:

        df = pd.read_excel(
            file,
            header=6,
            engine="openpyxl"
        )

        df.columns = df.columns.str.strip()

        # bỏ hệ thống không cần
        if "Hệ Thống" in df.columns:
            df = df[
                ~df["Hệ Thống"].isin([
                    "SPM",
                    "SPM_VTNET"
                ])
            ]

        batch = ImportBatch.objects.create(
            file_name=file.name,
            total_records=len(df)
        )

        count = 0

        for _, row in df.iterrows():

            # =====================
            # WO
            # =====================

            wo = row.get("Mã WO")

            if pd.isna(wo):
                wo_code = f"TEMP-{count}"
            else:
                wo_code = str(wo).strip()

            work_order, _ = WorkOrder.objects.get_or_create(
                wo_code=wo_code
            )

            # =====================
            # SNAPSHOT
            # =====================

            WorkOrder.objects.create(

                batch=batch,

                work_order=work_order,

                work_type=row.get(
                    "Loại Công Việc"
                ),

                status=row.get(
                    "Trạng Thái"
                ),

                system_name=row.get(
                    "Hệ Thống"
                ),

                priority_level=row.get(
                    "Mức Độ Ưu Tiên"
                ),

                province_code=row.get(
                    "Mã Tỉnh"
                ),

                district_code=row.get(
                    "Mã Huyện"
                ),

                district_name=row.get(
                    "Tên Huyện"
                ),

                area=row.get(
                    "Khu Vực"
                ),

                station_code=row.get(
                    "Mã Trạm"
                ),

                wo_group=row.get(
                    "Nhóm WO"
                ),

                dispatch_group=row.get(
                    "Nhóm Điều Phối"
                ),

                creator=row.get(
                    "Nhân Viên Khởi Tạo"
                ),

                assignee=row.get(
                    "Nhân Viên Thực Hiện"
                ),

                ft_comment=row.get(
                    "FT Comment"
                ),

                ft_phone=row.get(
                    "SĐT FT"
                ),

                created_at=(
                    row["Thời Điểm Tạo"]
                    if pd.notna(row.get("Thời Điểm Tạo"))
                    else None
                ),

                started_at=(
                    row["Thời Điểm Bắt Đầu Thực Hiện"]
                    if pd.notna(row.get("Thời Điểm Bắt Đầu Thực Hiện"))
                    else None
                ),

                due_at=(
                    row["Thời Điểm Yêu Cầu Kết Thúc"]
                    if pd.notna(row.get("Thời Điểm Yêu Cầu Kết Thúc"))
                    else None
                ),

                completed_at=(
                    row["Thời Điểm FT Hoàn Thành"]
                    if pd.notna(row.get("Thời Điểm FT Hoàn Thành"))
                    else None
                ),

                closed_at=(
                    row["Thời Điểm Đóng"]
                    if pd.notna(row.get("Thời Điểm Đóng"))
                    else None
                ),

                remaining_hours=(
                    float(
                        row["Thời Gian Còn Lại (Giờ)"]
                    )
                    if pd.notna(
                        row.get(
                            "Thời Gian Còn Lại (Giờ)"
                        )
                    )
                    else None
                ),

                overdue_days=(
                    int(
                        row["Số Ngày Quá Hạn"]
                    )
                    if pd.notna(
                        row.get(
                            "Số Ngày Quá Hạn"
                        )
                    )
                    else None
                ),

                penalty_amount=row.get(
                    "Tiền Phạt"
                ),

                work_content=row.get(
                    "Nội Dung Công Việc"
                ),

                description=row.get(
                    "Mô Tả"
                ),

            )

            count += 1

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