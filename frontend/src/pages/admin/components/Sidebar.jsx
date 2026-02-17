import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { 
    LogOut, 
    X,
    LayoutDashboard,
    LifeBuoy,
    Users,
    Shield,
    Star,
    DollarSign,
    Settings,
    ClipboardList,
    Bell
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const navItems = [
        { path: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
        { path: "/admin/verifications", label: "Vérifications", icon: Shield },
        { path: "/admin/users", label: "Utilisateurs", icon: Users },
        // L'onglet Litiges a été retiré comme demandé
        { path: "/admin/support", label: "Support", icon: LifeBuoy },
        { path: "/admin/reviews", label: "Avis", icon: Star },
        { path: "/admin/revenue", label: "Revenus", icon: DollarSign },
        { path: "/admin/notifications", label: "Notifications", icon: Bell },
        { path: "/admin/audit", label: "Audit", icon: ClipboardList },
        { path: "/admin/settings", label: "Paramètres", icon: Settings },
    ];

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-100 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-8 border-b border-slate-50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                                <span className="font-black text-white text-xs">MS</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="lg:hidden text-slate-400 hover:text-slate-900"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div>
                            <h2 className="font-black text-slate-900 tracking-tighter">ADMINISTRATION</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 truncate">
                                {user?.email || "admin@myshifters.com"}
                            </p>
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
                                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                                        active
                                            ? "bg-brand text-white shadow-xl shadow-brand/20"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${active ? "text-white" : "text-brand"}`} />
                                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-50">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 px-5 py-4 w-full text-red-500 font-bold text-sm transition-all hover:bg-red-50 rounded-2xl"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
