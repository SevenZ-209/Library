from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from digilib_core.models import Category, Book, BorrowRecord, User, Tag, Notification


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'category', 'description', 'image', 'total_copies', 'available_copies', 'tags']

class BookDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    tags = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author',
            'category', 'category_name',
            'description', 'image','tags',
            'total_copies', 'available_copies',
            'created_date', 'updated_date'
        ]

class BorrowRecordSerializer(serializers.ModelSerializer):
    borrower_name = serializers.ReadOnlyField(source='user.username')
    borrower_phone = serializers.ReadOnlyField(source='user.phone')
    book_title = serializers.ReadOnlyField(source='book.title')

    class Meta:
        model = BorrowRecord
        fields = [
            'id', 'borrower_name', 'borrower_phone', 'book_title',
            'borrow_date', 'due_date', 'return_date',
            'status', 'note'
        ]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'phone', 'avatar', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'required': False}
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            data['avatar'] = instance.avatar.url
        return data

    def update(self, instance, validated_data):
        keys = set(validated_data.keys())
        allowed_keys = {'first_name', 'last_name', 'phone', 'avatar'}
        if keys - allowed_keys:
            raise ValidationError({'error': 'Có trường dữ liệu không hợp lệ không được phép sửa!'})

        return super().update(instance, validated_data)

    def create(self, validated_data):
        role = validated_data.get('role', 'reader')
        password = validated_data.pop('password', None)

        instance = self.Meta.model(**validated_data)

        if password is not None:
            instance.set_password(password)

        instance.is_active = True
        instance.role = role
        instance.save()
        return instance

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields =['id', 'name']
        
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_date']
