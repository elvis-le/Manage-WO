from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def home(request):
    return JsonResponse({
        "status": "ok"
    })


urlpatterns = [
    path("", home),

    path("admin/", admin.site.urls),

    path("api/", include("api.urls")),
]