from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

r = DefaultRouter()
r.register('category', views.CategoryView, basename='category')
r.register('book', views.BookView, basename='book')

urlpatterns = [
    path('', include(r.urls)),
]

