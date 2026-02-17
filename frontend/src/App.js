import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

import HotelDashboard from "./pages/hotel/HotelDashboard";
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import ResetPasswordPage from "./pages/ResetPasswordPage";
// ✅ à créer / brancher
import AdminDashboard from "./pages/admin/AdminDashboard";

import MentionsLegalesPage from "./pages/MentionsLegalesPage";
import PolitiqueDeConfidentialite from "./pages/PolitiqueDeConfidentialite";
import CGU from "./pages/CGU";
import CGS from "./pages/CGS";

import "./App.css";

const roleHome = (role) => {
    if (role === "admin") return "/admin";
    if (role === "hotel") return "/hotel";
    return "/worker";
};

const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    // allowedRole peut être string OU array
    const allowed = Array.isArray(allowedRole) ? allowedRole : allowedRole ? [allowedRole] : null;

    if (allowed && !allowed.includes(user.role)) {
        return <Navigate to={roleHome(user.role)} replace />;
    }

    return children;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (user) {
        return <Navigate to={roleHome(user.role)} replace />;
    }

    return children;
};

function App() {
    return (
        <ThemeProvider attribute="class" defaultTheme="light">
            <div className="App">
                <BrowserRouter>
                    <AuthProvider>
                        <Routes>
                            <Route path="/" element={<LandingPage />} />

                            <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
                            <Route path="/politique-de-confidentialite" element={<PolitiqueDeConfidentialite />} />
                            <Route path="/cgu" element={<CGU />} />
                            <Route path="/cgs" element={<CGS />} />

                            <Route
                                path="/login"
                                element={
                                    <PublicRoute>
                                        <LoginPage />
                                    </PublicRoute>
                                }
                            />

                            <Route
                                path="/forgot-password"
                                element={
                                    <PublicRoute>
                                        <ForgotPasswordPage />
                                    </PublicRoute>
                                }
                            />

                            <Route
                                path="/register"
                                element={
                                    <PublicRoute>
                                        <RegisterPage />
                                    </PublicRoute>
                                }
                            />

                            <Route
                                path="/hotel/*"
                                element={
                                    <ProtectedRoute allowedRole="hotel">
                                        <HotelDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/reset-password/*"
                                element={
                                    <PublicRoute>
                                        <ResetPasswordPage />
                                    </PublicRoute>
                                }
                            />


                            <Route
                                path="/worker/*"
                                element={
                                    <ProtectedRoute allowedRole="worker">
                                        <WorkerDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            {/* ✅ ADMIN */}
                            <Route
                                path="/admin/*"
                                element={
                                    <ProtectedRoute allowedRole="admin">
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            {/* fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>

                        <Toaster position="top-right" theme="system" />
                    </AuthProvider>
                </BrowserRouter>
            </div>
        </ThemeProvider>
    );
}

export default App;
