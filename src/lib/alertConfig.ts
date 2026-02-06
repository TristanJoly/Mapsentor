import { DepartmentData } from "./data";

export interface AlertCondition {
  column: keyof DepartmentData | string;
  direction: "low" | "high";
}

export interface AlertDefinition {
  label: string;
  conditions: AlertCondition[];
  explanation: string;
  action: string;
}

export interface AlertConfig {
  [metricKey: string]: {
    [alertId: string]: AlertDefinition;
  };
}

export const ALERT_CONFIG: AlertConfig = {
  // ============================
  // MÉTRIQUE : NOMBRE MALADIES
  // ============================
  "nombre_maladies": {
    "A": {
      label: "Désertification Médicale Critique",
      conditions: [
        { column: "access_med_generalistes", direction: "low" },
        { column: "MAL_CHRO_Oui", direction: "high" }
      ],
      explanation: "Forte charge de maladies chroniques avec faible accès aux médecins",
      action: "Déploiement de cabines de téléconsultation assistée"
    },
    "B": {
      label: "Risque de Rupture du Maintien à Domicile",
      conditions: [
        { column: "aide_menagere_personnes_agees", direction: "low" },
        { column: "part_75_plus", direction: "high" }
      ],
      explanation: "Population très âgée avec peu d'aides à domicile",
      action: "Renforcer les services d'aide à domicile"
    },
    "C": {
      label: "Fragilité Préventive",
      conditions: [
        { column: "Grippe_65_plus", direction: "low" },
        { column: "part_60_plus", direction: "high" }
      ],
      explanation: "Population âgée insuffisamment protégée",
      action: "Renforcer les campagnes de prévention"
    }
  },

  // ============================
  // MÉTRIQUE : PAUVRETÉ
  // ============================
  "taux_pauvrete_75": {
    "A": {
      label: "Précarité Locative",
      conditions: [
        { column: "aspa_effectif_2024", direction: "high" },
        { column: "60_74_proprietaires", direction: "low" }
      ],
      explanation: "Faible patrimoine et reste à vivre réduit",
      action: "Renforcement du Fonds de Solidarité Logement Seniors"
    },
    "B": {
      label: "Renoncement aux Soins",
      conditions: [
        { column: "access_med_generalistes", direction: "low" },
        { column: "taux_pauvrete_60", direction: "high" }
      ],
      explanation: "Barrières financières et géographiques cumulées",
      action: "Aides au transport et remboursement de trajets médicaux"
    },
    "C": {
      label: "Paupérisation Structurelle",
      conditions: [
        { column: "aspa_effectif_2024", direction: "high" },
        { column: "part_75_plus", direction: "high" }
      ],
      explanation: "Vieillissement et appauvrissement simultanés",
      action: "Révision des dotations de l'État"
    }
  },

  // ============================
  // MÉTRIQUE : ISOLEMENT
  // ============================
  "isoles_75_plus": {
    "A": {
      label: "Enfermement Rural",
      conditions: [
        { column: "isoles_75_plus", direction: "high" },
        { column: "75_plus_sans_voiture", direction: "high" }
      ],
      explanation: "Isolement social et impossibilité de mobilité",
      action: "Dispositifs de lien social et visites à domicile"
    },
    "B": {
      label: "Exclusion Numérique",
      conditions: [
        { column: "isoles_75_plus", direction: "high" },
        { column: "score_fragilite_numerique", direction: "high" }
      ],
      explanation: "Personnes isolées et invisibles administrativement",
      action: "Conseillers numériques itinérants"
    },
    "C": {
      label: "Enclavement Sanitaire",
      conditions: [
        { column: "access_med_generalistes", direction: "low" },
        { column: "75_plus_sans_voiture", direction: "high" }
      ],
      explanation: "Accès aux soins physiquement impossible",
      action: "Navettes communales et transport solidaire"
    }
  },

  // ============================
  // MÉTRIQUE : EHPAD
  // ============================
  "taux_ehpad_75_plus": {
    "A": {
      label: "Saturation de l'Offre EHPAD",
      conditions: [
        { column: "taux_ehpad_75_plus", direction: "high" },
        { column: "ehpad_nb_lits", direction: "low" }
      ],
      explanation: "Forte demande d'EHPAD avec capacité limitée",
      action: "Augmenter la capacité d'accueil en EHPAD"
    },
    "B": {
      label: "Dépendance Institutionnelle",
      conditions: [
        { column: "taux_ehpad_75_plus", direction: "high" },
        { column: "aide_menagere_personnes_agees", direction: "low" }
      ],
      explanation: "Manque d'alternatives au maintien à domicile",
      action: "Développer les SSIAD et aides à domicile"
    }
  },

  // ============================
  // MÉTRIQUE : ACCÈS MÉDECINS
  // ============================
  "access_med_generalistes": {
    "A": {
      label: "Désert Médical",
      conditions: [
        { column: "access_med_generalistes", direction: "low" },
        { column: "part_75_plus", direction: "high" }
      ],
      explanation: "Population âgée sans accès aux soins de proximité",
      action: "Incitations à l'installation de médecins"
    },
    "B": {
      label: "Isolement Géographique Sanitaire",
      conditions: [
        { column: "access_med_generalistes", direction: "low" },
        { column: "75_plus_sans_voiture", direction: "high" }
      ],
      explanation: "Cumul désert médical et absence de mobilité",
      action: "Transport médical subventionné"
    }
  }
};

