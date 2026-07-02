import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      nav: {
        home: "Inicio",
        animals: "Animales",
        visit: "Planear Visita",
        map: "Mapa",
        contact: "Contacto",
        admin: "Admin",
      },
      home: {
        hero: {
          tag: "Zoológico Regional Miguel Álvarez del Toro",
          title1: "Descubre la ",
          titleHighlight: "Fauna",
          title2: " de Chiapas",
          desc: "Un espacio dedicado a la conservación, donde podrás conocer de cerca a las especies nativas en un entorno que simula su hábitat natural.",
          planVisit: "Planear Visita",
          exploreCatalog: "Explorar Catálogo",
        },
        highlights: {
          conservation: "Conservación",
          conservationDesc: "Protegemos y rehabilitamos especies en peligro de extinción nativas de nuestra región.",
          education: "Educación",
          educationDesc: "Programas educativos para concientizar sobre la importancia de nuestra biodiversidad.",
          research: "Investigación",
          researchDesc: "Estudios científicos para entender mejor a las especies y sus ecosistemas.",
        },
        featured: {
          title: "Especies Destacadas",
          desc: "Conoce algunos de nuestros habitantes más emblemáticos que protegemos en el zoológico.",
          viewAll: "Ver catálogo completo",
        },
        visit: {
          tag: "Tu visita",
          title: "Planifica tu recorrido",
          desc: "Estamos abiertos de martes a domingo. Ven y vive una experiencia educativa inmersiva para toda la familia en el corazón de la selva.",
          hoursTitle: "Horario de apertura",
          hoursDesc: "Martes a Domingo: 9:00 - 17:00",
          locationTitle: "Ubicación",
          locationDesc: "Calzada Cerro Hueco, Tuxtla Gutiérrez",
          admissionTitle: "Admisión",
          admissionDesc: "Entrada general: $30 MXN",
          moreDetails: "Ver Más Detalles",
        },
        conservation: {
          title: "Comprometidos con la Vida",
          desc: "El ZooMAT es más que un lugar de exhibición; es un centro de conservación enfocado en proteger nuestra biodiversidad a través de programas de reproducción, rehabilitación y educación ambiental.",
          support: "Descubre cómo apoyar la causa",
        }
      },
      footer: {
        about: "Dedicado a la conservación y protección de la fauna silvestre nativa de Chiapas desde 1942.",
        explore: "Explorar",
        contact: "Contacto",
        hours: "Horarios",
        closed: "Cerrado los lunes",
        privacy: "Privacidad",
        terms: "Términos",
        adminPortal: "Portal Admin",
        rights: "Todos los derechos reservados."
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: "Home",
        animals: "Animals",
        visit: "Plan Visit",
        map: "Map",
        contact: "Contact",
        admin: "Admin",
      },
      home: {
        hero: {
          tag: "Miguel Álvarez del Toro Regional Zoo",
          title1: "Discover the ",
          titleHighlight: "Wildlife",
          title2: " of Chiapas",
          desc: "A space dedicated to conservation, where you can meet native species up close in an environment that simulates their natural habitat.",
          planVisit: "Plan Visit",
          exploreCatalog: "Explore Catalog",
        },
        highlights: {
          conservation: "Conservation",
          conservationDesc: "We protect and rehabilitate endangered species native to our region.",
          education: "Education",
          educationDesc: "Educational programs to raise awareness about the importance of our biodiversity.",
          research: "Research",
          researchDesc: "Scientific studies to better understand species and their ecosystems.",
        },
        featured: {
          title: "Featured Species",
          desc: "Meet some of our most iconic inhabitants that we protect in the zoo.",
          viewAll: "View full catalog",
        },
        visit: {
          tag: "Your visit",
          title: "Plan your tour",
          desc: "We are open from Tuesday to Sunday. Come and experience an immersive educational journey for the whole family in the heart of the jungle.",
          hoursTitle: "Opening hours",
          hoursDesc: "Tuesday to Sunday: 9:00 AM - 5:00 PM",
          locationTitle: "Location",
          locationDesc: "Cerro Hueco Road, Tuxtla Gutiérrez",
          admissionTitle: "Admission",
          admissionDesc: "General entry: $30 MXN",
          moreDetails: "See More Details",
        },
        conservation: {
          title: "Committed to Life",
          desc: "ZooMAT is more than just an exhibition place; it's a conservation center focused on protecting our biodiversity through breeding, rehabilitation, and environmental education programs.",
          support: "Discover how to support the cause",
        }
      },
      footer: {
        about: "Dedicated to the conservation and protection of native wildlife in Chiapas since 1942.",
        explore: "Explore",
        contact: "Contact",
        hours: "Hours",
        closed: "Closed on Mondays",
        privacy: "Privacy",
        terms: "Terms",
        adminPortal: "Admin Portal",
        rights: "All rights reserved."
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "es", // default language
    fallbackLng: "es",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;