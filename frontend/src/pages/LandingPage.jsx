import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  CheckCircle,
  Clock,
  ShieldCheck,
  BadgeEuro,
  BriefcaseBusiness,
  Headphones,
  Users,
  Hotel,
  BedDouble,
  Utensils,
  Wrench,
  ArrowRight,
  Phone,
  Mail,
  Quote,
  Star,
  BadgeCheck,  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

// ========== CONSTANTES ==========
const ASSETS = {
  logo: "/assets/img/logo.webp",
  flagFR: "/assets/img/drapeau-fr.webp",
  flagEN: "/assets/img/drapeau-uk.webp",
  about1: "/assets/img/about/about-image-1.webp",
  about2: "/assets/img/about/about-image-2.jpg",
  why: "/assets/img/illustration/nous-choisir.webp",
  hero: "/assets/img/misc/image-1.jpg",
};

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ========== HOOK INTERSECTION PERSONNALISÉ ==========
// Remplace react-intersection-observer - 100% maison, zéro dépendance
const useInView = (options = {}) => {
  const [ref, setRef] = useState(null);
  const [inView, setInView] = useState(false);
  const { triggerOnce = true, threshold = 0.1 } = options;

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
        ([entry]) => {
          setInView(entry.isIntersecting);
          if (entry.isIntersecting && triggerOnce) {
            observer.disconnect();
          }
        },
        { threshold }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, triggerOnce, threshold]);

  return { ref: setRef, inView };
};
// ========== CONTENU I18N COMPLET ==========
const CONTENT = {
      fr: {
        nav: {
          home: "Accueil",
          about: "À propos",
          services: "Services",
          why: "Nous choisir",
          reviews: "Avis"
        },
        hero: {
          badge: "✨ Lancement récent",
          title: "L'excellence hôtelière, même en renfort",
          desc: "My Shifters accompagne les hôtels, résidences et établissements haut de gamme dans la gestion de leurs besoins en personnel extra. Réception, restauration, housekeeping ou maintenance : des professionnels opérationnels, disponibles rapidement, pour garantir une expérience client irréprochable.",
          ctaPrimary: "Créer un compte",
          ctaSecondary: "Voir nos services",
          stats: [
            { icon: Clock, label: "Réactivité", value: "24h", color: "from-brand/15", iconColor: "text-brand" },
            { icon: ShieldCheck, label: "Sélection & standards", value: "Qualité", color: "from-emerald-500/15", iconColor: "text-emerald-600" },
            { icon: CheckCircle, label: "Process rapide", value: "Simple", color: "from-amber-500/15", iconColor: "text-amber-600" },
          ]
        },
        about: {
          kicker: "MY SHIFTERS",
          title: "Votre partenaire dans l'hôtellerie",
          text: "MY SHIFTERS est un partenaire spécialisé dans la mise à disposition de personnel hôtelier qualifié en extra. Nous intervenons auprès d'hôtels, résidences et établissements touristiques pour répondre aux pics d'activité, absences imprévues ou besoins ponctuels.",
          bullets: [
            "Des professionnels opérationnels, sélectionnés pour leur savoir-faire",
            "Une réponse rapide et flexible, adaptée à vos contraintes",
            "Un interlocuteur dédié et un suivi qualité",
          ],
          cta: "Voir ce qui nous différencie"
        },
        services: {
          title: "Nos services",
          lead: "Nous couvrons l'ensemble des besoins en extras pour les établissements hôteliers.",
          cta: {
            title: "Besoin de renfort rapidement ?",
            desc: "Créez un compte et demandez des extras en quelques minutes."
          },
          items: [
            {
              icon: Hotel,
              title: "Extras en Réception",
              desc: "Agents d'accueil, night auditors, gestion des arrivées et départs, standard téléphonique et relation client.",
              bullets: [
                "Accueil professionnel et chaleureux",
                "Gestion efficace des check-ins/check-outs",
                "Flexibilité pour missions ponctuelles ou régulières"
              ]
            },
            {
              icon: BedDouble,
              title: "Housekeeping",
              desc: "Femmes et valets de chambre expérimentés, respect des procédures, discrétion et efficacité.",
              bullets: [
                "Nettoyage complet chambres & communs",
                "Respect strict des normes d'hygiène",
                "Discrétion et respect de la vie privée"
              ]
            },
            {
              icon: Wrench,
              title: "Maintenance technique",
              desc: "Interventions rapides, maintenance légère, assistance technique et gestion des urgences.",
              bullets: [
                "Interventions rapides",
                "Préventif & correctif",
                "Électricité, plomberie, climatisation…"
              ]
            },
            {
              icon: Utensils,
              title: "Restauration & salle",
              desc: "Serveurs, runners, barmen pour petits-déjeuners, services à la carte ou événements.",
              bullets: [
                "Service en salle pro",
                "Barmen qualifiés",
                "Standards d'hygiène respectés"
              ]
            }
          ]
        },
        why: {
          title: "Pourquoi choisir My Shifters ?",
          lead: "Découvrez ce qui fait de nous votre partenaire idéal pour le personnel hôtelier extra.",
          text: "Chez MYSHIFTERS, nous ne faisons pas que fournir du personnel. Nous mettons à votre disposition des micro-entrepreneurs qualifiés, disponibles rapidement et sélectionnés pour leur professionnalisme. Notre approche flexible vous permet de faire face aux imprévus, aux pics d'activité et aux besoins saisonniers tout en maintenant un niveau de service irréprochable pour vos clients.",
          points: [
            { icon: Clock, title: "Réactivité 24h", desc: "Intervention en moins de 24h. Disponibilité 7j/7 pour les situations critiques." },
            { icon: Users, title: "Flexibilité", desc: "Durée, compétences, horaires, budget : nous adaptons nos équipes à votre besoin." },
            { icon: ShieldCheck, title: "Qualité", desc: "Extras sélectionnés, formés aux standards hôteliers et régulièrement évalués." },
            { icon: BadgeEuro, title: "Transparence", desc: "Pas de frais cachés. Tarifs clairs et facturation précise." },
            { icon: BriefcaseBusiness, title: "Expertise", desc: "7 ans d'expérience dans le secteur hôtelier : vos contraintes, on les connaît." },
            { icon: Headphones, title: "Accompagnement", desc: "Un interlocuteur dédié et un suivi qualité tout au long de la mission." }
          ]
        },
        reviews: {
          badge: "Avis",
          title: "Ils nous font confiance",
          desc: "Retours de nos partenaires hôteliers.",
          empty: "Aucun avis pour le moment. Revenez bientôt !",
          verified: "Vérifié",
          partner: "Partenaire hôtel",
          response: "Réponse de l'établissement",
          prev: "Précédent",
          next: "Suivant"
        },
        footer: {
          about: "My Shifters accompagne les hôtels, résidences et établissements haut de gamme dans la gestion de leurs besoins en personnel extra.",
          cta: "Demander un extra",
          useful: "Liens utiles",
          ourServices: "Nos services",
          contact: "Contactez-nous",
          availability: "Disponible 7j/7 pour vos besoins urgents",
          emergency: "Urgence personnel ? Appelez-nous !",
          copyright: "Tous droits réservés.",
          bookCall: "Programmer un appel",
          bookCallDesc: "Échangez 30 min avec notre équipe",
          phone: "+33 7 49 06 03 05",
          email: "myshifters-extras@outlook.com",
          links: {
            legal: "Mentions légales",
            privacy: "Politique de confidentialité",
            cgu: "Conditions générales d'utilisation",
            cgs: "Conditions générales de service"
          }
        }
      },
  en: {
    nav: {
      home: "Home",
      about: "About",
      services: "Services",
      why: "Why us",
      reviews: "Reviews"
    },
    hero: {
      badge: "✨ Recently launched",
      title: "Hotel excellence, even when you need reinforcements",
      desc: "My Shifters supports hotels, residences and premium properties with on-demand extra staff. Front desk, F&B, housekeeping or maintenance: ready-to-go professionals, available fast, to keep guest experience flawless.",
      ctaPrimary: "Create account",
      ctaSecondary: "See services",
      stats: [
        { icon: Clock, label: "Responsiveness", value: "24h", color: "from-brand/15", iconColor: "text-brand" },
        { icon: ShieldCheck, label: "Selection & standards", value: "Quality", color: "from-emerald-500/15", iconColor: "text-emerald-600" },
        { icon: CheckCircle, label: "Fast process", value: "Simple", color: "from-amber-500/15", iconColor: "text-amber-600" },
      ]
    },
    about: {
      kicker: "MY SHIFTERS",
      title: "Your hospitality partner",
      text: "MY SHIFTERS specializes in providing qualified hospitality staff for extra shifts. We help properties handle peak activity, last-minute absences, and occasional needs.",
      bullets: [
        "Ready-to-work professionals, carefully selected",
        "Fast, flexible response tailored to your constraints",
        "Dedicated point of contact & quality follow-up"
      ],
      cta: "See why we're different"
    },
    services: {
      title: "Services",
      lead: "We cover all extra-staffing needs for hospitality properties.",
      cta: {
        title: "Need staff quickly?",
        desc: "Create an account and request extra staff in minutes."
      },
      items: [
        {
          icon: Hotel,
          title: "Front Desk Extras",
          desc: "Reception agents, night auditors, arrivals/departures, phone switchboard and guest relations.",
          bullets: [
            "Warm professional welcome",
            "Efficient check-in/out",
            "Flexible one-off or recurring shifts"
          ]
        },
        {
          icon: BedDouble,
          title: "Housekeeping",
          desc: "Experienced room attendants, process compliance, discretion and efficiency.",
          bullets: [
            "Rooms & public areas upkeep",
            "Strict hygiene standards",
            "Respect for guest privacy"
          ]
        },
        {
          icon: Wrench,
          title: "Technical Maintenance",
          desc: "Fast interventions, light maintenance, technical assistance and emergency handling.",
          bullets: [
            "Quick fixes",
            "Preventive & corrective",
            "Electrical, plumbing, HVAC…"
          ]
        },
        {
          icon: Utensils,
          title: "F&B & Floor",
          desc: "Waiters, runners, bartenders for breakfasts, à la carte service or events.",
          bullets: [
            "Professional table service",
            "Qualified bartenders",
            "Hygiene standards respected"
          ]
        }
      ]
    },
    why: {
      title: "Why choose My Shifters?",
      lead: "What makes us the ideal partner for extra hospitality staff.",
      text: "At MYSHIFTERS, we don't just supply staff. We connect you with qualified micro-entrepreneurs, available quickly and selected for professionalism. Our flexible approach helps you handle the unexpected, seasonal peaks and operational constraints while keeping service levels high.",
      points: [
        { icon: Clock, title: "24h responsiveness", desc: "Support in under 24 hours. 7/7 availability for critical situations." },
        { icon: Users, title: "Flexibility", desc: "Duration, skills, schedules, budget: we tailor the team to your needs." },
        { icon: ShieldCheck, title: "Quality", desc: "Selected extras, trained to hospitality standards, regularly reviewed." },
        { icon: BadgeEuro, title: "Transparency", desc: "No hidden fees. Clear pricing and accurate billing." },
        { icon: BriefcaseBusiness, title: "Expertise", desc: "7 years in hospitality: we know your constraints and expectations." },
        { icon: Headphones, title: "Support", desc: "A dedicated contact and quality follow-up throughout the mission." }
      ]
    },
    reviews: {
      badge: "Reviews",
      title: "They trust My Shifters",
      desc: "Feedback from hospitality partners.",
      empty: "No reviews yet. Check back soon!",
      verified: "Verified",
      partner: "Hotel partner",
      response: "Response from the establishment",
      prev: "Previous",
      next: "Next"
    },
    footer: {
      about: "My Shifters supports hotels, residences and premium properties with on-demand extra staff.",
      cta: "Request extra staff",
      useful: "Useful links",
      ourServices: "Our services",
      contact: "Contact us",
      availability: "Available 7/7 for urgent needs",
      emergency: "Urgent staffing? Call us!",
      copyright: "All rights reserved.",
      bookCall: "Book a call",
      bookCallDesc: "Chat 30 min with our team",
      phone: "+33 7 49 06 03 05",
      email: "myshifters-extras@outlook.com",
      links: {
        legal: "Legal notice",
        privacy: "Privacy policy",
        cgu: "Terms of use",
        cgs: "Terms of service"
      }
    }
  }
};// ========== UTILS ==========
const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 84;
  window.scrollTo({ top: y, behavior: "smooth" });
};

