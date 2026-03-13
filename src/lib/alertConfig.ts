import { DepartmentData } from "./data";

export interface AlertLever {
  title: string;
  detail: string;
  url?: string;
  isNew?: boolean;
}

export interface AlertCondition {
  column: keyof DepartmentData | string;
  direction: "low" | "high";
  label: string; // Human-readable label for the condition
}

export interface AlertDefinition {
  id: string;
  label: string;
  category: "sanitaire" | "economique" | "social";
  conditions: AlertCondition[];
  explanation: string;
  levers: AlertLever[];
  headerNote?: string;
  source?: string;
}

// ==========================================
// QUARTILE-BASED THRESHOLDS (Q1 = 25%, Q4 = 75%)
// ==========================================

export const getQuartile = (data: DepartmentData[], column: string, quartile: number): number => {
  const values = data
    .map(d => {
      if (column === "top5_prevalence") return getTop5Prevalence(d);
      if (column === "vaccination_avg") return (d.grippe_65_plus + d.covid_65_plus) / 2;
      if (column === "total_75_plus") return d.femmes_75_plus + d.hommes_75_plus;
      if (column === "isolement_social") return d.isoles_60_74 + d.isoles_75_plus;
      return parseFloat(String(d[column as keyof DepartmentData])) || 0;
    })
    .filter(v => !isNaN(v) && v > 0)
    .sort((a, b) => a - b);

  if (values.length === 0) return 0;
  const index = Math.floor(quartile * (values.length - 1));
  return values[index];
};

// Helper: get top 5 pathologies prevalence sum
const getTop5Prevalence = (d: DepartmentData): number => {
  const maladies = d.maladies_65_plus;
  if (!maladies || Object.keys(maladies).length === 0) return 0;
  const top5 = Object.values(maladies).filter(v => v > 0).sort((a, b) => b - a).slice(0, 5);
  return top5.reduce((sum, v) => sum + v, 0);
};

// Get department value for a condition column
export const getDeptValue = (department: DepartmentData, column: string): number => {
  if (column === "top5_prevalence") return getTop5Prevalence(department);
  if (column === "vaccination_avg") return (department.grippe_65_plus + department.covid_65_plus) / 2;
  if (column === "total_75_plus") return department.femmes_75_plus + department.hommes_75_plus;
  if (column === "isolement_social") return department.isoles_60_74 + department.isoles_75_plus;
  return parseFloat(String(department[column as keyof DepartmentData])) || 0;
};

// Q1 = premier quartile (bas) — le département est dans les 25% les plus bas
export const isInQ1 = (value: number, data: DepartmentData[], column: string): boolean => {
  if (isNaN(value) || value === 0) return false;
  const q1 = getQuartile(data, column, 0.25);
  return value <= q1;
};

// Q4 = dernier quartile (haut) — le département est dans les 25% les plus hauts
export const isInQ4 = (value: number, data: DepartmentData[], column: string): boolean => {
  if (isNaN(value) || value === 0) return false;
  const q4 = getQuartile(data, column, 0.75);
  return value >= q4;
};

// Legacy exports for compatibility
export const getDecile = getQuartile;
export const getQuantile = getQuartile;
export const isLow = isInQ1;
export const isHigh = isInQ4;

// ==========================================
// ALERT DEFINITIONS
// ==========================================

