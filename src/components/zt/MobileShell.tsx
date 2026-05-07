import { ReactNode } from "react";

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-hero flex items-start md:items-center justify-center md:py-10">
      <div className="relative w-full md:max-w-[420px] md:rounded-[2.5rem] md:shadow-float bg-background md:border md:border-border overflow-hidden md:h-[860px] flex flex-col">
        {/* Notch */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-foreground/90 rounded-b-2xl z-50" />
        {children}
      </div>
    </div>
  );
}
