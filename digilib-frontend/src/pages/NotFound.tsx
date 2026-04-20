import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <span className="material-symbols-outlined text-8xl text-outline mb-6">library_books</span>
      <h1 className="text-6xl font-headline font-extrabold text-on-surface mb-4">404</h1>
      <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Không tìm thấy trang</h2>
      <p className="text-on-surface-variant max-w-md mb-8">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
      </p>
      <Link to="/" className="btn-gradient px-8 py-3 rounded-full">
        Quay lại Trang chủ
      </Link>
    </div>
  );
}