// Calculate quantile value for a column
export const getQuantile = (data: DepartmentData[], column: string, quantile: number): number => {
  const values = data
    .map(d => parseFloat(String(d[column as keyof DepartmentData])) || 0)
    .filter(v => !isNaN(v) && v > 0)
    .sort((a, b) => a - b);
  
  if (values.length === 0) return 0;
  const index = Math.floor(quantile * (values.length - 1));
  return values[index];
};

// Check if value is low (below Q25)
export const isLow = (value: number, data: DepartmentData[], column: string): boolean => {
  if (isNaN(value) || value === 0) return false;
  const q25 = getQuantile(data, column, 0.25);
  return value <= q25;
};

// Check if value is high (above Q75)
export const isHigh = (value: number, data: DepartmentData[], column: string): boolean => {
  if (isNaN(value) || value === 0) return false;
  const q75 = getQuantile(data, column, 0.75);
  return value >= q75;
};

// Get department alerts for a specific metric
export const getDepartmentAlerts = (
  department: DepartmentData,
  metric: string,
  allData: DepartmentData[]
): AlertDefinition[] => {
  const metricConfig = ALERT_CONFIG[metric];
  if (!metricConfig) return [];

  const alerts: AlertDefinition[] = [];

  for (const alertId of Object.keys(metricConfig)) {
    const alert = metricConfig[alertId];
    let valid = true;

    for (const condition of alert.conditions) {
      const colName = String(condition.column);
      const value = parseFloat(String(department[colName as keyof DepartmentData])) || 0;
      
      if (condition.direction === "low" && !isLow(value, allData, colName)) {
        valid = false;
        break;
      }
      if (condition.direction === "high" && !isHigh(value, allData, colName)) {
        valid = false;
        break;
      }
    }

    if (valid) {
      alerts.push(alert);
    }
  }

  return alerts;
};

// Get all alerts for a department across all metrics
export const getAllDepartmentAlerts = (
  department: DepartmentData,
  allData: DepartmentData[]
): AlertDefinition[] => {
  const allAlerts: AlertDefinition[] = [];

  for (const metric of Object.keys(ALERT_CONFIG)) {
    const alerts = getDepartmentAlerts(department, metric, allData);
    allAlerts.push(...alerts);
  }

  return allAlerts;
};

// Get warning color based on number of alerts
export const getWarningColor = (alertCount: number): string => {
  if (alertCount === 0) return "#22c55e"; // green
  if (alertCount <= 2) return "#f59e0b"; // amber
  return "#ef4444"; // red
};
