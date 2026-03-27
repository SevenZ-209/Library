from django.db.models import Count
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action

from digilib_core import serializers, paginators
from digilib_core.models import Category, Book
from digilib_core.permissions import IsLibrarianOrAdmin


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")

class CategoryView(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer
    permission_classes = [permissions.AllowAny]

class BookView(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView, generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Book.objects.select_related('category').filter(active=True).order_by('-id')
    pagination_class = paginators.BookPagination

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return serializers.BookDetailSerializer
        return serializers.BookSerializer

    def get_permissions(self):
        if self.action in ['create', 'partial_update', 'destroy']:
            return [IsLibrarianOrAdmin()]

        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]

        return [permissions.IsAuthenticated()]

    def create(self,request):
        serializer = serializers.BookSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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

    @action(methods=['get'], url_path='dashboard-stats', detail=False)
    def get_dashboard_stats(self, request):
        from digilib_core.models import BorrowRecord

        total_books = Book.objects.count()
        borrowed_books = BorrowRecord.objects.filter(status='borrowed').count()
        overdue_books = BorrowRecord.objects.filter(status='overdue').count()

        return Response({
            'total_books': total_books,
            'borrowed_books': borrowed_books,
            'overdue_books': overdue_books
        }, status=status.HTTP_200_OK)
