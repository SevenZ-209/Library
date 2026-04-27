from django.core.management.base import BaseCommand
from faker import Faker
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

from digilib_core.models import Category, Book, BorrowRecord, Tag

User = get_user_model()


class Command(BaseCommand):
    help = 'Tự động sinh dữ liệu giả cho Database (Sách, Thể loại, Tag, Phiếu mượn)'

    def handle(self, *args, **kwargs):
        fake = Faker('vi_VN')

        self.stdout.write('Đang tạo Thể loại (Categories)...')
        category_names = [
            'Khoa học máy tính', 'Lập trình Web', 'Trí tuệ nhân tạo',
            'Thiết kế Hệ thống', 'Cơ sở dữ liệu', 'Kiến trúc phần mềm'
        ]
        cat_objs = []
        for name in category_names:
            cat, created = Category.objects.get_or_create(name=name)
            cat_objs.append(cat)

        self.stdout.write('Đang tạo Tags...')
        tag_names = ['Sách mới', 'Bán chạy', 'Kinh điển', 'Tham khảo', 'Nổi bật']
        tag_objs = []
        for tag_name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=tag_name)
            tag_objs.append(tag)

        self.stdout.write('Đang tạo 50 cuốn sách và gắn Tag ngẫu nhiên...')
        books = []
        for _ in range(50):
            total = random.randint(5, 20)
            book = Book.objects.create(
                title=fake.sentence(nb_words=6).replace('.', ''),
                author=fake.name(),
                category=random.choice(cat_objs),
                description=f"<p>{fake.paragraph(nb_sentences=5)}</p>",
                total_copies=total,
                available_copies=random.randint(0, total),
            )

            random_tags = random.sample(tag_objs, k=random.randint(1, 3))
            book.tags.set(random_tags)

            books.append(book)

        self.stdout.write('Đang tạo 100 phiếu mượn...')

        test_user, _ = User.objects.get_or_create(
            username='khach_hang_test',
            defaults={'email': 'test@gmail.com', 'role': 'reader', 'phone': '0123456789'}
        )
        test_user.set_password('1')
        test_user.save()

        statuses = ['borrowed', 'returned', 'overdue']
        for _ in range(100):
            fake_borrow_date = timezone.now() - timedelta(days=random.randint(1, 40))
            fake_due_date = fake_borrow_date + timedelta(days=14)
            current_status = random.choice(statuses)

            fake_return_date = None
            if current_status == 'returned':
                fake_return_date = fake_due_date - timedelta(days=random.randint(1, 5))

            br = BorrowRecord.objects.create(
                user=test_user,
                book=random.choice(books),
                due_date=fake_due_date,
                status=current_status,
                note=fake.sentence() if random.random() > 0.5 else ''
            )

            BorrowRecord.objects.filter(id=br.id).update(
                borrow_date=fake_borrow_date,
                return_date=fake_return_date
            )

        self.stdout.write(self.style.SUCCESS('🎉 HOÀN TẤT! Đã gán Tag thành công cho toàn bộ Sách.'))