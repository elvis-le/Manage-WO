from django.urls import path
from .views import work_orders, upload_excel, login_view, manage_users, user_detail_action

urlpatterns = [
    path("auth/login/", login_view, name="login"),
    path("admin/users/", manage_users, name="manage_users"),
    path("admin/users/<int:user_id>/", user_detail_action, name="user_detail_action"),
    path("upload/", upload_excel, name="upload_excel"),
    path("work-orders/", work_orders, name="work_orders"),
]