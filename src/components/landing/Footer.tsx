export default function Footer() {
  return (
    <footer className="relative border-t border-border py-8">
      <a
        href="https://kthis.se"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="KTHIS — KTH Industrial Society"
        className="group absolute left-4 top-1/2 -translate-y-1/2 inline-block"
      >
        <span
          aria-hidden="true"
          className="block h-6 w-[98px] bg-muted-foreground/70 transition-colors group-hover:bg-primary"
          style={{
            maskImage: "url(/kthis-logo.svg)",
            WebkitMaskImage: "url(/kthis-logo.svg)",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskPosition: "left center",
            WebkitMaskPosition: "left center",
          }}
        />
      </a>
      <div className="flex justify-center px-32">
        <span className="whitespace-nowrap font-mono text-[10px] tracking-widest uppercase text-muted-foreground/70">
          © {new Date().getFullYear()} · KTH Robotics · Part of KTH Industrial Society · Stockholm
        </span>
      </div>
    </footer>
  );
}
