from django.contrib import admin
from django.db.models import Count
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.safestring import mark_safe
from .models import Category, Book, BorrowRecord, Tag, User, Collection, CollectionBook
from .models import Category, Book, BorrowRecord
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


class CollectionBookInline(admin.TabularInline):
    model = CollectionBook
    extra = 1
    autocomplete_fields = ['book']


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):

    list_display = ('id', 'name', 'curator', 'book_count', 'is_featured', 'show_cover')
    list_filter = ('is_featured', 'curator', 'active')
    search_fields = ('name', 'description')

    inlines = [CollectionBookInline]

    list_editable = ('is_featured',)

    def show_cover(self, obj):
        if obj.cover_image:
            return mark_safe(f'<img src="{obj.cover_image.url}" width="50" style="border-radius: 4px;" />')
        return "No Cover"

    show_cover.short_description = "Ảnh bìa"


@admin.register(CollectionBook)
class CollectionBookAdmin(admin.ModelAdmin):
    list_display = ('collection', 'book', 'added_date')
    list_filter = ('collection', 'added_date')
    autocomplete_fields = ['collection', 'book']


admin.site.register(Tag)
