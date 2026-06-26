import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 md:px-6">
        <Sidebar />
        <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col rounded-[2rem] border border-white/70 bg-white/55 shadow-[0_24px_80px_rgba(15,30,50,0.08)] backdrop-blur-xl">
          <Topbar />
          <main className="flex-1 px-4 pb-28 pt-4 md:px-8 md:pb-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
