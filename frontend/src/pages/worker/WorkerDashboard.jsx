import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Menu } from "lucide-react";

import Sidebar from "./components/Sidebar";
import WorkerOverview from "./overview/WorkerOverview";
import WorkerProfile from "./profile/WorkerProfile";
import MissionsPage from "./shifts/MissionsPage";
import InvoicesPage from "./invoices/InvoicesPage";
import RatingsPage from "./ratings/RatingsPage";
import SupportPage from "./support/SupportPage";
import SettingsPage from "./settings/SettingsPage";

export default function WorkerDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();
    const { setTheme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role !== "worker") {
            toast.error("Accès non autorisé");
            navigate("/");
        }
        // Toute la partie worker doit être en mode clair - même si la page de connexion est en mode sombre
        setTheme("light");
    }, [user, navigate, setTheme]);

    return (
        <div className="light min-h-screen bg-[#F8FAFC] text-slate-900">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <img src="/assets/img/logo.webp" alt="MyShifters" className="h-8" />
                </div>
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg bg-slate-50 text-slate-600"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            <main className="lg:ml-72 min-h-screen transition-all duration-300">
                <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto">
                    <Routes>
                        <Route index element={<WorkerOverview />} />
                        <Route path="profile" element={<WorkerProfile />} />
                        <Route path="missions" element={<MissionsPage />} />
                        <Route path="invoices" element={<InvoicesPage />} />
                        <Route path="ratings" element={<RatingsPage />} />
                        <Route path="support" element={<SupportPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}
