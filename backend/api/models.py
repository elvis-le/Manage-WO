from django.db import models
from django.utils import timezone


class ImportBatch(models.Model):
    file_name = models.CharField(max_length=255)
    imported_at = models.DateTimeField(auto_now_add=True)
    total_records = models.IntegerField(default=0)

    class Meta:
        db_table = "import_batches"


class DispatchAssignment(models.Model):
    province_code = models.CharField(
        max_length=50
    )

    ft_of = models.CharField(
        max_length=50
    )

    dispatch_group = models.CharField(
        max_length=255
    )

    creator = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    assignee = models.CharField(
        max_length=255
    )

    created_at = models.DateTimeField(
        default=timezone.now
    )

    class Meta:
        db_table = "dispatch_assignments"


class WorkOrder(models.Model):
    wo_code = models.CharField(
        max_length=100,
        db_index=True
    )

    batch = models.ForeignKey(
        ImportBatch,
        on_delete=models.CASCADE,
        related_name="work_orders"
    )

    # Loại công việc
    work_type = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    # Trạng thái
    status = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    # Hệ thống
    system_name = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    # Mức độ ưu tiên
    priority_level = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    # Khu vực hành chính
    province_code = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    district_code = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    district_name = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    area = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    # Trạm
    station_code = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    # Nhóm
    wo_group = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    dispatch_group = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    # Nhân viên
    creator = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    assignee = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    # FT
    ft_comment = models.TextField(
        null=True,
        blank=True
    )

    ft_phone = models.CharField(
        max_length=30,
        null=True,
        blank=True
    )

    # Thời gian
    created_at = models.DateTimeField(
        null=True,
        blank=True
    )

    started_at = models.DateTimeField(
        null=True,
        blank=True
    )

    due_at = models.DateTimeField(
        null=True,
        blank=True
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    closed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    # SLA
    remaining_hours = models.FloatField(
        null=True,
        blank=True
    )

    overdue_days = models.IntegerField(
        null=True,
        blank=True
    )

    penalty_amount = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        null=True,
        blank=True
    )

    # Nội dung
    work_content = models.TextField(
        null=True,
        blank=True
    )

    description = models.TextField(
        null=True,
        blank=True
    )

    def __str__(self):
        return self.wo_code

    class Meta:
        db_table = "work_orders"

        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["province_code"]),
            models.Index(fields=["system_name"]),
            models.Index(fields=["priority_level"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["due_at"]),
        ]