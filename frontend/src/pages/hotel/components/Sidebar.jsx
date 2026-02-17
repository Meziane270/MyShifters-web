import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    FileText,
    User as UserIcon,
    Settings,
    LifeBuoy,
    LogOut,
    X,
    ShieldAlert,
    CheckCircle2,
    Star
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const hotelName = user?.hotel_name || user?.name || "Hôtel";
    const avatarUrl = user?.avatar_url || user?.avatar || user?.photo_url || "";
    const initials = hotelName.charAt(0).toUpperCase() || "H";

    const handleLogout = useCallback(() => {
        logout();
        navigate("/");
    }, [logout, navigate]);

    const navItems = useMemo(() => [
        { path: "/hotel", icon: LayoutDashboard, label: "Tableau de bord", exact: true },
        { path: "/hotel/shifts", icon: CalendarDays, label: "Mes missions" },
        { path: "/hotel/applications", icon: Users, label: "Candidatures" },
        { path: "/hotel/invoices", icon: FileText, label: "Mes Factures" },
        { path: "/hotel/ratings", icon: Star, label: "Avis Extras" },
        { path: "/hotel/profile", icon: UserIcon, label: "Mon Profil" },
        { path: "/hotel/settings", icon: Settings, label: "Paramètres" },
        { path: "/hotel/support", icon: LifeBuoy, label: "Support" },
    ], []);

    const isActive = useCallback((item) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    }, [location.pathname]);

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-100 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="h-full flex flex-col">
                    {/* Header: Profil Info */}
                    <div className="shrink-0 p-8 border-b border-slate-50">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-brand/10 bg-slate-50 shrink-0 shadow-sm">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={hotelName} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-brand/5 text-brand font-black text-xl">
                                            {initials}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="lg:hidden rounded-xl p-2 text-slate-400 hover:bg-slate-50"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <div className="min-w-0">
                                <h3 className="font-black text-slate-900 truncate text-base tracking-tight">
                                    {hotelName}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className={`h-1.5 w-1.5 rounded-full ${user?.verification_status === 'verified' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        {user?.verification_status === 'verified' ? 'Établissement Vérifié' : 'En attente de validation'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-6 space-y-2">
                        {navItems.map((item) => {
                            const active = isActive(item);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300 ${
                                        active
                                            ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                >
                                    <Icon className={`h-5 w-5 ${active ? "text-white" : "text-brand"}`} />
                                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer: Logout */}
                    <div className="shrink-0 p-6 border-t border-slate-50">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-red-500 font-bold text-sm transition-all hover:bg-red-50"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
