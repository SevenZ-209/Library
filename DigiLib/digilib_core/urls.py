from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter

from . import views

def root_view(request):
    return JsonResponse({
        "message": "DigiLib API",
        "version": "1.0",
        "docs": "/swagger/",
        "admin": "/admin/"
    })

r = DefaultRouter()
r.register('category', views.CategoryView, basename='category')
r.register('book', views.BookView, basename='book')
r.register('tag', views.TagView, basename='tag')
r.register('user', views.UserView, basename='user')
r.register('borrower', views.BorrowRecordViewSet, basename='borrower')
r.register('notification', views.NotificationViewSet, basename='notification')
r.register('collection', views.CollectionViewSet, basename='collection')

urlpatterns = [
    path('', root_view, name='root'),
    path('api/', include(r.urls)),
]

