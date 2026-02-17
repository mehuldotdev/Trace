import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./_common/app-sidebar";
import Header from "./_common/header";
import Footer from "./_common/footer";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full max-w-6xl mx-auto flex flex-col">
                <Header
                />
                <div className="flex-1 w-full">{children}</div>
                <Footer />
            </main>

        </SidebarProvider>
    );
}