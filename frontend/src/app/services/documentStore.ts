export type DocumentCategory = 
  | "transparencia" 
  | "datos_personales" 
  | "quienes_somos" 
  | "comite_etica" 
  | "institucional";

export interface InstitutionalDocument {
  id: string;
  category: DocumentCategory;
  title: string;
  description: string;
  pdfUrl?: string;
  fileName?: string;
  fileSize?: string;
  updatedAt?: string;
  year?: string;
}

export interface SexenioInfo {
  directorName: string;
  directorTitle: string;
  directorPhoto: string;
  location: string;
  phone: string;
  website: string;
  facebookUrl: string;
  directoryUrl: string;
  welcomeP1: string;
  welcomeP2: string;
  mision: string;
  vision: string;
  organigramaImage: string;
  ethicsBanner: string;
  ethicsTitle: string;
  ethicsP1: string;
  ethicsP2: string;
  ethicsP3: string;
}

export const DEFAULT_SEXENIO_INFO: SexenioInfo = {
  directorName: "MVZ. Joe Miceli Hernández",
  directorTitle: "Director General",
  directorPhoto: "/assets/images/DirZoo.jpg",
  location: "Calzada Cerro Hueco S/N, Col. El Zapotal, C. P. 29094, Tuxtla Gutiérrez, Chiapas.",
  phone: "Directo: 9615438890 Ext. 1001 y 1003",
  website: "https://zoomat.chiapas.gob.mx",
  facebookUrl: "https://www.facebook.com/ZoomatOficial",
  directoryUrl: "https://www.chiapas.gob.mx/funcionarios/estatal/ejecutivo/coordinacion-mejoramiento-zoologico",
  welcomeP1: "La Coordinación Estatal para el Mejoramiento del Zoológico Miguel Álvarez del Toro, te da la más cordial bienvenida ahora que te integras a esta gran familia, la cual se enriquece y fortalece con tus capacidades, conocimientos, espíritu de colaboración y servicio.",
  welcomeP2: "Así mismo, deseamos que el presente documento te sirva de apoyo para que obtengas información general y relevante de la institución, con la finalidad de darte a conocer el entorno laboral en el que desarrollarás tus funciones y actividades. Donde además, podrás encontrar todo lo necesario para sentirte parte de esta Coordinación, que tiene por objeto invaluable, el bienestar de las especies que aquí se albergan y que están bajo nuestro cuidado.",
  mision: "Impulsar acciones de conservación de la fauna nativa del Estado, con especial énfasis en las especies amenazadas y su entorno; ofreciendo un espacio de recreación, educación, investigación y exhibición de fauna local; así como coordinar acciones en materia de capacitación, promoción y asistencia para el correcto estudio, manejo y protección de la fauna nativa; beneficiando directa e indirectamente a la población del Estado de Chiapas y visitantes del zoológico, con el propósito de sensibilizar y generar conciencia social, en beneficio de la naturaleza y sus diversas formas de vida.",
  vision: "Consolidarnos como el organismo líder de la región sur - sureste, en el manejo responsable de la fauna nativa del Estado en condiciones controladas; así como un centro de educación, recreación, investigación y conservación de la fauna, donde se promueva la integración familiar a través del esparcimiento y la convivencia; apoyado en una infraestructura y servicio de excelencia, con personal altamente calificado así como el apoyo comprometido de la sociedad, basado en el valor de la sustentabilidad.",
  organigramaImage: "/assets/images/OrgZoomat_23.jpg",
  ethicsBanner: "",
  ethicsTitle: "Objetivos del Comité de Ética",
  ethicsP1: "El Comité de Ética y de Prevención de Conflictos de Interés, tiene como objetivo establecer acciones, mecanismos y medidas que favorezcan los principios de integridad, prevención y atención de las conductas discriminatorias de hostigamiento sexual y acoso sexual, que regulen el comportamiento de los servidores públicos de la SEMAHN y se conduzcan, en el ejercicio de sus funciones, con ética, permitiendo establecer un ambiente laboral basado en la tolerancia, respeto y debido servicio público, favoreciendo a su vez una cultura institucional de igualdad de género y un clima libre de violencia.",
  ethicsP2: "Así mismo, vigilar el cumplimiento del Código de Conducta dentro de la Secretaría, y dar seguimiento a los casos para el establecimiento de sanciones por faltas en contra del Código.",
  ethicsP3: "Promoviendo entre los servidores públicos de esta Secretaría, los valores que permitan incidir en su desempeño de sus funciones y comportamiento laboral, para formar una ética e identidad profesional compartida y un sentido de orgullo y pertenencia al servicio público.",
};

