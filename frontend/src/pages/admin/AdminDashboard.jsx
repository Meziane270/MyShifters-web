// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

// Components
import Sidebar from "./components/Sidebar";

// Pages
import AdminOverview from "./overview/AdminOverview";
import AdminSupportInbox from "./support/AdminSupportInbox";
import AdminVerifications from "./verifications/AdminVerifications";
import AdminUsers from "./users/AdminUsers";
import AdminUserDetail from "./users/AdminUserDetail";
import AdminDisputes from "./disputes/AdminDisputes";
import AdminDisputeDetail from "./disputes/AdminDisputeDetail";
import AdminReviews from "./reviews/AdminReviews";
import AdminRevenue from "./revenue/AdminRevenue";
import AdminSettings from "./settings/AdminSettings";
import AdminAuditLog from "./audit/AdminAuditLog";
import AdminNotifications from "./notifications/AdminNotifications";
import AdminShifts from "./shifts/AdminShifts";

export default function AdminDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role !== "admin") {
            toast.error("Accès non autorisé");
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <main className="lg:ml-72 min-h-screen">
                <div className="p-6 lg:p-10">
                    <Routes>
                        <Route index element={<AdminOverview />} />
                        <Route path="support" element={<AdminSupportInbox />} />
                        <Route path="verifications" element={<AdminVerifications />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="users/:userId" element={<AdminUserDetail />} />
                        <Route path="disputes" element={<AdminDisputes />} />
                        <Route path="disputes/:disputeId" element={<AdminDisputeDetail />} />
                        <Route path="reviews" element={<AdminReviews />} />
                        <Route path="revenue" element={<AdminRevenue />} />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route path="audit" element={<AdminAuditLog />} />
                        <Route path="notifications" element={<AdminNotifications />} />
                        <Route path="shifts" element={<AdminShifts />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}