// ========== COMPOSANT PRINCIPAL ==========
export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const { ref: reviewsRef, inView: reviewsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const lang = i18n.language?.startsWith("en") ? "en" : "fr";
  const copy = CONTENT[lang];

  // Nettoyage event listener drawer
  useEffect(() => {
    if (!mobileOpen) return;

    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      const menuBtn = document.querySelector('[aria-label="Menu"]');
      if (menuBtn && mobileOpen) menuBtn.focus();
    };
  }, [mobileOpen]);

  // Chargement des avis vérifiés uniquement
  useEffect(() => {
    if (!reviewsInView) return;

    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`${API}/reviews?limit=20&verified=true`);
        if (!res.ok) return;
        const data = await res.json();
        if (alive) {
          const verifiedReviews = Array.isArray(data)
              ? data.filter(r => r.verified === true)
              : (data.items || []).filter(r => r.verified === true);
          setReviews(verifiedReviews);
        }
      } catch {
        // silent
      }
    };
    load();
    return () => { alive = false; };
  }, [reviewsInView]);

  // Navigation slider
  const nextReview = useCallback(() => {
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  }, [reviews.length]);

  const prevReview = useCallback(() => {
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  // Reset index quand les reviews changent
  useEffect(() => {
    setCurrentReviewIndex(0);
  }, [reviews]);

  const navItems = useMemo(
      () => [
        { label: copy.nav.home, id: "hero" },
        { label: copy.nav.about, id: "about" },
        { label: copy.nav.services, id: "services" },
        { label: copy.nav.why, id: "why-us" },
        { label: copy.nav.reviews, id: "reviews" },
      ],
      [copy.nav]
  );

  const toggleLang = () => {
    const next = lang === "en" ? "fr" : "en";
    i18n.changeLanguage(next);
  };

  const closeMobileAndGo = useCallback((id) => {
    setMobileOpen(false);
    setTimeout(() => scrollToId(id), 50);
  }, []);

  // Fallback image logo
  const handleLogoError = (e) => {
    e.target.style.backgroundColor = "#0a0a0a";
    e.target.style.padding = "0.5rem";
    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M3 9h18v10H3z'/%3E%3Cpath d='M7 5h10v4H7z'/%3E%3C/svg%3E";
  };

  return (
      <div className="min-h-screen bg-background text-foreground">
        {/* NAV */}
        <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex h-16 items-center justify-between">
              <Link
                  to="/"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId("hero");
                  }}
                  className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-muted/60"
                  aria-label="Go to top"
              >
                <img
                    src={ASSETS.logo}
                    alt="My Shifters - Accueil"
                    className="h-10 w-10 rounded-md object-contain bg-background"
                    onError={handleLogoError}
                />
                <div className="leading-tight text-left">
                  <div className="text-2xl font-bold tracking-tight">MyShifters<span className="text-blue-500">.</span></div>
                </div>
              </Link>

              <nav className="hidden items-center gap-1 md:flex">
                {navItems.map((it) => (
                    <Link
                        key={it.id}
                        to={`#${it.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToId(it.id);
                        }}
                        className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    >
                      {it.label}
                    </Link>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <button
                    onClick={toggleLang}
                    className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/60"
                    aria-label="Toggle language"
                >
                  <img
                      src={lang === "en" ? ASSETS.flagEN : ASSETS.flagFR}
                      alt={lang === "en" ? "English" : "Français"}
                      className="h-4 w-4 rounded-sm object-cover"
                  />
                  <span className="hidden sm:inline">{lang === "en" ? "EN" : "FR"}</span>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </button>

                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted/60"
                    aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                <button
                    onClick={() => setMobileOpen((v) => !v)}
                    className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted/60 md:hidden"
                    aria-label="Menu"
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                <Link
                    to="/login"
                    className="hidden md:inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Login
                </Link>

                <Button asChild className="hidden md:inline-flex">
                  <Link to="/register">
                    {copy.hero.ctaPrimary} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile drawer */}
          {mobileOpen && (
              <div className="md:hidden">
                <div className="mx-auto max-w-7xl px-6 pb-4">
                  <div className="mt-2 rounded-xl border bg-background shadow-sm">
                    <div className="flex flex-col p-2">
                      {navItems.map((it) => (
                          <Link
                              key={it.id}
                              to={`#${it.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                closeMobileAndGo(it.id);
                              }}
                              className="rounded-lg px-3 py-3 text-left text-sm hover:bg-muted/60"
                          >
                            {it.label}
                          </Link>
                      ))}
                      <div className="p-2 space-y-2">
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center w-full rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                        >
                          Login
                        </Link>
                        <Button asChild className="w-full">
                          <Link to="/register">
                            {copy.hero.ctaPrimary} <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          )}
        </header>

        {/* HERO - Image unique, stats traduites */}
        <section id="hero" className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                  <span>{copy.hero.badge}</span>
                </div>
                <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                  {copy.hero.title}
                </h1>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                  {copy.hero.desc}
                </p>

                <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                  {copy.hero.stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className={`rounded-2xl border bg-gradient-to-br ${stat.color} to-transparent p-3`}>
                          <div className="flex items-center gap-2 font-medium text-foreground">
                            <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                            {stat.value}
                          </div>
                          <div className="mt-1 text-xs">{stat.label}</div>
                        </div>
                    );
                  })}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-muted to-transparent blur-2xl" />
                <div className="overflow-hidden rounded-3xl border bg-background shadow-sm">
                  <img
                      src={ASSETS.hero}
                      alt="My Shifters – équipe hôtelière professionnelle"
                      className="h-72 w-full object-cover md:h-[420px]"
                      loading="eager"
                      width={800}
                      height={420}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="border-t">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <div className="text-xs font-semibold tracking-widest text-muted-foreground">{copy.about.kicker}</div>
                <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{copy.about.title}</h2>
                <p className="mt-4 text-muted-foreground">{copy.about.text}</p>

                <ul className="mt-6 space-y-3">
                  {copy.about.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 text-foreground/80" />
                        <span className="text-sm text-muted-foreground">{b}</span>
                      </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button variant="outline" onClick={() => scrollToId("why-us")}>
                    {copy.about.cta}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Image 1 - corrigée, plus d'espace blanc */}
                <div className="overflow-hidden rounded-3xl border bg-background shadow-sm h-fit">
                  <img
                      src={ASSETS.about1}
                      alt="Équipe My Shifters en réception"
                      className="h-auto w-full object-contain"
                      loading="lazy"
                      width={400}
                      height={240}
                  />
                </div>
                {/* Image 2 - corrigée aussi, plus d'espace blanc, garde le décalage */}
                <div className="overflow-hidden rounded-3xl border bg-background shadow-sm sm:mt-10 h-fit">
                  <img
                      src={ASSETS.about2}
                      alt="Personnel hôtelier My Shifters"
                      className="h-auto w-full object-contain"
                      loading="lazy"
                      width={400}
                      height={240}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="border-t bg-muted/20">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{copy.services.title}</h2>
              <p className="mt-3 text-muted-foreground">{copy.services.lead}</p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {copy.services.items.map((s, idx) => {
                const Icon = s.icon;
                const accents = [
                  { card: "from-brand/10", icon: "bg-brand text-white", check: "text-brand" },
                  { card: "from-emerald-500/10", icon: "bg-emerald-600 text-white", check: "text-emerald-600" },
                  { card: "from-amber-500/10", icon: "bg-amber-500 text-white", check: "text-amber-600" },
                  { card: "from-indigo-500/10", icon: "bg-indigo-600 text-white", check: "text-indigo-600" },
                ];
                const a = accents[idx % accents.length];
                return (
                    <div
                        key={s.title}
                        className={`rounded-3xl border bg-gradient-to-br ${a.card} to-background p-6 shadow-sm hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`rounded-2xl p-3 shadow-sm ${a.icon}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{s.title}</h3>
                          <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                        </div>
                      </div>

                      <ul className="mt-5 space-y-2">
                        {s.bullets.map((b) => (
                            <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className={`mt-0.5 h-4 w-4 ${a.check}`} />
                              <span>{b}</span>
                            </li>
                        ))}
                      </ul>
                    </div>
                );
              })}
            </div>

            <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-3xl border bg-gradient-to-br from-brand/10 via-background to-background p-6 shadow-sm sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand p-3 text-white shadow-sm">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">{copy.services.cta.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {copy.services.cta.desc}
                  </div>
                </div>
              </div>
              <Button asChild>
                <Link to="/register">
                  {copy.footer.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* WHY US */}
        <section id="why-us" className="border-t">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
            <div className="grid gap-10 md:grid-cols-2 md:items-start">

              {/* ---------- COLONNE GAUCHE : Texte + Contact/Calendly + Image ---------- */}
              <div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {copy.why.title}
                </h2>
                <p className="mt-3 text-muted-foreground">{copy.why.lead}</p>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {copy.why.text}
                </p>

                {/* Bloc contact – avec boutons Calendly et Email alignés côte à côte */}
                <div className="mt-8 rounded-3xl border bg-gradient-to-br from-emerald-500/10 via-background to-background p-6 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-sm">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">
                        {lang === "fr" ? "Parlons-en" : "Talk to us"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {lang === "fr"
                            ? "Disponible 7j/7 pour vos besoins urgents"
                            : "Available 7/7 for urgent needs"}
                      </div>
                    </div>
                  </div>

                  {/* Conteneur flex pour les deux actions : empilé en mobile, côte à côte en desktop */}
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    {/* Bouton Calendly - style vert (emerald) */}
                    <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                      <a
                          href="https://calendly.com/myshifters-extras/30min"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {copy.footer.bookCall}
                      </a>
                    </Button>

                    {/* Bouton Email - style outline, s'adapte au thème clair/sombre */}
                    <Button asChild variant="outline" className="flex-1 bg-background text-foreground border-input hover:bg-muted/50">
                      <a
                          href={`mailto:${copy.footer.email}`}
                          className="inline-flex items-center justify-center"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        {copy.footer.email}
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Image d'illustration */}
                <div className="mt-8 overflow-hidden rounded-3xl border bg-background shadow-sm">
                  <img
                      src={ASSETS.why}
                      alt="Pourquoi choisir My Shifters - Personnel hôtelier qualifié"
                      className="h-72 w-full object-cover md:h-[360px]"
                      loading="lazy"
                      width={600}
                      height={360}
                  />
                </div>
              </div>

              {/* ---------- COLONNE DROITE : 6 CARTES AVANTAGES ---------- */}
              <div className="grid gap-4">
                {copy.why.points.map((p, idx) => {
                  const Icon = p.icon;
                  const accents = [
                    { card: "from-brand/10", icon: "bg-brand text-white", ring: "ring-brand/20" },
                    { card: "from-emerald-500/10", icon: "bg-emerald-600 text-white", ring: "ring-emerald-500/20" },
                    { card: "from-amber-500/10", icon: "bg-amber-500 text-white", ring: "ring-amber-500/20" },
                    { card: "from-indigo-500/10", icon: "bg-indigo-600 text-white", ring: "ring-indigo-500/20" },
                  ];
                  const a = accents[idx % accents.length];
                  return (
                      <div
                          key={p.title}
                          className={`rounded-3xl border bg-gradient-to-br ${a.card} to-background p-5 shadow-sm hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`rounded-2xl p-3 shadow-sm ring-1 ${a.ring} ${a.icon}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{p.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                          </div>
                        </div>
                      </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>


        {/* REVIEWS - Slider avec flèches, avis vérifiés uniquement, sans formulaire */}
        <section id="reviews" ref={reviewsRef} className="border-t bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mt-3">{copy.reviews.title}</h2>
              <p className="mt-3 text-muted-foreground">{copy.reviews.desc}</p>
            </div>

            {reviews.length === 0 ? (
                <div className="max-w-2xl mx-auto rounded-3xl border bg-background p-12 text-center">
                  <div className="text-muted-foreground text-lg">
                    {copy.reviews.empty}
                  </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto">
                  {/* Slider */}
                  <div className="relative">
                    {/* Cartes visibles selon breakpoint */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {reviews
                          .slice(currentReviewIndex, currentReviewIndex + (window.innerWidth >= 768 ? 2 : 1))
                          .map((review) => (
                              <div key={review.id} className="bg-card p-7 rounded-3xl border border-border shadow-sm h-full flex flex-col">
                                <Quote className="w-9 h-9 text-brand/10 mb-4" />

                                <div className="flex items-start justify-between gap-4 mb-4">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold leading-none">{review.hotel_name}</h4>
                                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                <BadgeCheck className="w-4 h-4" /> {copy.reviews.verified}
                              </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{copy.reviews.partner}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-brand text-brand" : "text-muted-foreground/30"}`} />
                                    ))}
                                  </div>
                                </div>

                                <p className="text-muted-foreground italic flex-grow">“{review.comment}”</p>

                                {/* Réponse de l'établissement */}
                                {review.response && (
                                    <div className="mt-6 pt-4 border-t border-border">
                                      <p className="text-xs font-semibold text-muted-foreground mb-2">{copy.reviews.response}</p>
                                      <p className="text-sm text-muted-foreground/80 bg-muted/30 p-3 rounded-xl italic">
                                        “{review.response}”
                                      </p>
                                    </div>
                                )}
                              </div>
                          ))}
                    </div>

                    {/* Flèches de navigation - visibles seulement si assez d'avis */}
                    {reviews.length > (window.innerWidth >= 768 ? 2 : 1) && (
                        <>
                          <button
                              onClick={prevReview}
                              className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background border border-border shadow-lg hover:bg-muted flex items-center justify-center transition-all z-10"
                              aria-label={copy.reviews.prev}
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                              onClick={nextReview}
                              className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background border border-border shadow-lg hover:bg-muted flex items-center justify-center transition-all z-10"
                              aria-label={copy.reviews.next}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                    )}
                  </div>

                  {/* Indicateurs (dots) */}
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: Math.ceil(reviews.length / (window.innerWidth >= 768 ? 2 : 1)) }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentReviewIndex(idx * (window.innerWidth >= 768 ? 2 : 1))}
                            className={`w-2 h-2 rounded-full transition-all ${
                                Math.floor(currentReviewIndex / (window.innerWidth >= 768 ? 2 : 1)) === idx
                                    ? "w-6 bg-brand"
                                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                            }`}
                            aria-label={`${copy.reviews.badge} ${idx + 1}`}
                        />
                    ))}
                  </div>
                </div>
            )}
          </div>
        </section>

        {/* FOOTER */}
        {/* FOOTER - Version finale, disposition correcte 4+2+2+4 */}
        <footer className="border-t bg-background text-foreground">
          <div className="mx-auto max-w-7xl px-6 py-16">
            {/* Grille 12 colonnes - sans trou, collée au dessin */}
            <div className="grid gap-8 md:grid-cols-12">

              {/* Colonne 1 - Présentation (span 4) */}
              <div className="md:col-span-4">
                <div className="flex items-center gap-3">
                  <img
                      src={ASSETS.logo}
                      alt="MyShifters"
                      className="h-10 w-10 object-contain"
                      onError={handleLogoError}
                  />
                  <div className="text-2xl font-bold">MyShifters</div>
                </div>
                <p className="mt-6 text-muted-foreground leading-relaxed max-w-xs">
                  {copy.footer.about}
                </p>
                <div className="mt-8">
                  <Button asChild size="lg" className="bg-brand hover:bg-brand/90 text-white shadow-lg hover:shadow-xl transition-all border-0">
                    <Link to="/register">
                      {copy.footer.cta} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Colonne 2 - Liens utiles (span 2) */}
              <div className="md:col-span-2">
                <div className="text-lg font-semibold">{copy.footer.useful}</div>
                <div className="mt-6 flex flex-col gap-4 text-muted-foreground">
                  <Link to="/#hero" onClick={(e) => { e.preventDefault(); scrollToId("hero"); }} className="hover:text-foreground transition-colors">
                    {copy.nav.home}
                  </Link>
                  <Link to="/#about" onClick={(e) => { e.preventDefault(); scrollToId("about"); }} className="hover:text-foreground transition-colors">
                    {copy.nav.about}
                  </Link>
                  <Link to="/#services" onClick={(e) => { e.preventDefault(); scrollToId("services"); }} className="hover:text-foreground transition-colors">
                    {copy.nav.services}
                  </Link>
                  <Link to="/#why-us" onClick={(e) => { e.preventDefault(); scrollToId("why-us"); }} className="hover:text-foreground transition-colors">
                    {copy.nav.why}
                  </Link>
                </div>
              </div>

              {/* Colonne 3 - Nos services (span 2) */}
              <div className="md:col-span-2">
                <div className="text-lg font-semibold">{copy.footer.ourServices}</div>
                <div className="mt-6 flex flex-col gap-4 text-muted-foreground">
                  <Link to="/#services" onClick={(e) => { e.preventDefault(); scrollToId("services"); }} className="hover:text-foreground transition-colors">
                    {copy.services.items[0].title}
                  </Link>
                  <Link to="/#services" onClick={(e) => { e.preventDefault(); scrollToId("services"); }} className="hover:text-foreground transition-colors">
                    {copy.services.items[1].title}
                  </Link>
                  <Link to="/#services" onClick={(e) => { e.preventDefault(); scrollToId("services"); }} className="hover:text-foreground transition-colors">
                    {copy.services.items[2].title}
                  </Link>
                  <Link to="/#services" onClick={(e) => { e.preventDefault(); scrollToId("services"); }} className="hover:text-foreground transition-colors">
                    {copy.services.items[3].title}
                  </Link>
                </div>
              </div>

              {/* Colonne 4 - Contact (span 4) */}
              <div className="md:col-span-4">
                <div className="text-lg font-semibold">{copy.footer.contact}</div>
                <div className="mt-6 space-y-3 text-muted-foreground">
                  <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground min-w-[80px]">
              {lang === "fr" ? "Téléphone:" : "Phone:"}
            </span>
                    <a href={`tel:${copy.footer.phone.replace(/\s/g, '')}`} className="hover:text-foreground transition-colors">
                      {copy.footer.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground min-w-[80px]">Email:</span>
                    <a href={`mailto:${copy.footer.email}`} className="hover:text-foreground transition-colors break-all">
                      {copy.footer.email}
                    </a>
                  </div>
                </div>

                {/* Bloc urgence - gardé */}
                <div className="mt-6 rounded-2xl border border-red-500/50 bg-red-500/10 p-5">
                  <div className="font-semibold text-red-500">
                    {copy.footer.emergency}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bandeau copyright - suit le thème */}
          <div className="border-t bg-muted/30 py-6 text-center">
            <div className="text-sm text-muted-foreground">
              © 2026 <span className="font-semibold text-foreground">MyShifters</span>. {copy.footer.copyright}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/mentions-legales" className="hover:text-foreground hover:underline">
                {copy.footer.links.legal}
              </Link>
              <Link to="/politique-de-confidentialite" className="hover:text-foreground hover:underline">
                {copy.footer.links.privacy}
              </Link>
              <Link to="/cgu" className="hover:text-foreground hover:underline">
                {copy.footer.links.cgu}
              </Link>
              <Link to="/cgs" className="hover:text-foreground hover:underline">
                {copy.footer.links.cgs}
              </Link>
            </div>
          </div>
        </footer>
      </div>
  );
}