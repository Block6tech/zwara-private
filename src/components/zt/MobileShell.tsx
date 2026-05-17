import { ReactNode } from "react";

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-hero flex items-start md:items-center justify-center md:py-10 lg:py-6">
      <div
        className="
          relative w-full bg-background overflow-hidden flex flex-col
          md:max-w-[420px] md:rounded-[2.5rem] md:shadow-float md:border md:border-border md:h-[860px]
          lg:max-w-6xl lg:rounded-3xl lg:h-[min(940px,94vh)]
        "
      >
        {/* Notch — only on tablet-style phone preview, not desktop */}
        <div className="hidden md:block lg:hidden absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-foreground/90 rounded-b-2xl z-50" />
        {children}
      </div>
    </div>
  );
}
