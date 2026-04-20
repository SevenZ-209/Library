from ckeditor_uploader.fields import RichTextUploadingField
from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q, F, CheckConstraint
from rest_framework.exceptions import ValidationError


class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

class User(AbstractUser):
    ROLE_CHOICES = (
        ('reader', 'Độc giả'),
        ('librarian', 'Thủ thư'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='reader')
    phone = models.CharField(max_length=15, null=True, blank=True)
    avatar = CloudinaryField(null=True)

    def __str__(self):
        return self.username

class Tag(BaseModel):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Book(BaseModel):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='books')
    description = RichTextUploadingField(null=True, blank=True)
    image = CloudinaryField(null=True, blank=True)
    tags = models.ManyToManyField(Tag, blank=True, related_name='books')

    total_copies = models.IntegerField(default=1)
    available_copies = models.IntegerField(default=1)

    def __str__(self):
        return self.title

    def clean(self):
        if self.available_copies > self.total_copies:
            raise ValidationError({
                'available_copies': 'Số bản có sẵn tuyệt đối không được lớn hơn tổng số bản sách!'
            })
        if self.available_copies < 0 or self.total_copies < 0:
            raise ValidationError('Số lượng sách không được là số âm!')

    class Meta:
        constraints = [
            CheckConstraint(
                condition=Q(available_copies__lte=F('total_copies')),
                name='check_available_lte_total'
            ),
            CheckConstraint(
                condition=Q(available_copies__gte=0) & Q(total_copies__gte=0),
                name='check_positive_copies'
            )
        ]

class BorrowRecord(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Chờ nhận sách'),
        ('borrowed', 'Đang mượn'),
        ('returned', 'Đã trả'),
        ('overdue', 'Quá hạn'),
        ('cancelled', 'Đã hủy'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='borrow_records')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrow_records')

    borrow_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    return_date = models.DateTimeField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='borrowed')
    note = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} mượn {self.book.title}"