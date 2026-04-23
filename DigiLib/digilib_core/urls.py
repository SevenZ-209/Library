from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

r = DefaultRouter()
r.register('category', views.CategoryView, basename='category')
r.register('book', views.BookView, basename='book')
r.register('tag', views.TagView, basename='tag')
r.register('user', views.UserView, basename='user')
r.register('borrower', views.BorrowRecordViewSet, basename='borrower')

urlpatterns = [
    path('api/', include(r.urls)),
]

