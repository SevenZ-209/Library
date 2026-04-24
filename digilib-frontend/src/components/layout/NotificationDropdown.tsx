import { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_date: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notification/');
      setNotifications(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/api/notification/mark-all-read/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      handleMarkAllAsRead();
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-label="Thông báo"
        className="p-2 rounded-full hover:bg-teal-50/50 transition-all duration-300 text-primary active:scale-95 relative"
        onClick={handleToggle}
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white/90 backdrop-blur-xl border border-primary/10 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-primary/10 flex justify-between items-center bg-teal-50/30">
            <h3 className="font-headline font-bold text-primary">Thông báo</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-primary/60 cursor-pointer hover:text-primary font-semibold" onClick={handleMarkAllAsRead}>
                Đánh dấu đã đọc
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-on-surface/50 text-sm">
                Không có thông báo nào.
              </div>
            ) : (
              <ul className="flex flex-col">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={cn(
                      'p-4 border-b border-primary/5 hover:bg-teal-50/50 transition-colors cursor-default',
                      !notification.is_read ? 'bg-primary/5' : ''
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={cn('text-sm font-semibold', !notification.is_read ? 'text-primary' : 'text-on-surface/80')}>
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-on-surface/70 leading-relaxed mb-2">
                      {notification.message}
                    </p>
                    <span className="text-[10px] text-on-surface/50 font-medium">
                      {new Date(notification.created_date).toLocaleString('vi-VN')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
