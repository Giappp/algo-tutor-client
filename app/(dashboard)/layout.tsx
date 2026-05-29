import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AIChatWidget } from "@/components/dashboard/ai-chat-widget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <AIChatWidget />
    </div>
  );
}
