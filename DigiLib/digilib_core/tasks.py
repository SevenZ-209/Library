from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from .models import BorrowRecord, Notification

@shared_task
def check_overdue_books_and_notify():
    now = timezone.now()
    
    overdue_records = BorrowRecord.objects.filter(status='borrowed', due_date__lt=now)
    for record in overdue_records:
        record.status = 'overdue'
        record.save()
        
        Notification.objects.create(
            user=record.user,
            title='Cảnh báo quá hạn trả sách',
            message=f'Cuốn sách "{record.book.title}" của bạn đã quá hạn trả ({record.due_date.strftime("%d/%m/%Y")}). Vui lòng trả sách sớm nhất có thể.'
        )
        
        if record.user.email:
            send_mail(
                subject='[DigiLib] Cảnh báo quá hạn trả sách!',
                message=f'''Chào {record.user.username},

                            Chúng tôi nhận thấy cuốn sách "{record.book.title}" bạn mượn vào ngày {record.borrow_date.strftime("%d/%m/%Y")} đã quá hạn trả (hạn trả: {record.due_date.strftime("%d/%m/%Y")}).
                            Vui lòng mang sách đến trả tại thư viện trong thời gian sớm nhất để tránh bị phạt.

                            Trân trọng,
                            Đội ngũ DigiLib
                        ''',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[record.user.email],
                fail_silently=True,
            )

    tomorrow = now + timedelta(days=1)
    due_soon_records = BorrowRecord.objects.filter(
        status='borrowed', 
        due_date__gte=now,
        due_date__lte=tomorrow
    )
    for record in due_soon_records:
        Notification.objects.create(
            user=record.user,
            title='Sắp đến hạn trả sách',
            message=f'Cuốn sách "{record.book.title}" sẽ đến hạn trả vào ngày mai ({record.due_date.strftime("%d/%m/%Y")}).'
        )
        
        if record.user.email:
            send_mail(
                subject='[DigiLib] Nhắc nhở sắp đến hạn trả sách!',
                message=f'''Chào {record.user.username},

                            Chúng tôi xin nhắc bạn rằng cuốn sách "{record.book.title}" sẽ đến hạn trả vào ngày mai ({record.due_date.strftime("%d/%m/%Y %H:%M")}).
                            Vui lòng sắp xếp thời gian trả sách đúng hạn.

                            Trân trọng,
                            Đội ngũ DigiLib
                        ''',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[record.user.email],
                fail_silently=True,
            )
    
    return f"Processed {overdue_records.count()} overdue and {due_soon_records.count()} due soon records."
