export default function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="container max-w-6xl flex items-center justify-center">
        <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/70">
          © {new Date().getFullYear()} · KTH Robotics · Stockholm
        </span>
      </div>
    </footer>
  );
}
