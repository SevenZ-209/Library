export function Footer() {
  return (
    <footer className="bg-surface-container-low py-12 px-12 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-screen-2xl mx-auto gap-6">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <span className="font-headline font-bold text-lg text-on-surface tracking-tight">
            DigiLib
          </span>
          <p className="text-[10px] uppercase tracking-widest text-on-surface/40 font-[family-name:var(--font-label)]">
            © 2024 DigiLib. Thư Viện Số. Mọi quyền được bảo lưu.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {['Kho sách', 'Quyền riêng tư', 'Điều khoản', 'Hỗ trợ', 'Liên hệ'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-[10px] uppercase tracking-widest text-on-surface/40 hover:text-primary transition-all duration-300 font-[family-name:var(--font-label)]"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
