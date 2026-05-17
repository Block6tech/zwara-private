import { ReactNode } from "react";

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-hero flex items-start justify-center">
      <div className="relative w-full max-w-6xl bg-background overflow-hidden flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
