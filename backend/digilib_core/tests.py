from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.exceptions import ValidationError

from .models import User, Category, Book, BorrowRecord, Tag, Collection, CollectionBook


class BookModelTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Khoa học máy tính")

    def test_book_creation_success(self):
        book = Book.objects.create(
            title="test",
            author="test",
            category=self.category,
            total_copies=5,
            available_copies=5
        )
        self.assertEqual(book.title, "test")
        self.assertEqual(book.available_copies, 5)

    def test_book_clean_validation(self):
        book = Book(
            title="Sách Lỗi",
            author="Ẩn danh",
            category=self.category,
            total_copies=5,
            available_copies=10
        )
        with self.assertRaises(ValidationError) as context:
            book.clean()

        self.assertIn('available_copies', context.exception.detail)

    def test_book_negative_copies(self):
        book = Book(
            title="Sách Lỗi Âm",
            author="Ẩn danh",
            total_copies=-1,
            available_copies=-1
        )

        with self.assertRaises(ValidationError):
            book.clean()


class LibraryAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.reader = User.objects.create_user(username='reader1', password='password123', role='reader')
        self.librarian = User.objects.create_user(username='librarian1', password='password123', role='librarian')

        self.category = Category.objects.create(name="Lập trình")
        self.book = Book.objects.create(
            title="Python Cơ Bản",
            author="Guido",
            category=self.category,
            total_copies=5,
            available_copies=5
        )

    def test_get_book_list(self):
        response = self.client.get('/api/book/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], "Python Cơ Bản")

    def test_reader_borrow_book_success(self):
        self.client.force_authenticate(user=self.reader)

        response = self.client.post('/api/borrower/', {'book_id': self.book.id})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(BorrowRecord.objects.count(), 1)

        record = BorrowRecord.objects.first()
        self.assertEqual(record.status, 'pending')
        self.assertEqual(record.user, self.reader)

        self.book.refresh_from_db()
        self.assertEqual(self.book.available_copies, 4)

    def test_reader_borrow_limit_exceeded(self):
        self.client.force_authenticate(user=self.reader)

        for i in range(3):
            b = Book.objects.create(title=f"Sách {i}", total_copies=2, available_copies=2)
            BorrowRecord.objects.create(user=self.reader, book=b, due_date=timezone.now() + timedelta(days=1),
                                        status='borrowed')

        response = self.client.post('/api/borrower/', {'book_id': self.book.id})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("đạt giới hạn mượn", response.data['detail'])

    def test_reader_borrow_out_of_stock(self):
        self.client.force_authenticate(user=self.reader)

        out_of_stock_book = Book.objects.create(
            title="Hết Sách", total_copies=5, available_copies=0
        )

        response = self.client.post('/api/borrower/', {'book_id': out_of_stock_book.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_librarian_confirm_pickup(self):
        record = BorrowRecord.objects.create(
            user=self.reader,
            book=self.book,
            due_date=timezone.now() + timedelta(days=1),
            status='pending'
        )

        self.client.force_authenticate(user=self.reader)
        response = self.client.post(f'/api/borrower/{record.id}/confirm-pickup/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.librarian)
        response = self.client.post(f'/api/borrower/{record.id}/confirm-pickup/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        record.refresh_from_db()
        self.assertEqual(record.status, 'borrowed')

    def test_librarian_return_book(self):

        self.book.available_copies -= 1
        self.book.save()

        record = BorrowRecord.objects.create(
            user=self.reader,
            book=self.book,
            due_date=timezone.now() + timedelta(days=14),
            status='borrowed'
        )

        self.client.force_authenticate(user=self.librarian)
        response = self.client.post(f'/api/borrower/{record.id}/return/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        record.refresh_from_db()
        self.book.refresh_from_db()

        self.assertEqual(record.status, 'returned')
        self.assertIsNotNone(record.return_date)
        self.assertEqual(self.book.available_copies, 5)

class CategoryAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.reader = User.objects.create_user(username='reader_cat', password='password123', role='reader')
        self.librarian = User.objects.create_user(username='librarian_cat', password='password123', role='librarian')
        self.admin = User.objects.create_user(username='admin_cat', password='password123', role='admin')

    def test_create_category_as_admin_success(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/category/', {'name': 'Danh mục Admin'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Category.objects.count(), 1)
        self.assertEqual(Category.objects.first().name, 'Danh mục Admin')

    def test_create_category_as_librarian_success(self):
        self.client.force_authenticate(user=self.librarian)
        response = self.client.post('/api/category/', {'name': 'Danh mục Thủ thư'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Category.objects.count(), 1)
        self.assertEqual(Category.objects.first().name, 'Danh mục Thủ thư')

    def test_create_category_as_reader_forbidden(self):
        self.client.force_authenticate(user=self.reader)
        response = self.client.post('/api/category/', {'name': 'Danh mục Độc giả'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Category.objects.count(), 0)

    def test_create_category_unauthenticated(self):
        response = self.client.post('/api/category/', {'name': 'Khách Vô Danh'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Category.objects.count(), 0)

class CollectionAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.reader = User.objects.create_user(username='reader_col', password='123', role='reader')
        self.librarian = User.objects.create_user(username='librarian_col', password='123', role='librarian')

        self.category = Category.objects.create(name="Sách Giáo Khoa")
        self.book1 = Book.objects.create(title="Toán 1", author="NXB GD", category=self.category, total_copies=10,
                                         available_copies=10)
        self.book2 = Book.objects.create(title="Văn 1", author="NXB GD", category=self.category, total_copies=5,
                                         available_copies=5)

        self.collection = Collection.objects.create(
            name="Bộ sách lớp 1",
            description="Tổng hợp sách giáo khoa lớp 1",
            curator=self.librarian,
            is_featured=True
        )

    def test_get_collections_list_allow_any(self):
        response = self.client.get('/api/collection/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data['results']) >= 1)

    def test_get_featured_collections(self):
        response = self.client.get('/api/collection/featured/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['name'], "Bộ sách lớp 1")

    def test_create_collection_permissions(self):
        data = {'name': 'Sách lập trình hay', 'description': 'Test collection'}

        self.client.force_authenticate(user=self.reader)
        resp_forbidden = self.client.post('/api/collection/', data)
        self.assertEqual(resp_forbidden.status_code, status.HTTP_403_FORBIDDEN)


        self.client.force_authenticate(user=self.librarian)
        resp_success = self.client.post('/api/collection/', data)
        self.assertEqual(resp_success.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Collection.objects.count(), 2)
        new_collection = Collection.objects.get(name='Sách lập trình hay')
        self.assertEqual(new_collection.curator, self.librarian)

    def test_add_book_to_collection_success(self):
        self.client.force_authenticate(user=self.librarian)

        response = self.client.post(
            f'/api/collection/{self.collection.id}/add-book/',
            {'book_id': self.book1.id}
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CollectionBook.objects.count(), 1)
        self.assertEqual(self.collection.book_count, 1)

    def test_add_duplicate_book_to_collection(self):
        self.client.force_authenticate(user=self.librarian)

        self.client.post(f'/api/collection/{self.collection.id}/add-book/', {'book_id': self.book1.id})

        response = self.client.post(f'/api/collection/{self.collection.id}/add-book/', {'book_id': self.book1.id})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('đã có trong bộ sưu tập', response.data['detail'])
        self.assertEqual(CollectionBook.objects.count(), 1)

    def test_remove_book_from_collection(self):

        CollectionBook.objects.create(collection=self.collection, book=self.book1)

        self.client.force_authenticate(user=self.librarian)

        response = self.client.post(
            f'/api/collection/{self.collection.id}/remove-book/',
            {'book_id': self.book1.id}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(CollectionBook.objects.count(), 0)

    def test_remove_nonexistent_book(self):
        self.client.force_authenticate(user=self.librarian)

        response = self.client.post(
            f'/api/collection/{self.collection.id}/remove-book/',
            {'book_id': self.book2.id}
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('không có trong bộ sưu tập', response.data['detail'])