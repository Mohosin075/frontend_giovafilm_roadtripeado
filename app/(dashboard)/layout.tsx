import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardRoleGuard } from "@/components/dashboard/dashboard-role-guard";
import DashTopHeader from "@/components/dashboard/dash-top-header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="bg-[#F5F6FA] dark:bg-[#070a12] h-[100dvh] w-full overflow-hidden">
      <div className="flex w-full h-full min-w-0 overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <DashTopHeader />
          <main className="flex-1 min-h-0 p-3 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden bg-[#F5F6FA] dark:bg-[#0b0f19] w-full transition-colors">
            <DashboardRoleGuard>{children}</DashboardRoleGuard>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
