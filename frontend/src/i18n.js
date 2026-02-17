import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "services": "Services",
        "about": "About",
        "contact": "Contact",
        "login": "Login",
        "get_started": "Get Started"
      },
      "hero": {
        "badge": "Recent Launch",
        "title": "Hotel excellence,",
        "title_accent": "even as backup",
        "desc": "My Shifters supports hotels, residences, and high-end establishments in managing their extra staff needs.",
        "cta_hotel": "I am a Hotel",
        "cta_worker": "I am an Extra"
      },
      "stats": {
        "missions": "Missions Completed",
        "clients": "Satisfied Clients",
        "experience": "Years of Experience",
        "satisfaction": "Client Satisfaction"
      },
      "services": {
        "badge": "Our Services",
        "title": "Qualified staff, for every need"
      },
      "reviews": {
        "badge": "Testimonials",
        "title": "What our partners say",
        "hotel_manager": "Hotel Manager",
        "director": "General Director"
      },
      "partners": {
        "title": "They trust us"
      }
    }
  },
  fr: {
    translation: {
      "nav": {
        "services": "Services",
        "about": "À propos",
        "contact": "Contact",
        "login": "Connexion",
        "get_started": "Commencer"
      },
      "hero": {
        "badge": "Lancement Récent",
        "title": "L'excellence hôtelière,",
        "title_accent": "même en renfort",
        "desc": "My Shifters accompagne les hôtels, résidences et établissements haut de gamme dans la gestion de leurs besoins en personnel extra.",
        "cta_hotel": "Je suis un Hôtel",
        "cta_worker": "Je suis un Extra"
      },
      "stats": {
        "missions": "Missions Réalisées",
        "clients": "Clients Satisfaits",
        "experience": "Ans d'Expérience",
        "satisfaction": "Satisfaction Client"
      },
      "services": {
        "badge": "Nos Services",
        "title": "Du personnel qualifié, au moindre besoin"
      },
      "reviews": {
        "badge": "Témoignages",
        "title": "Ce que disent nos partenaires",
        "hotel_manager": "Directeur d'Hôtel",
        "director": "Directeur Général"
      },
      "partners": {
        "title": "Ils nous font confiance"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
