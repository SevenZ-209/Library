from django.contrib import admin
from django.db.models import Count
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.safestring import mark_safe
from .models import Category, Book, BorrowRecord, Tag
from digilib_core.models import Category, Book, BorrowRecord

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'created_date', 'active')
    search_fields = ['title']
    list_filter = ['id', 'title', 'created_date', 'active']
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

def stats_view(request):
    category_stats = Category.objects.annotate(book_count=Count('books')).values('name', 'book_count')
    borrow_stats = {
        'borrowed': BorrowRecord.objects.filter(status='borrowed').count(),
        'returned': BorrowRecord.objects.filter(status='returned').count(),
        'overdue': BorrowRecord.objects.filter(status='overdue').count(),
    }

    context = {
        # Dòng này CỰC KỲ QUAN TRỌNG: Nó giúp truyền các thông số của Jazzmin (menu, logo) vào trang của bạn
        **admin.site.each_context(request),
        'category_stats': category_stats,
        'borrow_stats': borrow_stats,
        'title': 'Báo cáo & Thống kê Thư viện'
    }
    return TemplateResponse(request, 'admin/stats.html', context)