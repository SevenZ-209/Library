import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-secondary-container/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] bg-primary-fixed/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-md glass-card p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tighter">
            DigiLib
          </h1>
          <p className="text-xs uppercase tracking-widest text-on-surface-variant mt-1 font-[family-name:var(--font-label)]">
            The Curated Archive
          </p>
        </div>

        <Outlet />
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 bg-surface-container-low py-4">
        <div className="flex flex-wrap justify-center gap-6 px-4">
          <a href="#" className="text-[10px] uppercase tracking-widest text-outline hover:text-primary transition-colors font-[family-name:var(--font-label)]">
            Privacy
          </a>
          <a href="#" className="text-[10px] uppercase tracking-widest text-outline hover:text-primary transition-colors font-[family-name:var(--font-label)]">
            Terms
          </a>
          <a href="#" className="text-[10px] uppercase tracking-widest text-outline hover:text-primary transition-colors font-[family-name:var(--font-label)]">
            Institutional Access
          </a>
          <a href="#" className="text-[10px] uppercase tracking-widest text-outline hover:text-primary transition-colors font-[family-name:var(--font-label)]">
            Contact
          </a>
        </div>
      </footer>
    </div>
  );
}
