from datetime import timedelta
from django.db.models.functions import ExtractMonth
from django.db import transaction
from django.db.models import Count
from django.http import HttpResponse
from django.shortcuts import render
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import viewsets, generics, permissions, status, parsers, mixins
from rest_framework.decorators import action
from django.db.models import Q

from digilib_core import serializers, paginators
from digilib_core.models import Category, Book, User, Tag, BorrowRecord, Collection, CollectionBook
from digilib_core.permissions import IsLibrarianOrAdmin
from digilib_core.serializers import BorrowRecordSerializer


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")

class CategoryView(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsLibrarianOrAdmin()]
        return [permissions.AllowAny()]

class BookView(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView, generics.DestroyAPIView):
    queryset = Book.objects.select_related('category').filter(active=True).order_by('-id')
    pagination_class = paginators.BookPagination

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return serializers.BookDetailSerializer
        return serializers.BookSerializer

    def get_permissions(self):
        if self.action in ['create', 'partial_update', 'destroy', 'borrow_book']:
            return [IsLibrarianOrAdmin()]

        if self.action in ['list', 'retrieve', 'get_borrow_history']:
            return [permissions.AllowAny()]

        return [permissions.IsAuthenticated()]

    def create(self,request):
        serializer = serializers.BookSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        book = self.get_object()

        serializer = self.get_serializer(book, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        query =self.queryset

        q= self.request.query_params.get('q')

        if q:
            query = query.filter(title__icontains=q)

        cate_id = self.request.query_params.get('category_id')
        if cate_id:
            query = query.filter(category_id=cate_id)

        is_available = self.request.query_params.get('is_available')
        if is_available and is_available.lower() == 'true':
            query = query.filter(available_copies__gt=0)

        author = self.request.query_params.get('author')
        if author:
            query = query.filter(author__icontains=author)

        order_by = self.request.query_params.get('ordering')
        if order_by:
            if order_by == 'popular':
                query = query.annotate(borrow_count=Count('borrow_records')).order_by('-borrow_count')
            else:
                query = query.order_by(order_by)

        return query

    @action(methods=['get'], url_path='borrow-history', detail=True)
    def get_borrow_history(self, request, pk=None):
        book = self.get_object()
        history = book.borrow_records.all().order_by('-borrow_date')
        serializer = serializers.BorrowRecordSerializer(history, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='borrow', detail=True)
    def borrow_book(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Vui lòng đăng nhập để mượn sách.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        from django.utils import timezone
        from datetime import timedelta

        book = self.get_object()

        if book.available_copies <= 0:
            return Response(
                {'error': 'Sách này hiện không có sẵn để mượn.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        existing_borrow = BorrowRecord.objects.filter(
            user=request.user,
            book=book,
            status='borrowed'
        ).first()

        if existing_borrow:
            return Response(
                {'error': 'Bạn đã mượn cuốn sách này rồi.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        due_date = timezone.now() + timedelta(days=14)
        borrow_record = BorrowRecord.objects.create(
            user=request.user,
            book=book,
            due_date=due_date,
            status='borrowed'
        )

        book.available_copies -= 1
        book.save()

        serializer = serializers.BorrowRecordSerializer(borrow_record)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], url_path='dashboard-stats', detail=False)
    def get_dashboard_stats(self, request):
        total_books = Book.objects.count()
        borrowed_books = BorrowRecord.objects.filter(status='borrowed').count()
        overdue_books = BorrowRecord.objects.filter(status='overdue').count()
        active_users = User.objects.count()
        monthly_stats = BorrowRecord.objects.annotate(
            month=ExtractMonth('borrow_date')
        ).values('month').annotate(
            borrows=Count('id')
        ).order_by('month')

        chart_data = []
        for stat in monthly_stats:
            if stat['month']:
                chart_data.append({
                    'name': f"T{stat['month']}",
                    'borrows': stat['borrows']
                })


        return Response({
            'total_books': total_books,
            'borrowed_books': borrowed_books,
            'overdue_books': overdue_books,
            'active_users': active_users,
            'chart_data': chart_data
        }, status=status.HTTP_200_OK)

class UserView(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            s = serializers.UserSerializer(user, data=request.data, partial=True)
            s.is_valid(raise_exception=True)
            s.save()

        return Response(serializers.UserSerializer(user).data, status=status.HTTP_200_OK)

class TagView(viewsets.ViewSet, generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = serializers.TagSerializer

class BorrowRecordViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = BorrowRecord.objects.all()
    serializer_class = BorrowRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.BookPagination

    def get_queryset(self):
        user = self.request.user
        if user.role in ['librarian', 'admin']:
            return self.queryset.order_by('-borrow_date')
        return self.queryset.filter(user=user).order_by('-borrow_date')

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        user = request.user
        book_id = request.data.get('book_id')

        has_overdue = BorrowRecord.objects.filter(
            Q(user=user) &
            (
                    Q(status='overdue') |
                    Q(status='borrowed', due_date__lt=timezone.now())
            )
        ).exists()

        if has_overdue:
            return Response(
                {"detail": "Tài khoản của bạn đang có sách quá hạn. Vui lòng trả sách trước khi mượn thêm!"},
                status=status.HTTP_403_FORBIDDEN
            )

        active_borrows_count = BorrowRecord.objects.filter(
            user=user,
            status__in=['borrowed', 'pending']
        ).count()

        if active_borrows_count >= 3:
            return Response(
                {
                    "detail": "Bạn đã đạt giới hạn mượn (đang giữ chỗ/mượn tối đa 3 cuốn). Vui lòng trả hoặc hủy sách cũ!"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            book = Book.objects.select_for_update().get(id=book_id)
        except Book.DoesNotExist:
            return Response({"detail": "Sách không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        if book.available_copies <= 0:
            return Response({"detail": "Sách này đã hết bản có sẵn để mượn."}, status=status.HTTP_400_BAD_REQUEST)

        existing_borrow = BorrowRecord.objects.filter(
            user=user, book=book, status__in=['borrowed', 'overdue', 'pending']
        ).exists()

        if existing_borrow:
            return Response({"detail": "Bạn đang mượn hoặc đã đặt giữ chỗ cuốn sách này rồi."},
                            status=status.HTTP_400_BAD_REQUEST)

        book.available_copies -= 1
        book.save()

        temp_due_date = timezone.now() + timedelta(hours=24)

        record = BorrowRecord.objects.create(
            user=user,
            book=book,
            due_date=temp_due_date,
            status='pending'
        )

        serializer = self.get_serializer(record)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='confirm-pickup', permission_classes=[IsLibrarianOrAdmin])
    @transaction.atomic
    def confirm_pickup(self, request, pk=None):
        try:
            record = BorrowRecord.objects.select_for_update().get(pk=pk)
        except BorrowRecord.DoesNotExist:
            return Response({"detail": "Không tìm thấy phiếu mượn."}, status=status.HTTP_404_NOT_FOUND)

        if record.status != 'pending':
            return Response(
                {"detail": "Phiếu này không ở trạng thái chờ nhận sách (pending)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        record.status = 'borrowed'

        record.due_date = timezone.now() + timedelta(days=14)
        record.save()

        return Response({
            "detail": "Xác nhận giao sách thành công. Độc giả chính thức bắt đầu mượn sách.",
            "new_due_date": record.due_date,
            "status": record.status
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='return', permission_classes=[IsLibrarianOrAdmin])
    @transaction.atomic
    def return_book(self, request, pk=None):
        try:
            record = BorrowRecord.objects.select_for_update().get(pk=pk)
        except BorrowRecord.DoesNotExist:
            return Response({"detail": "Không tìm thấy phiếu mượn."}, status=status.HTTP_404_NOT_FOUND)

        if record.status == 'returned':
            return Response({"detail": "Sách này đã được duyệt trả trước đó rồi."}, status=status.HTTP_400_BAD_REQUEST)

        book = Book.objects.select_for_update().get(id=record.book.id)

        record.status = 'returned'
        record.return_date = timezone.now()
        record.save()

        book.available_copies += 1
        book.save()

        return Response({
            "detail": "Đã duyệt trả sách thành công.",
            "book_available_copies": book.available_copies
        }, status=status.HTTP_200_OK)

class NotificationViewSet(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = serializers.NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.notifications.all()

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        unread_notifications = request.user.notifications.filter(is_read=False)
        updated_count = unread_notifications.update(is_read=True)
        return Response({"detail": f"Đã đánh dấu đọc {updated_count} thông báo."}, status=status.HTTP_200_OK)


class CollectionViewSet(mixins.CreateModelMixin, viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Collection.objects.filter(active=True).order_by('-created_date')
    serializer_class = serializers.CollectionSerializer
    pagination_class = paginators.BookPagination

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return serializers.CollectionDetailSerializer
        return serializers.CollectionSerializer

    def perform_create(self, serializer):
        serializer.save(curator=self.request.user)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'add_book', 'remove_book']:
            return [IsLibrarianOrAdmin()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        query = self.queryset

        q = self.request.query_params.get('q')
        if q:
            query = query.filter(name__icontains=q)

        return query

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.updated_date = timezone.now()
        instance.save(update_fields=['updated_date'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(methods=['get'], url_path='featured', detail=False)
    def featured(self, request):
        featured = self.queryset.filter(is_featured=True)[:5]
        serializer = CollectionSerializer(featured, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='add-book', detail=True)
    def add_book(self, request, pk=None):
        collection = self.get_object()
        book_id = request.data.get('book_id')

        if not book_id:
            return Response({'detail': 'book_id là bắt buộc.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            book = Book.objects.get(id=book_id, active=True)
        except Book.DoesNotExist:
            return Response({'detail': 'Sách không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        collection_book, created = CollectionBook.objects.get_or_create(
            collection=collection,
            book=book
        )

        if not created:
            return Response({'detail': 'Sách đã có trong bộ sưu tập.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'detail': 'Đã thêm sách vào bộ sưu tập.'}, status=status.HTTP_201_CREATED)

    @action(methods=['post'], url_path='remove-book', detail=True)
    def remove_book(self, request, pk=None):
        collection = self.get_object()
        book_id = request.data.get('book_id')

        if not book_id:
            return Response({'detail': 'book_id là bắt buộc.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            collection_book = CollectionBook.objects.get(collection=collection, book_id=book_id)
            collection_book.delete()
            return Response({'detail': 'Đã xóa sách khỏi bộ sưu tập.'}, status=status.HTTP_200_OK)
        except CollectionBook.DoesNotExist:
            return Response({'detail': 'Sách không có trong bộ sưu tập.'}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        data = request.data.copy()
        if not data.get('curator') and request.user.is_authenticated:
            data['curator'] = request.user.id

        serializer = CollectionSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        collection = self.get_object()
        serializer = CollectionSerializer(collection, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
