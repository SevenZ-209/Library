from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.exceptions import ValidationError

from .models import User, Category, Book, BorrowRecord, Tag


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