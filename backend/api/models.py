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

    
    work_type = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    
    status = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    
    system_name = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    
    priority_level = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    
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

    
    station_code = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    
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

    
    ft_comment = models.TextField(
        null=True,
        blank=True
    )

    ft_phone = models.CharField(
        max_length=30,
        null=True,
        blank=True
    )

    
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

class DailyProductivity(models.Model):
    # ĐỒNG BỘ KHÓA NGOẠI:
    # Thêm thuộc tính db_column='assignee_id' để Django hiểu và ghi thẳng vào cột
    # 'assignee_id' (kiểu int8) mà bạn đang có trong bảng daily_productivity trên Supabase.
    assignee = models.ForeignKey(
        'DispatchAssignment',
        on_delete=models.CASCADE,
        related_name='productivities',
        db_column='assignee_id' # Khớp 100% với cột assignee_id trên Supabase của bạn
    )
    daytime = models.DateField(verbose_name="Ngày thực hiện")
    wo_done = models.IntegerField(default=0, verbose_name="Số lượng WO hoàn thành")

    class Meta:
        db_table = 'daily_productivity'
        # Đảm bảo quy tắc duy nhất: 1 nhân viên chỉ có duy nhất 1 dòng điểm số cho 1 ngày
        unique_together = ('assignee', 'daytime')

    def __str__(self):
        return f"{self.assignee.assignee} - {self.daytime}: {self.wo_done}"