from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import Category, Book, BorrowRecord, User, Tag, Notification, Collection, CollectionBook


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
    book_id = serializers.ReadOnlyField(source='book.id')
    book_image = serializers.SerializerMethodField()

    class Meta:
        model = BorrowRecord
        fields = [
            'id', 'book_id', 'borrower_name', 'borrower_phone', 'book_title',
            'borrow_date', 'due_date', 'return_date',
            'status', 'note', 'book_image'
        ]

    def get_book_image(self, obj):
        if obj.book.image:
            return obj.book.image.url
        return None

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'email', 'password', 'phone', 'avatar', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'required': False},
            'email': {'required': False}
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            data['avatar'] = instance.avatar.url
        return data

    def update(self, instance, validated_data):
        keys = set(validated_data.keys())
        allowed_keys = {'first_name', 'last_name', 'email', 'phone', 'avatar'}
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


class CollectionBookSerializer(serializers.ModelSerializer):
    book_id = serializers.ReadOnlyField(source='book.id')
    title = serializers.ReadOnlyField(source='book.title')
    author = serializers.ReadOnlyField(source='book.author')
    image = serializers.SerializerMethodField()

    class Meta:
        model = CollectionBook
        fields = ['id', 'book_id', 'title', 'author', 'image', 'added_date']

    def get_image(self, obj):
        if obj.book.image:
            return obj.book.image.url
        return None


class CollectionSerializer(serializers.ModelSerializer):
    book_count = serializers.IntegerField(read_only=True)
    curator_name = serializers.ReadOnlyField(source='curator.username')

    class Meta:
        model = Collection
        fields = [
            'id', 'name', 'description', 'cover_image',
            'book_count', 'curator', 'curator_name',
            'is_featured', 'created_date', 'updated_date'
        ]

        extra_kwargs = {
            'curator': {'write_only': True, 'required': False}
        }

class CollectionDetailSerializer(serializers.ModelSerializer):
    book_count = serializers.IntegerField(read_only=True)
    curator_name = serializers.ReadOnlyField(source='curator.username')
    books = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = [
            'id', 'name', 'description', 'cover_image',
            'book_count', 'curator_name', 'is_featured',
            'books', 'created_date', 'updated_date'
        ]

    def get_books(self, obj):
        collection_books = obj.collection_books.select_related('book').all()
        return CollectionBookSerializer(collection_books, many=True).data