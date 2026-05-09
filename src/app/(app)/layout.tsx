import { AppHeader } from "@/components/shell/AppHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]" style={{ background: "#f5f5f5" }}>
      <AppHeader />
      <main id="main-content" className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
