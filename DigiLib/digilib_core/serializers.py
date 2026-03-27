from rest_framework import serializers

from digilib_core.models import Category, Book, BorrowRecord


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'category', 'description', 'image', 'total_copies', 'available_copies']

class BookDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author',
            'category', 'category_name',
            'description', 'image',
            'total_copies', 'available_copies',
            'created_date', 'updated_date'
        ]

class BorrowRecordSerializer(serializers.ModelSerializer):
    borrower_name = serializers.ReadOnlyField(source='user.username')
    borrower_phone = serializers.ReadOnlyField(source='user.phone')

    class Meta:
        model = BorrowRecord
        fields = [
            'id', 'borrower_name', 'borrower_phone',
            'borrow_date', 'due_date', 'return_date',
            'status', 'note'
        ]