export const DEFAULT_DOCUMENTS: InstitutionalDocument[] = [
  // ── 14 Apartados de Transparencia (Foto 4) ──────────────────────────────
  {
    id: "transparencia-portal",
    category: "transparencia",
    title: "Portal de Transparencia",
    description: "Plataforma Nacional de Transparencia y obligaciones de transparencia institucionales.",
    pdfUrl: "https://zoomat.transparencia.chiapas.gob.mx/",
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

  // ── Normatividad y Documentos de Quienes Somos (nosotros) ───────────────
  {
    id: "qs-organigrama-pdf",
    category: "quienes_somos",
    title: "Organigrama de la Coordinación Estatal ZooMAT (PDF)",
    description: "Estructura orgánica oficial de la Coordinación Estatal para el Mejoramiento del ZooMAT.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/OrganigramaZoomat_2023.pdf",
    fileName: "OrganigramaZoomat_2023.pdf",
    fileSize: "115 KB",
  },
  {
    id: "qs-codigo-etica-pdf",
    category: "quienes_somos",
    title: "Código de Ética y Conducta (PDF)",
    description: "Código de Ética y Conducta aplicable al personal del ZooMAT.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/CodigoEticaConducta.pdf",
    fileName: "CodigoEticaConducta.pdf",
    fileSize: "2.29 MB",
  },
  {
    id: "qs-marco-normativo",
    category: "quienes_somos",
    title: "Marco Normativo",
    description: "Leyes, decretos, reglamentos y disposiciones normativas que rigen al zoológico.",
    pdfUrl: "",
  },
  {
    id: "qs-decreto-creacion",
    category: "quienes_somos",
    title: "Decreto de creación (2024)",
    description: "Decreto de creación oficial de la Coordinación Estatal para el Mejoramiento del ZooMAT.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/Decreto_creacion_2024.pdf",
    fileName: "Decreto_creacion_2024.pdf",
  },
  {
    id: "qs-reglamento-interior",
    category: "quienes_somos",
    title: "Reglamento interior (2024)",
    description: "Reglamento interior vigente emitido en el Periódico Oficial del Estado.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/Reglamento_Interior_03_04_24_ZooMAT.pdf",
    fileName: "Reglamento_Interior_03_04_24_ZooMAT.pdf",
  },
  {
    id: "qs-dictamen",
    category: "quienes_somos",
    title: "Dictamen CEMZOOMAT",
    description: "Dictamen de la Coordinación Estatal para el Mejoramiento del Zoológico Miguel Álvarez del Toro.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/DictamenCEMZOMAT.pdf",
    fileName: "DictamenCEMZOMAT.pdf",
  },
  {
    id: "qs-manual-induccion",
    category: "quienes_somos",
    title: "Manual de inducción",
    description: "Manual de inducción institucional para servidores públicos de nuevo ingreso.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/Manual_induccion_23.pdf",
    fileName: "Manual_induccion_23.pdf",
  },
  {
    id: "qs-manual-organizacion",
    category: "quienes_somos",
    title: "Manual de organización",
    description: "Manual de organización institucional y atribuciones por área.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/Manual_Oorganizaci%C3%B3n_24.pdf",
    fileName: "Manual_Organizacion_24.pdf",
  },
  {
    id: "qs-manual-procedimientos",
    category: "quienes_somos",
    title: "Manual de procedimientos",
    description: "Manual de procedimientos operativos y técnicos del zoológico.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/Manual_Procedimiento_24.pdf",
    fileName: "Manual_Procedimiento_24.pdf",
  },

  // ── Documentos y Protocolos del Comité de Ética (CodigoDeEtica) ─────────
  {
    id: "ce-informe-anual",
    category: "comite_etica",
    title: "Informe Anual de Actividades",
    description: "Informe anual de actividades del Comité de Ética y Prevención de Conflictos de Interés.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/etica/codigodeetica/2_Informe_anual_actividades_comite_2022.pdf",
    fileName: "2_Informe_anual_actividades_comite_2022.pdf",
    year: "2023",
  },
  {
    id: "ce-codigo-conducta",
    category: "comite_etica",
    title: "Código de Conducta de la SEMAHN",
    description: "Código de Conducta específico para las personas servidoras públicas de la Secretaría de Medio Ambiente e Historia Natural.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/etica/codigodeetica/2_1_Codigo_conducta_SEMAHN.pdf",
    fileName: "2_1_Codigo_conducta_SEMAHN.pdf",
    year: "2023",
  },
  {
    id: "ce-codigo-honestidad-gobierno",
    category: "comite_etica",
    title: "Código de Honestidad y Ética de los Servidores Públicos de Chiapas",
    description: "Código emitido por el Poder Ejecutivo del Gobierno del Estado de Chiapas.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/etica/codigodeetica/3_codigo_etica_gobierno_del_estado.pdf",
    fileName: "3_codigo_etica_gobierno_del_estado.pdf",
    year: "2023",
  },
  {
    id: "ce-protocolo-denuncias-semahn",
    category: "comite_etica",
    title: "Protocolo de atención de quejas y denuncias ante el CEPCI",
    description: "Protocolo formal para presentar quejas y denuncias de faltas a la integridad ante la SEMAHN.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/etica/codigodeetica/5_Protocolo_quejas_denuncias2022.pdf",
    fileName: "5_Protocolo_quejas_denuncias2022.pdf",
    year: "2023",
  },
  {
    id: "ce-reglas-integridad",
    category: "comite_etica",
    title: "Reglas de Integridad para el ejercicio de la Función Pública",
    description: "Reglas éticas de conducta, lealtad y rectitud en el desempeño gubernamental.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/etica/codigodeetica/6_Reglas_Integridad.pdf",
    fileName: "6_Reglas_Integridad.pdf",
    year: "2023",
  },
  {
    id: "ce-acta-instalacion",
    category: "comite_etica",
    title: "Acta de instalación del comité de ética y prevención de conflictos de interés",
    description: "Documento oficial de instalación y formalización del comité.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/etica/codigodeetica/7_ACTA_INSTALACION_COMITE.pdf",
    fileName: "7_ACTA_INSTALACION_COMITE.pdf",
    year: "2023",
  },
  {
    id: "ce-acta-integracion",
    category: "comite_etica",
    title: "Acta de integración del comité de ética y prevención de conflictos de interés",
    description: "Constancia de miembros que integran formalmente el comité.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/etica/codigodeetica/8_ACTA_INTEGRACION_COMITE.pdf",
    fileName: "8_ACTA_INTEGRACION_COMITE.pdf",
    year: "2023",
  },
  {
    id: "ce-bases-organizacion",
    category: "comite_etica",
    title: "Bases para la integración, organización y funcionamiento del CEPCI",
    description: "Lineamientos de operación y periodicidad de sesiones del comité.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/etica/codigodeetica/9_Bases_integ_orga_func_comite.pdf",
    fileName: "9_Bases_integ_orga_func_comite.pdf",
    year: "2023",
  },
  {
    id: "ce-programa-anual-trabajo",
    category: "comite_etica",
    title: "Programa anual de trabajo (PAT)",
    description: "Plan de metas, capacitaciones y actividades anuales del comité.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/etica/codigodeetica/10_PROGRAMA_ANUAL_2022.pdf",
    fileName: "10_PROGRAMA_ANUAL_2022.pdf",
    year: "2023",
  },
  {
    id: "ce-acta-aprobacion-bases",
    category: "comite_etica",
    title: "Acta de sesión en que se aprobaron las bases de integración y funcionamiento del CEPCI",
    description: "Acta de acuerdo de aprobación colegiada.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/etica/codigodeetica/11_acta_aprobacion_integracion_bases_integracion.pdf",
    fileName: "11_acta_aprobacion_integracion_bases.pdf",
    year: "2023",
  },
  {
    id: "ce-acta-aprobacion-pat",
    category: "comite_etica",
    title: "Acta de aprobación del Programa Anual de Trabajo",
    description: "Acuerdo de validación del programa anual.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/etica/codigodeetica/12_acta_aprobacion_PAT_2022.pdf",
    fileName: "12_acta_aprobacion_PAT_2022.pdf",
    year: "2023",
  },
  {
    id: "ce-acta-aprobacion-denuncias",
    category: "comite_etica",
    title: "Acta de aprobación, atención de denuncias",
    description: "Protocolo aprobado para la gestión confidencial de denuncias.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/etica/codigodeetica/13_Acta_aprobacion_protocolo_atencion_denuncias_2022.pdf",
    fileName: "13_Acta_aprobacion_denuncias.pdf",
    year: "2023",
  },
  {
    id: "ce-primer-contacto-hostigamiento",
    category: "comite_etica",
    title: "Primer contacto por Hostigamiento y Acoso Sexual",
    description: "Ruta de atención inmediata y persona designada para primer contacto.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/etica/codigodeetica/14_primer_contacto_hostigamiento_acoso_sexual.pdf",
    fileName: "14_primer_contacto_hostigamiento_acoso_sexual.pdf",
    year: "2023",
  },
  {
    id: "ce-primer-contacto-laboral",
    category: "comite_etica",
    title: "Primer contacto por Acoso Laboral",
    description: "Canal institucional y medidas de protección ante acoso o maltrato laboral.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/etica/codigodeetica/15_acoso_laboral.pdf",
    fileName: "15_acoso_laboral.pdf",
    year: "2023",
  },
  {
    id: "ce-cero-tolerancia",
    category: "comite_etica",
    title: "Cero Tolerancia al Hostigamiento y Acoso Sexual",
    description: "Declaratoria formal de cero tolerancia en la administración pública estatal.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/CeroHostigamiento.pdf",
    fileName: "CeroHostigamiento.pdf",
    year: "Protocolos",
  },
  {
    id: "ce-protocolo-prevencion-hostigamiento",
    category: "comite_etica",
    title: "Protocolo para la Atención del Hostigamiento y Acoso Sexual",
    description: "Procedimiento de salvaguarda integral y acompañamiento a víctimas.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/ProtPrevHostigamientoAcoso.pdf",
    fileName: "ProtPrevHostigamientoAcoso.pdf",
    year: "Protocolos",
  },
  {
    id: "ce-mecanismos-verificacion",
    category: "comite_etica",
    title: "Mecanismos de Verificación",
    description: "Herramientas de evaluación y seguimiento del cumplimiento ético.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/MecanismosVerificacion.pdf",
    fileName: "MecanismosVerificacion.pdf",
    year: "Protocolos",
  },
  {
    id: "ce-convocatoria",
    category: "comite_etica",
    title: "Convocatoria del Comité de Ética",
    description: "Bases para la elección y renovación de los integrantes del comité.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/convocatoria.pdf",
    fileName: "convocatoria.pdf",
    year: "Archivo",
  },
  {
    id: "ce-directorio-comite",
    category: "comite_etica",
    title: "Directorio del Comité de Ética",
    description: "Nómina y cargos de los integrantes del comité de ética.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/directorio.pdf",
    fileName: "directorio.pdf",
    year: "Archivo",
  },
  {
    id: "ce-directorio-asesores",
    category: "comite_etica",
    title: "Directorio de Asesores",
    description: "Especialistas y asesores certificados en materia de ética e integridad.",
    pdfUrl: "https://www.zoomat.chiapas.gob.mx/files/directorio_asesores.pdf",
    fileName: "directorio_asesores.pdf",
    year: "Archivo",
  },

  // ── Institucionales Generales ──────────────────────────────────────────
  {
    id: "institucional-declara-chiapas",
    category: "institucional",
    title: "Declara Chiapas",
    description: "Portal oficial del Sistema Declara Chiapas para la rendición de declaraciones patrimoniales.",
    pdfUrl: "https://declarachiapas.shyfpchiapas.gob.mx/login",
  },
];

const STORAGE_KEY_DOCS = "zoomat_transparency_docs_v2";
const STORAGE_KEY_SEXENIO = "zoomat_sexenio_settings_v1";

// ── Document Operations ──────────────────────────────────────────────────
export function loadStoredDocuments(): InstitutionalDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOCS);
    if (!raw) return DEFAULT_DOCUMENTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_DOCUMENTS;

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
    localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(docs));
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

// ── Sexenio Settings Operations ──────────────────────────────────────────
export function loadSexenioInfo(): SexenioInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SEXENIO);
    if (!raw) return DEFAULT_SEXENIO_INFO;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SEXENIO_INFO, ...parsed };
  } catch {
    return DEFAULT_SEXENIO_INFO;
  }
}

export function saveSexenioInfo(info: Partial<SexenioInfo>): SexenioInfo {
  try {
    const current = loadSexenioInfo();
    const updated = { ...current, ...info };
    localStorage.setItem(STORAGE_KEY_SEXENIO, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("zoomat-sexenio-changed", { detail: updated }));
    return updated;
  } catch (err) {
    console.error("Error saving sexenio info:", err);
    return DEFAULT_SEXENIO_INFO;
  }
}

export function resetSexenioInfo(): SexenioInfo {
  try {
    localStorage.removeItem(STORAGE_KEY_SEXENIO);
    window.dispatchEvent(new CustomEvent("zoomat-sexenio-changed", { detail: DEFAULT_SEXENIO_INFO }));
  } catch (err) {
    console.error("Error resetting sexenio info:", err);
  }
  return DEFAULT_SEXENIO_INFO;
}
