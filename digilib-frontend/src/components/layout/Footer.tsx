export function Footer() {
  return (
    <footer className="bg-surface-container-low py-12 px-8 mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-7xl mx-auto">
        <div>
          <span className="font-headline font-bold text-xl text-on-surface block mb-2">
            DigiLib
          </span>
          <p className="font-body text-sm leading-relaxed text-on-surface-variant">
            © 2024 The Curated Archive. A Living Gallery of Knowledge.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 md:justify-end">
          <a
            href="#"
            className="font-body text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            Legal
          </a>
          <a
            href="#"
            className="font-body text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            Accessibility
          </a>
          <a
            href="#"
            className="font-body text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            Provenance
          </a>
          <a
            href="#"
            className="font-body text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