export const ALERT_DEFINITIONS: AlertDefinition[] = [
  // ============================
  // 1. FOND DE CARTE SANITAIRE
  // ============================
  {
    id: "sanitaire_A",
    label: "Désertification Médicale Critique",
    category: "sanitaire",
    headerNote: "Médicobus : une démarche « d'aller vers » les patients éloignés des soins dans les territoires ruraux",
    conditions: [
      { column: "access_med_generalistes", direction: "low", label: "APL Médecins Généralistes" },
      { column: "top5_prevalence", direction: "high", label: "Prévalence Top 5 Pathologies" },
    ],
    explanation: "Forte charge de maladies chroniques dans un territoire en désert médical. Les patients n'ont pas de médecin traitant à proximité pour gérer leurs pathologies.",
    source: "APL médecins : DREES – Panorama statistique 2024 · Prévalence pathologies : Ameli (CNAM) 2023",
    levers: [
      {
        title: "Cabines de téléconsultation assistée en officine",
        detail: "Installation de bornes équipées (stéthoscope, otoscope connectés) dans les pharmacies ou mairies. Le pharmacien accompagne le patient, ce qui rassure le senior et valide le diagnostic à distance.",
      },
      {
        title: "Infirmiers en Pratique Avancée (IPA)",
        detail: "Financer l'installation ou la formation d'IPA libéraux. Ces infirmiers ont le droit de suivre des patients chroniques stables, de renouveler des ordonnances et de prescrire des examens, libérant du temps médical pour les médecins généralistes surchargés.",
        isNew: true,
      },
    ],
  },
  {
    id: "sanitaire_B",
    label: "Risque de Rupture de Maintien à Domicile",
    category: "sanitaire",
    conditions: [
      { column: "apl_sapa", direction: "low", label: "Aides à domicile (APL SAPA)" },
      { column: "total_75_plus", direction: "high", label: "Population 75+" },
    ],
    explanation: "Nombre élevé de personnes très âgées avec très peu d'aides à domicile disponibles. Risque de placements en EHPAD par défaut ou de situations de maltraitance par négligence.",
    source: "APL SAPA : DREES – Panorama statistique 2024 · Population 75+ : INSEE RP 2020",
    levers: [
      {
        title: "Plateforme Territoriale des Métiers de l'Autonomie",
        detail: "Création d'un guichet unique départemental pour mutualiser les recrutements, proposer des formations locales immédiates et améliorer l'attractivité (prêt de véhicule, flotte électrique) pour les aides à domicile, afin de combler les postes vacants rapidement.",
      },
      {
        title: "« Baluchonnage » (Relayage à domicile)",
        detail: "Déployer ce dispositif qui permet à un professionnel unique de venir vivre au domicile de la personne âgée pendant plusieurs jours (24h/24) pour permettre aux aidants familiaux de souffler sans envoyer le senior en EHPAD. Cela évite l'épuisement et les hospitalisations d'urgence.",
        url: "https://baluchonfrance.com/baluchonnage/",
        isNew: true,
      },
    ],
  },
  {
    id: "sanitaire_C",
    label: "Fragilité Préventive",
    category: "sanitaire",
    conditions: [
      { column: "vaccination_avg", direction: "low", label: "Taux de vaccination" },
      { column: "part_75_plus", direction: "high", label: "Indice de vieillissement" },
    ],
    explanation: "Population très âgée insuffisamment vaccinée. Le risque de complications graves (grippe, Covid) est majoré, pouvant saturer les urgences hospitalières locales.",
    source: "Vaccination : Santé publique France / Ameli 2023 · Vieillissement : INSEE RP 2020",
    levers: [
      {
        title: "Campagnes mobiles « Aller-vers »",
        detail: "Mise en place d'équipes mobiles (partenariat Croix-Rouge / ARS) qui se déplacent directement au domicile des +75 ans isolés pour effectuer la vaccination (Grippe/Covid/Zona), sans attendre qu'ils prennent rendez-vous.",
        url: "https://www.iledefrance.ars.sante.fr/equipes-mobiles-dispositifs-territorialises-daller-vers-aupres-des-personnes-en-grande-precarite",
      },
      {
        title: "Programme ICOPE (OMS)",
        detail: "Former les professionnels locaux (pharmaciens, kinés) à l'utilisation de l'outil ICOPE de l'OMS : dépistage rapide (vision, audition, nutrition, psychologie) pour repérer les fragilités avant qu'elles ne deviennent des pathologies lourdes. C'est le standard mondial de la prévention seniors.",
        url: "https://www.ameli.fr/yvelines/pharmacien/actualites/icope-un-programme-pour-reperer-la-perte-de-l-autonomie-chez-le-patient-des-60-ans",
        isNew: true,
      },
    ],
  },

  // ============================
  // 2. FOND DE CARTE ÉCONOMIQUE
  // ============================
  {
    id: "economique_A",
    label: "Précarité Locative",
    category: "economique",
    conditions: [
      { column: "aspa_effectif_2024", direction: "high", label: "Bénéficiaires ASPA" },
      { column: "proprietaires_75_plus", direction: "low", label: "Part de propriétaires" },
    ],
    explanation: "Si pauvre + loyer : le reste à vivre pour manger ou se soigner est minime/insuffisant. Ces seniors cumulent faibles revenus et charges locatives.",
    source: "ASPA : Caisse des Dépôts / DREES 2024 · Propriétaires : INSEE RP 2020",
    levers: [
      {
        title: "Renforcement ciblé du FSL (Fonds de Solidarité Logement)",
        detail: "Flécher une ligne budgétaire spécifique du FSL départemental pour les « Seniors locataires du parc privé », couvrant non seulement les impayés de loyer mais aussi l'apurement des dettes d'énergie (chauffage), poste de dépense critique pour les personnes âgées précaires.",
        url: "https://www.fondationpourlelogement.fr/prevention-expulsion/questions-frequentes/le-fonds-de-solidarite-pour-le-logement/",
      },
      {
        title: "Habitat Inclusif (Aide à la Vie Partagée - AVP)",
        detail: "Encourager la création de petites unités de vie (colocations seniors) où les habitants partagent les frais (loyer, alimentation) et mutualisent une présence auxiliaire. Alternative économique à l'EHPAD et à la solitude du logement individuel.",
        url: "https://www.cnsa.fr/budget-et-financement/financement-aux-departements/aide-la-vie-sociale-et-partagee-et-le-forfait",
        isNew: true,
      },
    ],
  },
  {
    id: "economique_B",
    label: "Risque de Renoncement aux Soins",
    category: "economique",
    conditions: [
      { column: "access_med_generalistes", direction: "low", label: "APL Médecins Généralistes" },
      { column: "taux_pauvrete_60", direction: "high", label: "Taux de pauvreté 65+" },
    ],
    explanation: "C'est le cumul des barrières : il faut aller loin (donc payer de l'essence) avec des revenus faibles. Beaucoup renoncent purement et simplement à se soigner.",
    source: "APL médecins : DREES – Panorama statistique 2024 · Pauvreté : FILOSOFI (INSEE) 2020",
    levers: [
      {
        title: "Dispositif « Sortir Plus » et Chèques Mobilité",
        detail: "Généraliser l'accès aux chèques CESU préfinancés (type « Sortir Plus » Agirc-Arrco) permettant de payer n'importe quel transporteur agréé ou accompagnateur pour se rendre à un rendez-vous médical, sans avance de frais pour le senior.",
        url: "https://www.pour-les-personnes-agees.gouv.fr/preserver-son-autonomie/preserver-son-autonomie-et-sa-sante/le-service-sortir-plus-pour-renouer-avec-l-exterieur",
      },
      {
        title: "Campagne « Data-mining » contre le non-recours à la C2S",
        detail: "Croiser les données de la CAF/CARSAT pour identifier les retraités éligibles à la Complémentaire Santé Solidaire (ex-CMU-C) qui ne l'ont pas demandée. Les contacter proactivement pour ouvrir leurs droits, garantissant la gratuité des soins.",
        url: "https://www.complementaire-sante-solidaire.gouv.fr/actualites/etudes/lutter-contre-le-non-recours-la-complementaire-sante-solidaire-des-demandeurs",
        isNew: true,
      },
    ],
  },
  {
    id: "economique_C",
    label: "Paupérisation Structurelle",
    category: "economique",
    conditions: [
      { column: "aspa_effectif_2024", direction: "high", label: "Bénéficiaires ASPA" },
      { column: "part_75_plus", direction: "high", label: "Indice de vieillissement" },
    ],
    explanation: "Le département vieillit et s'appauvrit simultanément. Les ressources fiscales vont diminuer alors que les besoins d'aides sociales vont augmenter.",
    source: "ASPA : Caisse des Dépôts / DREES 2024 · Vieillissement : INSEE RP 2020",
    levers: [
      {
        title: "Contractualisation via le Pacte des Solidarités",
        detail: "Utiliser ces données d'alerte pour négocier avec le Préfet une augmentation de la dotation de l'État dans le cadre des contrats locaux de solidarité, en prouvant la spécificité de la précarité du territoire. Transformer un constat alarmant en argument de négociation politique et financier.",
        url: "https://solidarites.gouv.fr/le-pacte-des-solidarites-lutter-contre-la-pauvrete-la-racine",
      },
      {
        title: "Activation stratégique de la Conférence des Financeurs",
        detail: "Réunir la Conférence des Financeurs de la Prévention de la Perte d'Autonomie (instance obligatoire) pour rediriger les fonds non utilisés de la CNSA spécifiquement vers ces zones en alerte rouge, plutôt que de les saupoudrer sur tout le département.",
        url: "https://www.cnsa.fr/publications/conference-des-financeurs-de-la-prevention-de-la-perte-dautonomie-guide-technique",
        isNew: true,
      },
    ],
  },

  // ============================
  // 3. FOND DE CARTE SOCIALE
  // ============================
  {
    id: "social_A",
    label: "Enfermement Rural",
    category: "social",
    conditions: [
      { column: "isolement_social", direction: "high", label: "Isolement social" },
      { column: "sans_voiture_75_plus", direction: "high", label: "Sans voiture (75+)" },
    ],
    explanation: "Ces personnes sont seules chez elles et ne peuvent pas en sortir physiquement : pas de médecin, pas de courses, pas de lien social. C'est la mort sociale.",
    source: "Isolement : INSEE RP 2020 · Sans voiture : INSEE RP 2020, indicateurs 75+",
    levers: [
      {
        title: "Réseau MONALISA (Équipes Citoyennes)",
        detail: "Soutenir la création d'équipes de bénévoles formés (Charte Monalisa) qui effectuent des visites de convivialité régulières. Ce n'est pas du soin, c'est du lien social pur pour briser la mort sociale.",
        url: "https://www.monalisa-asso.fr/",
      },
      {
        title: "Service « Veiller sur mes parents » (La Poste)",
        detail: "Le département peut inclure dans le plan d'aide APA le financement de visites hebdomadaires par le facteur. Le facteur discute, vérifie les besoins (courses, moral) et fait remonter une alerte numérique aux services sociaux si besoin.",
        url: "https://www.laposte.fr/services-seniors/teleassistance",
        isNew: true,
      },
    ],
  },
  {
    id: "social_B",
    label: "Exclusion Numérique",
    category: "social",
    conditions: [
      { column: "isolement_social", direction: "high", label: "Isolement social" },
      { column: "score_fragilite_numerique", direction: "high", label: "Fragilité numérique" },
    ],
    explanation: "Personne seule + ne sait pas utiliser Internet. Cette personne ne demandera jamais les aides auxquelles elle a droit et ne prendra pas RDV sur Doctolib. Elle est invisible administrativement.",
    source: "Isolement : INSEE RP 2020 · Fragilité numérique : score composite INSEE (diplôme, accès Internet)",
    levers: [
      {
        title: "Conseillers Numériques France Services Itinérants",
        detail: "Déploiement de conseillers numériques équipés de matériel mobile (tablettes 4G/Satellitaire) qui tiennent des permanences dans les petits villages (mairies, salles des fêtes) pour faire les démarches avec l'usager.",
      },
      {
        title: "Habilitation « Aidants Connect »",
        detail: "Former et habiliter les travailleurs sociaux locaux (assistantes sociales, secrétaires de mairie) au dispositif « Aidants Connect ». Cela leur permet de réaliser des démarches en ligne à la place de la personne âgée de manière légale et sécurisée, sans avoir à demander ses mots de passe.",
        url: "https://beta.gouv.fr/startups/aidantsconnect.html",
        isNew: true,
      },
    ],
  },
  {
    id: "social_C",
    label: "Enclavement Sanitaire",
    category: "social",
    conditions: [
      { column: "access_med_generalistes", direction: "low", label: "APL Médecins Généralistes" },
      { column: "sans_voiture_75_plus", direction: "high", label: "Sans voiture (75+)" },
    ],
    explanation: "L'APL est basse (médecins loin) et les gens n'ont pas de voiture. Si pas de transports en commun ou d'ambulances, l'accès au soin est physiquement impossible.",
    source: "APL médecins : DREES – Panorama statistique 2024 · Sans voiture : INSEE RP 2020",
    levers: [
      {
        title: "Transport à la Demande (TAD) zonal",
        detail: "Mise en place de navettes qui ne circulent que sur réservation (téléphone/appli pour les aidants), connectant les hameaux isolés aux pôles de santé (Maison de Santé Pluriprofessionnelle) à des horaires alignés sur les consultations.",
      },
      {
        title: "Équipes Mobiles de Gériatrie (EMG) extra-hospitalières",
        detail: "Si le patient ne peut aller à l'hôpital, l'hôpital vient à lui. Conventionner avec le Centre Hospitalier le plus proche pour que l'EMG intervienne au domicile pour des évaluations gériatriques complexes, évitant le déplacement traumatisant du senior.",
        url: "https://www.ghsif.fr/Equipe-Mobile-Geriatrie/5/104/48",
        isNew: true,
      },
    ],
  },
];

