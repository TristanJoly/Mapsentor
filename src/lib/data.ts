import Papa from 'papaparse';

export interface DepartmentData {
  code_departement: string;
  departement: string;
  population: number;
  part_femmes: number;
  part_60_plus: number;
  part_75_plus: number;
  taux_pauvrete_75: number;
  niveau_vie_median: number;
  revenu_median_60_74: number;
  revenu_median_75_plus: number;
  isoles_60_74: number;
  isoles_75_plus: number;
  femmes_60_74_isolees: number;
  femmes_75_plus_isolees: number;
  taux_ehpad_75_plus: number;
  ehpad_nb_etab: number;
  ehpad_nb_lits: number;
  esperance_vie: number;
  access_med_generalistes: number;
  region: string;
  [key: string]: string | number;
}

export const metrics = [
  { id: "taux_pauvrete_75", label: "Taux de pauvreté 75+", unit: "%", description: "Taux de pauvreté pour les plus de 75 ans" },
  { id: "part_75_plus", label: "Part des 75 ans et plus", unit: "%", description: "Pourcentage de la population de 75 ans et plus" },
  { id: "isoles_75_plus", label: "Personnes isolées 75+", unit: "", description: "Nombre de personnes isolées de 75 ans et plus" },
  { id: "isoles_60_74", label: "Personnes isolées 60-74", unit: "", description: "Nombre de personnes isolées entre 60 et 74 ans" },
  { id: "taux_ehpad_75_plus", label: "Taux EHPAD 75+", unit: "%", description: "Taux d'entrée en EHPAD pour les 75+" },
  { id: "niveau_vie_median", label: "Niveau de vie médian", unit: "€", description: "Niveau de vie médian des ménages" },
  { id: "access_med_generalistes", label: "Accès médecins", unit: "", description: "Accessibilité aux médecins généralistes" },
  { id: "esperance_vie", label: "Espérance de vie", unit: "ans", description: "Espérance de vie à la naissance" },
];

let cachedData: DepartmentData[] | null = null;

export const loadDepartmentData = async (): Promise<DepartmentData[]> => {
  if (cachedData) return cachedData;

  try {
    const response = await fetch('/data/departements.csv');
    const csvText = await response.text();
    
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    cachedData = result.data.map((row: any) => ({
      code_departement: String(row['code_departement'] || row['Code département'] || '').trim(),
      departement: row['departement'] || row['Département'] || '',
      population: parseFloat(row['Population']) || 0,
      part_femmes: parseFloat(row['Part des femmes (en %)']) || 0,
      part_60_plus: parseFloat(row['Part des 60 ans ou plus (en %)']) || 0,
      part_75_plus: parseFloat(row['dont part des 75 ans ou plus (en %)']) || 0,
      taux_pauvrete_75: parseFloat(row['Taux de pauvrete pour plus de 75 ans']) || 0,
      niveau_vie_median: parseFloat(row['Niveau de vie médian des ménages (en euros)']) || 0,
      revenu_median_60_74: parseFloat(row['revenu_median_60_74']) || 0,
      revenu_median_75_plus: parseFloat(row['revenu_median_75_plus']) || 0,
      isoles_60_74: parseFloat(row['60_74_isoles']) || 0,
      isoles_75_plus: parseFloat(row['75_plus_isoles']) || 0,
      femmes_60_74_isolees: parseFloat(row['femmes_60_74_isolees']) || 0,
      femmes_75_plus_isolees: parseFloat(row['femmes_75_plus_isolees']) || 0,
      taux_ehpad_75_plus: parseFloat(row['Taux_EHPAD_75_plus']) || 0,
      ehpad_nb_etab: parseFloat(row['EHPAD_nb_etab']) || 0,
      ehpad_nb_lits: parseFloat(row['EHPAD_nb_lits']) || 0,
      esperance_vie: parseFloat(row['esp']) || 0,
      access_med_generalistes: parseFloat(row['access_med_generalistes']) || 0,
      region: row[Object.keys(row).pop() || ''] || '',
    })) as DepartmentData[];

    return cachedData;
  } catch (error) {
    console.error('Error loading department data:', error);
    return [];
  }
};

export const getMetricRange = (data: DepartmentData[], metricId: string): [number, number] => {
  const values = data.map(d => d[metricId] as number).filter(v => !isNaN(v) && v > 0);
  if (values.length === 0) return [0, 100];
  return [Math.min(...values), Math.max(...values)];
};

export const formatValue = (value: number, metricId: string): string => {
  const metric = metrics.find(m => m.id === metricId);
  if (!metric) return String(value);

  if (metric.unit === '€') {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  }
  if (metric.unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  if (value > 1000) {
    return new Intl.NumberFormat('fr-FR').format(Math.round(value));
  }
  return value.toFixed(1);
};
