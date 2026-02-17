import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { 
    LogOut, 
    X, 
    LayoutDashboard, 
    User, 
    Briefcase, 
    FileText, 
    Star, 
    MessageSquare, 
    Settings 
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const navItems = [
        { path: "/worker", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
        { path: "/worker/profile", label: "Mon Profil", icon: User },
        { path: "/worker/missions", label: "Mes Missions", icon: Briefcase },
        { path: "/worker/invoices", label: "Mes factures", icon: FileText },
        { path: "/worker/ratings", label: "Mes avis", icon: Star },
        { path: "/worker/support", label: "Support", icon: MessageSquare },
        { path: "/worker/settings", label: "Paramètres", icon: Settings },
    ];

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    };

    const firstName = user?.first_name || user?.firstName || "";
    const lastName = user?.last_name || user?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim() || user?.name || "Utilisateur";
    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "U";
    const avatarUrl = user?.avatar_url || user?.avatar || user?.photo_url || user?.profile_picture || "";

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`fixed left-0 top-0 z-50 h-full w-72 transform border-r border-slate-100 bg-white transition-transform duration-300 lg:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-full flex-col">
                    <div className="shrink-0 p-8 border-b border-slate-50">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-brand/10 bg-slate-50 shrink-0 shadow-sm">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={fullName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-brand/5 text-brand font-black text-xl">
                                            {initials}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="lg:hidden rounded-xl p-2 text-slate-400 hover:bg-slate-50"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <div className="min-w-0">
                                <h3 className="font-black text-slate-900 truncate text-base tracking-tight">
                                    {firstName} {lastName}
                                </h3>
                                <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mt-0.5">
                                    Shifte
                                </p>
                            </div>
                        </div>
                    </div>

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
                                            ? "bg-brand text-white shadow-xl shadow-brand/20"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                >
                                    <Icon className={`h-5 w-5 ${active ? "text-white" : "text-brand"}`} />
                                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

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
