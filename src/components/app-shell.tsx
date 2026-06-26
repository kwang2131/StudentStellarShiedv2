import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-[1780px] gap-5 px-3 py-3 md:px-5 xl:gap-6">
        <Sidebar />
        <div className="flex min-h-[calc(100vh-1.5rem)] flex-1 flex-col overflow-hidden rounded-[2.25rem] border border-white/75 bg-white/62 shadow-[0_24px_80px_rgba(8,20,42,0.12)] backdrop-blur-xl">
          <Topbar />
          <main className="flex-1 px-4 pb-28 pt-4 md:px-7 md:pb-8 xl:px-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
