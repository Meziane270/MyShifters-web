import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Building2, User, Globe, Sun, Moon } from "lucide-react";

// Composants extraits
import HotelRegistration from "./HotelRegistration";
import WorkerRegistration from "./WorkerRegistration";

const ASSETS = {
  hotelBg: "/assets/img/register/hotel.jpg",
  shifterBg: "/assets/img/register/shifters.jpg",
  flagFR: "/assets/img/drapeau-fr.webp",
  flagEN: "/assets/img/drapeau-uk.webp",
  logo: "/assets/img/logo.webp",
};

function HandshakeMark() {
  return (
      <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" aria-hidden="true">
        <path
            d="M22 36l6 6c2 2 6 2 8 0l10-10c2-2 2-6 0-8l-4-4"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
        />
        <path
            d="M10 30l12-12c2-2 6-2 8 0l4 4"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
        />
        <path
            d="M54 34L42 46c-2 2-6 2-8 0l-2-2"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M14 34l8 8"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.9"
        />
      </svg>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();

  const lang = i18n.language?.startsWith("en") ? "en" : "fr";

  // ========== CONTENU I18N ==========
  const copy = useMemo(() => {
    const fr = {
      backHome: "Retour à l’accueil",
      choose: "Choisissez votre profil",
      hotel: "Je suis un Hôtel",
      shifter: "Je suis un Shifter",
      hotelDesc: "Publiez vos besoins et trouvez des extras qualifiés rapidement.",
      shifterDesc: "Accédez aux meilleures missions dans l’hôtellerie premium.",
      mid: "MyShifters",
      midTag: "La plateforme qui connecte les hôtels et les meilleurs extras.",
      formTitleHotel: "Inscription Hôtel",
      formTitleShifter: "Inscription Shifter",
      formSub: "Remplissez vos informations. Cela prend 2 minutes.",

      first_name: "Prénom",
      last_name: "Nom",
      email: "Email",
      phone: "Téléphone",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      date_of_birth: "Date de naissance",
      address: "Adresse",
      city: "Ville",
      postal_code: "Code postal",

      hotel_name: "Nom de l’établissement",
      hotel_address: "Adresse",

      has_ae_status: "Avez-vous le statut AE (auto-entrepreneur) ?",
      siret: "SIRET",
      billing_address: "Adresse de facturation",
      billing_city: "Ville",
      billing_postal_code: "Code postal",
      same_as_personal: "Même que l'adresse personnelle",
      cv_pdf: "CV (PDF)",

      back: "Retour",
      submit: "Créer mon compte",
      hasAccount: "Déjà un compte ?",
      login: "Se connecter",

      placeholders: {
        first_name: "Jean",
        last_name: "Dupont",
        email: "votre@email.com",
        phone: "+33 6 12 34 56 78",
        password: "••••••••",
        confirmPassword: "••••••••",
        date_of_birth: "",
        address: "Votre adresse",
        city: "Paris",
        postal_code: "75001",
        hotel_name: "Hôtel Le Grand Paris",
        hotel_address: "123 Avenue des Champs-Élysées",
        siret: "123 456 789 00012",
        billing_address: "Adresse de facturation",
        billing_city: "Paris",
        billing_postal_code: "75001",
      },

      validation: {
        confirmPassword: {
          required: "Veuillez confirmer le mot de passe",
          mismatch: "Les mots de passe ne correspondent pas",
        },
      },

      errors: { generic: "Erreur lors de l’inscription" },
      success: "Compte créé avec succès !",
    };

    const en = {
      backHome: "Back to home",
      choose: "Choose your profile",
      hotel: "I’m a Hotel",
      shifter: "I’m a Shifter",
      hotelDesc: "Post staffing needs and find vetted extras fast.",
      shifterDesc: "Access the best hospitality gigs.",
      mid: "MyShifters",
      midTag: "The platform connecting hotels with top extra staff.",
      formTitleHotel: "Hotel Sign up",
      formTitleShifter: "Shifter Sign up",
      formSub: "Fill in your details. It takes 2 minutes.",

      first_name: "First name",
      last_name: "Last name",
      email: "Email",
      phone: "Phone",
      password: "Password",
      confirmPassword: "Confirm password",
      date_of_birth: "Date of birth",
      address: "Address",
      city: "City",
      postal_code: "Postal code",

      hotel_name: "Property name",
      hotel_address: "Address",

      has_ae_status: "Are you a micro-entrepreneur (AE)?",
      siret: "SIRET",
      billing_address: "Billing address",
      billing_city: "City",
      billing_postal_code: "Postal code",
      same_as_personal: "Same as personal address",
      cv_pdf: "Resume (PDF)",

      back: "Back",
      submit: "Create account",
      hasAccount: "Already have an account?",
      login: "Log in",

      placeholders: {
        first_name: "John",
        last_name: "Doe",
        email: "you@email.com",
        phone: "+33 6 12 34 56 78",
        password: "••••••••",
        confirmPassword: "••••••••",
        date_of_birth: "",
        address: "Your address",
        city: "Paris",
        postal_code: "75001",
        hotel_name: "Hotel Aurora",
        hotel_address: "123 Main Street",
        siret: "123 456 789 00012",
        billing_address: "Billing address",
        billing_city: "Paris",
        billing_postal_code: "75001",
      },

      validation: {
        confirmPassword: {
          required: "Please confirm your password",
          mismatch: "Passwords do not match",
        },
      },

      errors: { generic: "Could not sign up" },
      success: "Account created successfully!",
    };

    return lang === "en" ? en : fr;
  }, [lang]);

  // ========== STATE ==========
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(searchParams.get("role") || "");

  // Wizard worker – 2 étapes
  const [workerStep, setWorkerStep] = useState(1);
  const workerTotalSteps = 2;
  const workerNextLabel = useMemo(() => (lang === "en" ? "Next" : "Suivant"), [lang]);
  const workerPrevLabel = useMemo(() => (lang === "en" ? "Back" : "Retour"), [lang]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",

    first_name: "",
    last_name: "",
    phone: "",

    hotel_name: "",
    hotel_address: "",
    city: "",
    postal_code: "",

    // Worker
    experience_years: 0,
    address: "",
    date_of_birth: "",

    // Étape 2 – Statut AE
    has_ae_status: false,
    siret: "",
    billing_address: "",
    billing_city: "",
    billing_postal_code: "",
    same_as_personal: false,

    cv_pdf: null,
  });

  // ========== PARAMÈTRE D'URL ==========
  const roleParam = searchParams.get("role");
  useEffect(() => {
    if (roleParam === "worker") setRole("worker");
    if (roleParam === "hotel") setRole("hotel");
    if (roleParam === "worker" || roleParam === "hotel") {
      setStep(2);
      setWorkerStep(1);
    }
  }, [roleParam]);

  // ========== HANDLERS PARTAGÉS ==========
  const toggleLang = useCallback(() => {
    i18n.changeLanguage(lang === "en" ? "fr" : "en");
  }, [i18n, lang]);

  const handleRoleSelect = useCallback((selectedRole) => {
    setRole(selectedRole);
    setStep(2);
    setWorkerStep(1);
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((v) => !v);
  }, []);

  const handleBackToRoleSelection = useCallback(() => {
    setStep(1);
    setRole("");
    setWorkerStep(1);
  }, []);

  const handleSkillToggle = useCallback((skillId) => {
    setFormData((prev) => {
      const skills = prev.skills || [];
      const newSkills = skills.includes(skillId)
        ? skills.filter((s) => s !== skillId)
        : [...skills, skillId];
      return { ...prev, skills: newSkills };
    });
  }, []);

  // ========== SOUMISSION ==========
  const handleSubmit = useCallback(
      async (e) => {
        e.preventDefault();
        if (loading) return;

        // ✅ CONFIRM PASSWORD CHECK (worker + hotel)
        if (!formData.confirmPassword) {
          toast.error(
              copy.validation?.confirmPassword?.required ||
              (lang === "en" ? "Please confirm your password" : "Veuillez confirmer le mot de passe")
          );
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error(
              copy.validation?.confirmPassword?.mismatch ||
              (lang === "en" ? "Passwords do not match" : "Les mots de passe ne correspondent pas")
          );
          return;
        }

        setLoading(true);
        try {
          if (role === "worker") {
            const fd = new FormData();

            fd.append("role", "worker");
            fd.append("email", formData.email);
            fd.append("password", formData.password);
            fd.append("first_name", formData.first_name || "");
            fd.append("last_name", formData.last_name || "");
            if (formData.phone) fd.append("phone", formData.phone);
            if (formData.address) fd.append("address", formData.address);
            fd.append("date_of_birth", formData.date_of_birth || "");
            fd.append("city", formData.city || "");
            fd.append("postal_code", formData.postal_code || "");
            fd.append("skills", JSON.stringify(formData.skills || []));
            fd.append("experience_years", String(formData.experience_years ?? 0));

            fd.append("has_ae_status", String(formData.has_ae_status || false));
            if (formData.has_ae_status) {
              fd.append("siret", formData.siret || "");
              fd.append("billing_address", formData.billing_address || "");
              fd.append("billing_city", formData.billing_city || "");
              fd.append("billing_postal_code", formData.billing_postal_code || "");
              fd.append("same_as_personal", String(formData.same_as_personal || false));
            }

            if (formData.cv_pdf) fd.append("cv_pdf", formData.cv_pdf);

            await register(fd);
            toast.success(copy.success);
            navigate("/worker");
            return;
          }

          // Hôtel
          const { confirmPassword, ...hotelData } = formData;
          const userData = { ...hotelData, role: "hotel" };
          const user = await register(userData);

          toast.success(copy.success);
          navigate(user?.role === "hotel" ? "/hotel" : "/worker");
        } catch (error) {
          toast.error(error?.response?.data?.detail || copy.errors.generic);
        } finally {
          setLoading(false);
        }
      },
      [formData, role, register, navigate, loading, copy, lang]
  );

  const isHotel = role === "hotel";
  const isWorker = role === "worker";

  return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Top bar */}
        <div className="absolute left-0 right-0 top-0 z-20">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border bg-background/50 px-3 py-2 text-sm text-foreground/80 backdrop-blur hover:bg-background/70"
            >
              <ArrowLeft className="h-4 w-4" />
              {copy.backHome}
            </Link>

            <div className="flex items-center gap-2">
              <button
                  onClick={toggleLang}
                  className="inline-flex items-center gap-2 rounded-lg border bg-background/50 px-3 py-2 text-sm backdrop-blur hover:bg-background/70"
                  aria-label="Toggle language"
              >
                <img
                    src={lang === "en" ? ASSETS.flagEN : ASSETS.flagFR}
                    alt={lang === "en" ? "English" : "Français"}
                    className="h-4 w-4 rounded-sm object-cover"
                />
                <span className="hidden sm:inline">{lang === "en" ? "EN" : "FR"}</span>
                <Globe className="h-4 w-4 opacity-70" />
              </button>

              <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="inline-flex items-center justify-center rounded-lg border bg-background/50 p-2 backdrop-blur hover:bg-background/70"
                  aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Split background */}
        <div className="relative min-h-screen">
          <div className="absolute inset-0 z-0 grid grid-cols-1 lg:grid-cols-2">
            <div className="relative hidden lg:block">
              <img src={ASSETS.hotelBg} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/20" />
            </div>
            <div className="relative hidden lg:block">
              <img src={ASSETS.shifterBg} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/55 to-black/20" />
            </div>
            <div className="relative lg:hidden">
              <img src={ASSETS.hotelBg} alt="" className="h-full w-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
            </div>
          </div>

          {/* Center content */}
          <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
            {step === 1 && (
                <div className="w-full">
                  <div className="mx-auto mb-10 flex max-w-xl flex-col items-center text-center">
                    <div className="inline-flex items-center gap-3 rounded-full border bg-background/30 px-4 py-2 text-sm text-foreground/90 backdrop-blur">
                      <img src={ASSETS.logo} alt="MyShifters" className="h-6 w-6 rounded-md object-contain" />
                      <span className="font-semibold">
                    {copy.mid}
                        <span className="text-blue-500">.</span>
                  </span>
                    </div>
                    <div className="mt-5 flex items-center justify-center gap-3">
                      <div className="rounded-2xl border bg-background/35 p-3 text-foreground backdrop-blur">
                        <HandshakeMark />
                      </div>
                    </div>
                    <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                      {copy.choose}
                    </h1>
                    <p className="mt-3 max-w-lg text-sm text-foreground/70 sm:text-base">{copy.midTag}</p>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {/* HOTEL CARD */}
                    <button
                        type="button"
                        onClick={() => handleRoleSelect("hotel")}
                        className="group relative overflow-hidden rounded-3xl border bg-background/20 p-7 text-left backdrop-blur transition hover:bg-background/25"
                    >
                      <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-transparent" />
                      </div>

                      <div className="relative flex items-start gap-4">
                        <div className="rounded-2xl bg-blue-600/15 p-3 text-blue-700 dark:text-blue-300 ring-1 ring-blue-600/30 transition group-hover:bg-blue-600/25">
                          <Building2 className="h-6 w-6" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h2 className="text-xl font-semibold text-foreground">{copy.hotel}</h2>
                            <span className="rounded-full border border-blue-600/40 bg-blue-600/15 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 opacity-0 transition group-hover:opacity-100">
                          {lang === "en" ? "Continue" : "Continuer"}
                        </span>
                          </div>
                          <p className="mt-2 text-sm text-foreground/70">{copy.hotelDesc}</p>
                        </div>
                      </div>
                    </button>

                    {/* WORKER CARD */}
                    <button
                        type="button"
                        onClick={() => handleRoleSelect("worker")}
                        className="group relative overflow-hidden rounded-3xl border bg-background/20 p-7 text-left backdrop-blur transition hover:bg-background/25"
                    >
                      <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-transparent" />
                      </div>

                      <div className="relative flex items-start gap-4">
                        <div className="rounded-2xl bg-emerald-600/15 p-3 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600/30 transition group-hover:bg-emerald-600/25">
                          <User className="h-6 w-6" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h2 className="text-xl font-semibold text-foreground">{copy.shifter}</h2>
                            <span className="rounded-full border border-emerald-600/40 bg-emerald-600/15 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 opacity-0 transition group-hover:opacity-100">
                          {lang === "en" ? "Continue" : "Continuer"}
                        </span>
                          </div>
                          <p className="mt-2 text-sm text-foreground/70">{copy.shifterDesc}</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  <p className="mt-8 text-center text-sm text-foreground/80 dark:text-foreground/75">
                    {copy.hasAccount}{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline-offset-4 hover:underline transition-colors"
                    >
                      {copy.login}
                    </Link>
                  </p>
                </div>
            )}

            {step === 2 && (
                <div className="w-full max-w-2xl">
                  {isHotel && (
                      <HotelRegistration
                          formData={formData}
                          setFormData={setFormData}
                          loading={loading}
                          showPassword={showPassword}
                          toggleShowPassword={toggleShowPassword}
                          copy={copy}
                          lang={lang}
                          onSubmit={handleSubmit}
                          onBack={handleBackToRoleSelection}
                      />
                  )}

                  {isWorker && (
                      <WorkerRegistration
                          formData={formData}
                          setFormData={setFormData}
                          loading={loading}
                          showPassword={showPassword}
                          toggleShowPassword={toggleShowPassword}
                          copy={copy}
                          lang={lang}
                          workerStep={workerStep}
                          setWorkerStep={setWorkerStep}
                          workerTotalSteps={workerTotalSteps}
                          workerNextLabel={workerNextLabel}
                          workerPrevLabel={workerPrevLabel}
                          onSubmit={handleSubmit}
                          onBack={handleBackToRoleSelection}
                          handleSkillToggle={handleSkillToggle}
                          SERVICE_TYPES={[
                              { id: 'reception', label: 'Réception', icon: '🛎️' },
                              { id: 'housekeeping', label: 'Housekeeping', icon: '🧹' },
                              { id: 'maintenance', label: 'Maintenance', icon: '🛠️' },
                              { id: 'restaurant', label: 'Restauration', icon: '🍽️' }
                          ]}
                      />
                  )}
                </div>
            )}
          </div>
        </div>
      </div>
  );
}
