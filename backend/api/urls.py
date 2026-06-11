from django.urls import path

from .views import upload_dashboard, work_orders
from .upload import upload_excel

urlpatterns = [
    path("dashboard/upload/", upload_dashboard),
    path("upload/", upload_excel, name="upload_excel"),
    path("work-orders/", work_orders),
]