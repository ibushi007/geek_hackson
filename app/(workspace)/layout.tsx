import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { MobileNav } from "@/components/MobileNav";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-slate-50 lg:pl-64">
      <Sidebar />
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 lg:px-10">
          {children}
        </main>
      </div>
      <MobileNav />
      <Toaster position="top-center" richColors />
    </div>
  );
}
