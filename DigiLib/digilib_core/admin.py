from django.contrib import admin
from django.db.models import Count
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.safestring import mark_safe
from .models import Category, Book, BorrowRecord, Tag, User
from digilib_core.models import Category, Book, BorrowRecord
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('id','title', 'author', 'category', 'created_date', 'active')
    search_fields = ['title']
    list_filter = ['category', 'tags', 'active']
    readonly_fields =  ['image_view']

    def image_view(self, book):
        if book.image:
            return mark_safe(
                f'<img src="{book.image.url}" width="150" alt="{book.title}" style="border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />')
        return "Chưa có ảnh bìa"

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ['name']

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'first_name', 'last_name', 'email', 'role', 'show_avatar', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'email')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Thông tin bổ sung', {'fields': ('avatar', 'role')}),
    )

    def show_avatar(self, obj):
        if obj.avatar:
            return mark_safe(f'<img src="{obj.avatar.url}" width="40" style="border-radius:50%;" />')
        return ""

    show_avatar.short_description = "Avatar"

@admin.register(BorrowRecord)
class BorrowRecordAdmin(admin.ModelAdmin):
    readonly_fields = ('borrow_date',)
    list_display = ['id','user', 'book', 'borrow_date', 'due_date', 'status']
    list_filter = ['status', 'borrow_date']
    search_fields = ['user__username', 'book__title']

def stats_view(request):
    category_stats = Category.objects.annotate(book_count=Count('books')).values('name', 'book_count')
    borrow_stats = {
        'borrowed': BorrowRecord.objects.filter(status='borrowed').count(),
        'returned': BorrowRecord.objects.filter(status='returned').count(),
        'overdue': BorrowRecord.objects.filter(status='overdue').count(),
    }

    context = {
        **admin.site.each_context(request),
        'category_stats': category_stats,
        'borrow_stats': borrow_stats,
        'title': 'Báo cáo & Thống kê Thư viện'
    }
    return TemplateResponse(request, 'admin/stats.html', context)


admin.site.register(Tag)
