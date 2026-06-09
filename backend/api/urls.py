from django.urls import path

from .views import upload_dashboard

urlpatterns = [
    path("dashboard/upload/", upload_dashboard)
]