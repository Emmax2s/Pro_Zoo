export interface InstitutionalDocument {
  id: string;
  category: "transparencia" | "datos_personales" | "institucional";
  title: string;
  description: string;
  pdfUrl?: string;
  fileName?: string;
  fileSize?: string;
  updatedAt?: string;
}

export const DEFAULT_DOCUMENTS: InstitutionalDocument[] = [
  // ── 14 Apartados de Transparencia (Foto 4) ──────────────────────────────
  {
    id: "transparencia-portal",
    category: "transparencia",
    title: "Portal de Transparencia",
    description: "Plataforma Nacional de Transparencia y obligaciones de transparencia institucionales.",
    pdfUrl: "",
  },
  {
    id: "transparencia-datos-personales",
    category: "transparencia",
    title: "Datos Personales",
    description: "Lineamientos de protección de datos personales y solicitudes de derechos ARCO.",
    pdfUrl: "",
  },
  {
    id: "transparencia-proactiva",
    category: "transparencia",
    title: "Transparencia Proactiva",
    description: "Información adicional generada para beneficio directo y conocimiento de la ciudadanía.",
    pdfUrl: "",
  },
  {
    id: "transparencia-datos-abiertos",
    category: "transparencia",
    title: "Datos Abiertos",
    description: "Publicación de catálogos y estadísticas en formatos accesibles, descargables y abiertos.",
    pdfUrl: "",
  },
  {
    id: "transparencia-participacion-ciudadana",
    category: "transparencia",
    title: "Participación Ciudadana",
    description: "Mecanismos institucionales de consulta, diálogo e interlocución con la sociedad.",
    pdfUrl: "",
  },
  {
    id: "transparencia-tabla-aplicabilidad",
    category: "transparencia",
    title: "Tabla de aplicabilidad",
    description: "Matriz legal de aplicabilidad de las obligaciones de transparencia.",
    pdfUrl: "",
  },
  {
    id: "transparencia-documento-seguridad",
    category: "transparencia",
    title: "Documento de Seguridad",
    description: "Instrumento administrativo y técnico para la salvaguarda de la información.",
    pdfUrl: "",
  },
  {
    id: "transparencia-archivos",
    category: "transparencia",
    title: "Archivos",
    description: "Guía de archivo documental, cuadro general de clasificación archivística y catálogo de disposición.",
    pdfUrl: "",
  },
  {
    id: "transparencia-conac",
    category: "transparencia",
    title: "CONAC",
    description: "Cumplimiento de las normas emitidas por el Consejo Nacional de Armonización Contable.",
    pdfUrl: "",
  },
  {
    id: "transparencia-disciplina-financiera",
    category: "transparencia",
    title: "Disciplina Financiera",
    description: "Información financiera relativa a la Ley de Disciplina Financiera de las Entidades Federativas.",
    pdfUrl: "",
  },
  {
    id: "transparencia-subsidio",
    category: "transparencia",
    title: "Subsidio",
    description: "Detalle de subsidios, transferencias y apoyos autorizados para la operación del zoológico.",
    pdfUrl: "",
  },
  {
    id: "transparencia-denuncias",
    category: "transparencia",
    title: "Denuncias",
    description: "Mecanismo oficial para la presentación de quejas y denuncias sobre servidores públicos.",
    pdfUrl: "",
  },
  {
    id: "transparencia-cuotas-acceso",
    category: "transparencia",
    title: "Cuotas de Acceso",
    description: "Tabulador de derechos, productos y tarifas vigentes para el acceso al ZooMAT.",
    pdfUrl: "",
  },
  {
    id: "transparencia-igualdad-genero",
    category: "transparencia",
    title: "Igualdad de Genero",
    description: "Estrategias institucionales para promover la igualdad sustantiva de género y no discriminación.",
    pdfUrl: "",
  },

  // ── 2 Apartados de Datos Personales (Foto 3) ───────────────────────────
  {
    id: "datos-personales-doc-seguridad",
    category: "datos_personales",
    title: "Documento de Seguridad",
    description: "Documento de seguridad de los sistemas de datos personales en posesión de la entidad.",
    pdfUrl: "",
  },
  {
    id: "datos-personales-aviso-privacidad",
    category: "datos_personales",
    title: "Aviso de Privacidad",
    description: "Aviso de privacidad integral para la protección de datos personales de usuarios y visitantes.",
    pdfUrl: "",
  },

  // ── Institucionales Adicionales (Header / Footer) ─────────────────────
  {
    id: "institucional-quienes-somos",
    category: "institucional",
    title: "Quienes somos",
    description: "Misión, visión, historia y objetivos de la Coordinación Estatal para el Mejoramiento del ZooMAT.",
    pdfUrl: "",
  },
  {
    id: "institucional-comite-etica",
    category: "institucional",
    title: "Comité de Ética",
    description: "Código de Honestidad y Ética de los Servidores Públicos del Poder Ejecutivo del Estado de Chiapas.",
    pdfUrl: "",
  },
  {
    id: "institucional-declara-chiapas",
    category: "institucional",
    title: "Declara Chiapas",
    description: "Portal oficial del Sistema Declara Chiapas para la rendición de declaraciones patrimoniales.",
    pdfUrl: "https://declara.chiapas.gob.mx/",
  },
];

const STORAGE_KEY = "zoomat_transparency_docs_v1";

export function loadStoredDocuments(): InstitutionalDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DOCUMENTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_DOCUMENTS;

    // Merge default entries with stored modifications
    const map = new Map<string, InstitutionalDocument>();
    DEFAULT_DOCUMENTS.forEach((doc) => map.set(doc.id, { ...doc }));
    parsed.forEach((doc: InstitutionalDocument) => {
      if (doc && doc.id) {
        const existing = map.get(doc.id);
        map.set(doc.id, { ...(existing || {}), ...doc });
      }
    });

    return Array.from(map.values());
  } catch {
    return DEFAULT_DOCUMENTS;
  }
}

export function saveDocuments(docs: InstitutionalDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    window.dispatchEvent(new CustomEvent("zoomat-documents-changed", { detail: docs }));
  } catch (err) {
    console.error("Error saving documents to localStorage:", err);
  }
}

export function updateDocument(
  id: string,
  data: Partial<Omit<InstitutionalDocument, "id">>
): InstitutionalDocument[] {
  const current = loadStoredDocuments();
  const next = current.map((doc) => {
    if (doc.id === id) {
      return {
        ...doc,
        ...data,
        updatedAt: new Date().toLocaleDateString("es-MX", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      };
    }
    return doc;
  });
  saveDocuments(next);
  return next;
}

export function resetToDefaults(): InstitutionalDocument[] {
  saveDocuments(DEFAULT_DOCUMENTS);
  return DEFAULT_DOCUMENTS;
}