// Map metrics to alert categories
const METRIC_TO_CATEGORY: Record<string, "sanitaire" | "economique" | "social"> = {
  "mal_chro_oui": "sanitaire",
  "taux_pauvrete_75": "economique",
  "isoles_60_74": "social",
};

// Get department alerts for a specific metric (filtered by category)
export const getDepartmentAlerts = (
  department: DepartmentData,
  metric: string,
  allData: DepartmentData[]
): AlertDefinition[] => {
  const category = METRIC_TO_CATEGORY[metric];
  if (!category) return [];

  return ALERT_DEFINITIONS.filter(alert => {
    if (alert.category !== category) return false;
    
    return alert.conditions.every(condition => {
      const value = getDeptValue(department, String(condition.column));
      if (condition.direction === "low") return isInQ1(value, allData, String(condition.column));
      if (condition.direction === "high") return isInQ4(value, allData, String(condition.column));
      return false;
    });
  });
};

// Get all alerts for a department across all categories
export const getAllDepartmentAlerts = (
  department: DepartmentData,
  allData: DepartmentData[]
): AlertDefinition[] => {
  return ALERT_DEFINITIONS.filter(alert => {
    return alert.conditions.every(condition => {
      const value = getDeptValue(department, String(condition.column));
      if (condition.direction === "low") return isInQ1(value, allData, String(condition.column));
      if (condition.direction === "high") return isInQ4(value, allData, String(condition.column));
      return false;
    });
  });
};

// Get warning color based on number of alerts
export const getWarningColor = (alertCount: number): string => {
  if (alertCount === 0) return "#22c55e";
  if (alertCount <= 2) return "#f59e0b";
  return "#ef4444";
};
