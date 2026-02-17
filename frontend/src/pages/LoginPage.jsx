import { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Globe,
  Sun,
  Moon,
  Clock,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

const ASSETS = {
  bg: "/assets/img/pexels-cottonbro-5371676.jpg",
  flagFR: "/assets/img/drapeau-fr.webp",
  flagEN: "/assets/img/drapeau-uk.webp",
  logo: "/assets/img/logo.webp",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();

  const lang = i18n.language?.startsWith("en") ? "en" : "fr";

  const copy = useMemo(() => {
    const fr = {
      back: "Retour à l’accueil",
      title: "Connexion",
      subtitle: "Entrez vos identifiants pour accéder à votre espace.",
      email: "Email",
      password: "Mot de passe",
      remember: "Se souvenir de moi",
      forgot: "Mot de passe oublié ?",
      submit: "Se connecter",
      noAccount: "Pas encore de compte ?",
      register: "Créer un compte",
      heroTitle: "L’excellence hôtelière, sans friction",
      heroDesc: "Connectez-vous pour gérer vos missions, vos demandes et vos équipes.",
      success: "Connexion réussie !",
      invalid: "Identifiants invalides",
      stats: [
        { icon: Clock, label: "Réactivité", value: "24h", color: "from-brand/15", iconColor: "text-brand" },
        { icon: ShieldCheck, label: "Sélection & standards", value: "Qualité", color: "from-emerald-500/15", iconColor: "text-emerald-600" },
        { icon: CheckCircle, label: "Process rapide", value: "Simple", color: "from-amber-500/15", iconColor: "text-amber-600" },
      ],
    };

    const en = {
      back: "Back to home",
      title: "Sign in",
      subtitle: "Enter your details to access your dashboard.",
      email: "Email",
      password: "Password",
      remember: "Remember me",
      forgot: "Forgot password?",
      submit: "Sign in",
      noAccount: "No account yet?",
      register: "Create an account",
      heroTitle: "Hospitality excellence, frictionless",
      heroDesc: "Sign in to manage requests, shifts and your team.",
      success: "Signed in successfully!",
      invalid: "Invalid credentials",
      stats: [
        { icon: Clock, label: "Responsiveness", value: "24h", color: "from-brand/15", iconColor: "text-brand" },
        { icon: ShieldCheck, label: "Selection & standards", value: "Quality", color: "from-emerald-500/15", iconColor: "text-emerald-600" },
        { icon: CheckCircle, label: "Fast process", value: "Simple", color: "from-amber-500/15", iconColor: "text-amber-600" },
      ],
    };

    return lang === "en" ? en : fr;
  }, [lang]);

  const isLight = theme === "light";

  const topBtnClass = isLight
      ? "inline-flex items-center gap-2 rounded-lg border bg-background/70 px-3 py-2 text-sm text-foreground/80 backdrop-blur hover:bg-background/80"
      : "inline-flex items-center gap-2 rounded-lg border bg-background/25 px-3 py-2 text-sm text-white/85 backdrop-blur hover:bg-background/35";

  const topIconBtnClass = isLight
      ? "inline-flex items-center justify-center rounded-lg border bg-background/70 p-2 text-foreground/80 backdrop-blur hover:bg-background/80"
      : "inline-flex items-center justify-center rounded-lg border bg-background/25 p-2 text-white/85 backdrop-blur hover:bg-background/35";

  const bgGradientClass = isLight
      ? "absolute inset-0 bg-gradient-to-b from-white/60 via-white/55 to-white/70"
      : "absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/80";

  const radialClass = isLight
      ? "absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.10),transparent_40%)]"
      : "absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.18),transparent_40%)]";

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const toggleShowPassword = useCallback(() => {
    setShowPassword((v) => !v);
  }, []);

  const toggleLang = useCallback(() => {
    i18n.changeLanguage(lang === "en" ? "fr" : "en");
  }, [i18n, lang]);

  const handleSubmit = useCallback(
      async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        try {
          const user = await login(formData.email, formData.password);
          toast.success(copy.success);
          const role = user?.role;
          navigate(role === "admin" ? "/admin" : role === "hotel" ? "/hotel" : "/worker");
        } catch (error) {
          toast.error(error?.response?.data?.detail || copy.invalid);
        } finally {
          setLoading(false);
        }
      },
      [formData.email, formData.password, login, navigate, loading, copy]
  );

  return (
      <div className="relative min-h-screen text-foreground">
        {/* Background (image only) */}
        <div className="absolute inset-0 -z-10">
          <img
              src={ASSETS.bg}
              alt=""
              className="h-full w-full object-cover"
              loading="eager"
          />
        </div>

        {/* Foreground */}
        <div className="relative z-10">
          {/* Top bar */}
          <div className="absolute left-0 right-0 top-0 z-20">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <Link to="/" className={topBtnClass} data-testid="back-link">
                <ArrowLeft className="h-4 w-4" />
                {copy.back}
              </Link>

              <div className="flex items-center gap-2">
                <button onClick={toggleLang} className={topBtnClass} aria-label="Toggle language">
                  <img
                      src={lang === "en" ? ASSETS.flagEN : ASSETS.flagFR}
                      alt={lang === "en" ? "English" : "Français"}
                      className="h-4 w-4 rounded-sm object-cover"
                  />
                  <span className="hidden sm:inline">{lang === "en" ? "EN" : "FR"}</span>
                  <Globe className={`h-4 w-4 ${isLight ? "opacity-70" : "opacity-80"}`} />
                </button>

                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className={topIconBtnClass}
                    aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
              {/* Left marketing */}
              <div className="hidden lg:block">
                <div className="max-w-lg">
                  <div
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm backdrop-blur ${
                          isLight ? "bg-background/60 text-foreground/80" : "bg-background/20 text-white/85"
                      }`}
                  >
                    <img
                        src={ASSETS.logo}
                        alt="MyShifters"
                        className="h-6 w-6 rounded-md object-contain"
                    />
                    <span className="font-semibold">
                MyShifters<span className="text-blue-500">.</span>
              </span>
                  </div>

                  <h1
                      className={`mt-6 text-4xl font-semibold tracking-tight ${
                          isLight ? "text-foreground" : "text-white"
                      }`}
                  >
                    {copy.heroTitle}
                  </h1>
                  <p className={`mt-4 text-lg ${isLight ? "text-foreground/70" : "text-white/75"}`}>
                    {copy.heroDesc}
                  </p>

                  {/* Stats cards */}
                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {copy.stats.map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                          <div
                              key={idx}
                              className={`
                      rounded-2xl border p-4 backdrop-blur
                      bg-gradient-to-br ${stat.color}
                      ${isLight ? "to-background/30 border-background/40" : "to-background/20 border-white/10"}
                    `}
                          >
                            <div className="flex items-center gap-2 font-medium">
                              <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                              <span className={isLight ? "text-foreground" : "text-white"}>
                        {stat.value}
                      </span>
                            </div>
                            <div className={`mt-1 text-xs ${isLight ? "text-muted-foreground" : "text-white/70"}`}>
                              {stat.label}
                            </div>
                          </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right form card */}
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-md">
                  <div className="rounded-3xl border bg-background/55 p-6 shadow-2xl backdrop-blur sm:p-8">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 ring-1 ring-blue-500/20">
                        <img src={ASSETS.logo} alt="" className="h-7 w-7 object-contain" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-foreground">
                          MyShifters<span className="text-blue-500">.</span>
                        </div>
                        <div className="text-sm text-foreground/70">{copy.title}</div>
                      </div>
                    </div>

                    <h2 className="mt-6 text-2xl font-semibold tracking-tight">{copy.title}</h2>
                    <p className="mt-2 text-sm text-foreground/70">{copy.subtitle}</p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5" data-testid="login-form">
                      <div className="space-y-2">
                        <Label htmlFor="email">{copy.email}</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={lang === "en" ? "you@email.com" : "votre@email.com"}
                            value={formData.email}
                            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                            required
                            data-testid="email-input"
                            autoComplete="email"
                            className={isLight ? "bg-background/70" : "bg-background/40"}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">{copy.password}</Label>
                        <div className="relative">
                          <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={formData.password}
                              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                              required
                              data-testid="password-input"
                              autoComplete="current-password"
                              className={`${isLight ? "bg-background/70" : "bg-background/40"} pr-10`}
                          />
                          <button
                              type="button"
                              onClick={toggleShowPassword}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-sm text-foreground/80 dark:text-foreground/75">
                          <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} />
                          <span>{copy.remember}</span>
                        </label>

                        <Link
                            to="/forgot-password"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                          {copy.forgot}
                        </Link>
                      </div>

                      <Button
                          type="submit"
                          disabled={loading}
                          className="w-full rounded-2xl py-6 font-semibold"
                          data-testid="login-submit"
                      >
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              {lang === "en" ? "Signing in..." : "Connexion..."}
                    </span>
                        ) : (
                            copy.submit
                        )}
                      </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-foreground/80">
                      {copy.noAccount}{" "}
                      <Link
                          to="/register"
                          className="font-semibold text-blue-500 hover:text-blue-600 hover:underline"
                          data-testid="register-link"
                      >
                        {copy.register}
                      </Link>
                    </p>
                  </div>

                  <div className={`mt-4 text-center text-xs lg:hidden ${isLight ? "text-foreground/60" : "text-white/60"}`}>
                    MyShifters<span className="text-blue-400">.</span> —{" "}
                    {lang === "en" ? "Hospitality staffing" : "Renfort hôtelier"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


  );
}

//TODO FIX BACKGROUND IMAGE : Webp FORMAT NOT WORKING, PUT A JPEG INSTEAD