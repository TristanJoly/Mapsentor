import Papa from 'papaparse';
import { normalizeMaladies } from './pathologyConfig';

export interface DepartmentData {
  code_departement: string;
  departement: string;
  population: number;
  part_femmes: number;
  part_60_plus: number;
  part_75_plus: number;
  taux_pauvrete_75: number;
  taux_pauvrete_60: number;
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
  // Demographic breakdown
  femmes_60_74_ans: number;
  femmes_75_plus: number;
  hommes_60_74_ans: number;
  hommes_75_plus: number;
  total_seniors: number;
  // Social profile 60-74
  menage_peu_diplome_60_74: number;
  menage_immigre_60_74: number;
  proprietaires_60_74: number;
  sans_voiture_60_74: number;
  // Social profile 75+
  proprietaires_75_plus: number;
  sans_voiture_75_plus: number;
  // Health indicators
  mal_chro_oui: number;
  handicap_oui: number;
  lfphysiques_oui: number;
  vue_difficulte: number;
  auditif_difficulte: number;
  etat_sante_mauvais: number;
  // Services
  aide_menagere_personnes_agees: number;
  apl_sapa: number;
  apl_ehpa: number;
  // Vaccination
  grippe_65_plus: number;
  covid_65_plus: number;
  // Fragilité numérique
  score_fragilite_numerique: number;
  // ASPA
  aspa_effectif_2024: number;
  aspa_effectif_2013: number;
  aspa_effectif_2014: number;
  aspa_effectif_2015: number;
  aspa_effectif_2016: number;
  aspa_effectif_2017: number;
  aspa_effectif_2018: number;
  aspa_effectif_2019: number;
  aspa_effectif_2020: number;
  aspa_effectif_2021: number;
  aspa_effectif_2022: number;
  aspa_effectif_2023: number;
  // LIVIA projections
  vol_glob_s1_f_2025: number;
  vol_glob_s1_f_2030: number;
  vol_glob_s1_f_2035: number;
  vol_glob_s1_f_2040: number;
  vol_glob_s1_f_2045: number;
  vol_glob_s1_f_2050: number;
  vol_glob_s1_h_2025: number;
  vol_glob_s1_h_2030: number;
  vol_glob_s1_h_2035: number;
  vol_glob_s1_h_2040: number;
  vol_glob_s1_h_2045: number;
  vol_glob_s1_h_2050: number;
  vol_glob_s2_f_2025: number;
  vol_glob_s2_f_2030: number;
  vol_glob_s2_f_2035: number;
  vol_glob_s2_f_2040: number;
  vol_glob_s2_f_2045: number;
  vol_glob_s2_f_2050: number;
  vol_glob_s2_h_2025: number;
  vol_glob_s2_h_2030: number;
  vol_glob_s2_h_2035: number;
  vol_glob_s2_h_2040: number;
  vol_glob_s2_h_2045: number;
  vol_glob_s2_h_2050: number;
  vol_glob_s3_f_2025: number;
  vol_glob_s3_f_2030: number;
  vol_glob_s3_f_2035: number;
  vol_glob_s3_f_2040: number;
  vol_glob_s3_f_2045: number;
  vol_glob_s3_f_2050: number;
  vol_glob_s3_h_2025: number;
  vol_glob_s3_h_2030: number;
  vol_glob_s3_h_2035: number;
  vol_glob_s3_h_2040: number;
  vol_glob_s3_h_2045: number;
  vol_glob_s3_h_2050: number;
  // Maladies 65+
  total_65_plus: number;
  total_femmes_65_plus: number;
  total_hommes_65_plus: number;
  maladies_65_plus: { [key: string]: number };
  // Maladies par genre
  maladies_femmes: { [key: string]: number };
  maladies_hommes: { [key: string]: number };
  // Pollution IREP
  irep_nb_sites: number;
  irep_nb_emetteurs: number;
  irep_emission_air_tonnes: number;
  irep_emission_eau_tonnes: number;
  irep_emission_sol_tonnes: number;
  irep_nb_polluants_air: number;
  irep_nb_polluants_eau: number;
  // Qualité de l'air ATMO
  atmo_indice_moyen: number;
  atmo_jours_bon: number;
  atmo_jours_moyen: number;
  atmo_jours_degrade: number;
  atmo_jours_mauvais: number;
  atmo_jours_tres_mauvais: number;
  // Qualité de l'eau
  eau_conformite_bacterio: number;
  eau_conformite_physicochim: number;
  eau_etat_eco_bon: number;
  eau_etat_eco_moyen: number;
  eau_etat_eco_mediocre: number;
  eau_etat_chimique_bon: number;
  eau_pesticides_depassement: number;
  [key: string]: string | number | { [key: string]: number };
}

export const metrics = [
  { id: "isoles_60_74", label: "Vulnérabilité sociale (seniors isolés)", unit: "", description: "Nombre de personnes isolées entre 60 et 74 ans" },
  { id: "taux_pauvrete_75", label: "Vulnérabilité économique (seniors démunis)", unit: "%", description: "Taux de pauvreté pour les plus de 75 ans" },
  { id: "mal_chro_oui", label: "Vulnérabilité sanitaire (seniors malades)", unit: "%", description: "Part des seniors atteints de maladies chroniques" },
];

let cachedData: DepartmentData[] | null = null;

export const loadDepartmentData = async (): Promise<DepartmentData[]> => {
  if (cachedData) return cachedData;

  try {
    const [response, pollutionResponse, atmoResponse, eauResponse] = await Promise.all([
      fetch('/data/departements.csv'),
      fetch('/data/pollution_departements.csv'),
      fetch('/data/atmo_departements.csv'),
      fetch('/data/eau_departements.csv'),
    ]);
    const csvText = await response.text();
    const pollutionText = await pollutionResponse.text();
    const atmoText = await atmoResponse.text();
    const eauText = await eauResponse.text();
    
    // Parse pollution data
    const pollutionResult = Papa.parse(pollutionText, { header: true, skipEmptyLines: true, delimiter: ';' });
    const pollutionMap: Record<string, any> = {};
    pollutionResult.data.forEach((row: any) => {
      const code = String(row.code_departement || '').trim();
      if (code) pollutionMap[code] = row;
    });

    // Parse ATMO data
    const atmoResult = Papa.parse(atmoText, { header: true, skipEmptyLines: true, delimiter: ';' });
    const atmoMap: Record<string, any> = {};
    atmoResult.data.forEach((row: any) => {
      const code = String(row.code_departement || '').trim();
      if (code) atmoMap[code] = row;
    });

    // Parse eau data
    const eauResult = Papa.parse(eauText, { header: true, skipEmptyLines: true, delimiter: ';' });
    const eauMap: Record<string, any> = {};
    eauResult.data.forEach((row: any) => {
      const code = String(row.code_departement || '').trim();
      if (code) eauMap[code] = row;
    });
    
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    // Helper function to find column value with flexible matching
    const findColumnValue = (row: any, possibleNames: string[]): string => {
      for (const name of possibleNames) {
        // Try exact match first
        if (row[name] !== undefined) return row[name];
        // Try with leading space
        if (row[` ${name}`] !== undefined) return row[` ${name}`];
        // Try trimmed version
        const trimmedName = name.trim();
        if (row[trimmedName] !== undefined) return row[trimmedName];
      }
      // Fallback: search through all keys
      for (const key of Object.keys(row)) {
        const normalizedKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        for (const name of possibleNames) {
          const normalizedName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          if (normalizedKey.includes(normalizedName) || normalizedName.includes(normalizedKey)) {
            return row[key];
          }
        }
      }
      return '';
    };

    cachedData = result.data.map((row: any) => {
      // Extract maladies data by category
      const total65Plus = parseFloat(row['≥ 65 ans - Total'] || row['total_65_plus'] || '0') || 0;
      const totalFemmes = parseFloat(row['Femmes - Total'] || '0') || 0;
      const totalHommes = parseFloat(row['Hommes - Total'] || '0') || 0;
      
      const extractMaladiesRaw = (prefix: string, total: number): { [key: string]: number } => {
        const result: { [key: string]: number } = {};
        Object.keys(row).forEach(key => {
          if (key.startsWith(prefix) && !key.includes('Total')) {
            const maladieName = key.replace(prefix, '');
            const effectif = parseFloat(row[key]) || 0;
            result[maladieName] = total > 0 ? (effectif / total) * 100 : effectif;
          }
        });
        return result;
      };
      
      const maladies_65_plus = normalizeMaladies(extractMaladiesRaw('≥ 65 ans - ', total65Plus));
      const maladies_femmes = normalizeMaladies(extractMaladiesRaw('Femmes - ', totalFemmes));
      const maladies_hommes = normalizeMaladies(extractMaladiesRaw('Hommes - ', totalHommes));

      return {
        total_65_plus: total65Plus,
        total_femmes_65_plus: totalFemmes,
        total_hommes_65_plus: totalHommes,
        code_departement: String(row['code_departement'] || row['Code département'] || '').trim(),
        departement: row['departement'] || row['Département'] || '',
        population: parseFloat(row['Population']) || 0,
        part_femmes: parseFloat(row['Part des femmes (en %)']) || 0,
        part_60_plus: parseFloat(row['Part des 60 ans ou plus (en %)']) || 0,
        part_75_plus: parseFloat(row['dont part des 75 ans ou plus (en %)']) || 0,
        taux_pauvrete_75: parseFloat(row['Taux de pauvrete pour plus de 75 ans']) || 0,
        taux_pauvrete_60: parseFloat(row['taux_pauvrete_calcul']) || 0,
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
        // Demographics
        femmes_60_74_ans: parseFloat(row['Femmes_60_74_ans']) || 0,
        femmes_75_plus: parseFloat(row['Femmes_75_ans_et_plus']) || 0,
        hommes_60_74_ans: parseFloat(row['Hommes_60_74_ans']) || 0,
        hommes_75_plus: parseFloat(row['Hommes_75_ans_et_plus']) || 0,
        total_seniors: (parseFloat(row['Femmes_60_74_ans']) || 0) + 
                       (parseFloat(row['Femmes_75_ans_et_plus']) || 0) +
                       (parseFloat(row['Hommes_60_74_ans']) || 0) +
                       (parseFloat(row['Hommes_75_ans_et_plus']) || 0),
        // Social profile 60-74
        menage_peu_diplome_60_74: parseFloat(row['60_74_menage_peu_diplome']) || 0,
        menage_immigre_60_74: parseFloat(row['60_74_menage_immigre']) || 0,
        proprietaires_60_74: parseFloat(row['60_74_proprietaires']) || 0,
        sans_voiture_60_74: parseFloat(row['60_74_sans_voiture']) || 0,
        // Social profile 75+
        proprietaires_75_plus: parseFloat(row['75_plus_proprietaires']) || 0,
        sans_voiture_75_plus: parseFloat(row['75_plus_sans_voiture']) || 0,
        // Health (converted to % of ensemble)
        mal_chro_oui: (() => {
          // Sum of all 65+ disease counts / total 65+ population
          const totalMaladies = Object.keys(row)
            .filter(k => k.startsWith('≥ 65 ans - ') && !k.includes('Total'))
            .reduce((sum, k) => sum + (parseFloat(row[k]) || 0), 0);
          return total65Plus > 0 ? (totalMaladies / total65Plus) * 100 : 0;
        })(),
        handicap_oui: (() => {
          const ensemble = parseFloat(row['HANDICAP_Ensemble']) || 0;
          const val = parseFloat(row['HANDICAP_Oui']) || 0;
          return ensemble > 0 ? (val / ensemble) * 100 : 0;
        })(),
        lfphysiques_oui: (() => {
          const ensemble = parseFloat(row['LFPHYSIQUES_Ensemble']) || 0;
          const val = parseFloat(row['LFPHYSIQUES_Oui']) || 0;
          return ensemble > 0 ? (val / ensemble) * 100 : 0;
        })(),
        vue_difficulte: (() => {
          const ensemble = parseFloat(row['VUE_Ensemble']) || 0;
          const val = parseFloat(row['VUE_1 - Beaucoup de difficultés ou ne peut pas du tout']) || 0;
          return ensemble > 0 ? (val / ensemble) * 100 : 0;
        })(),
        auditif_difficulte: (() => {
          const ensemble = parseFloat(row['AUDITIF_Ensemble']) || 0;
          const val = parseFloat(row['AUDITIF_1 - Beaucoup de difficultés ou ne peut pas du tout']) || 0;
          return ensemble > 0 ? (val / ensemble) * 100 : 0;
        })(),
        etat_sante_mauvais: (() => {
          const ensemble = parseFloat(row['ETAT_SANT_Ensemble']) || 0;
          const val = parseFloat(row['ETAT_SANT_4 - Mauvais ou très mauvais']) || 0;
          return ensemble > 0 ? (val / ensemble) * 100 : 0;
        })(),
        // Services
        aide_menagere_personnes_agees: parseFloat(row['aide_menagere_personnes_agees']) || 0,
        apl_sapa: parseFloat(row['APL_SAPA']) || 0,
        apl_ehpa: parseFloat(row['APL_EHPA']) || 0,
        // Vaccination
        grippe_65_plus: parseFloat(row['Grippe 65 ans et plus']) || 0,
        covid_65_plus: parseFloat(row['Covid-19 65 ans et plus']) || 0,
        // Fragilité numérique - headers are trimmed so no leading space
        score_fragilite_numerique: parseFloat(row['Score de fragilité numérique senior']) || 0,
        // ASPA
        aspa_effectif_2024: parseFloat(row['aspa_effectif_2024']) || 0,
        aspa_effectif_2013: parseFloat(row['aspa_effectif_2013']) || 0,
        aspa_effectif_2014: parseFloat(row['aspa_effectif_2014']) || 0,
        aspa_effectif_2015: parseFloat(row['aspa_effectif_2015']) || 0,
        aspa_effectif_2016: parseFloat(row['aspa_effectif_2016']) || 0,
        aspa_effectif_2017: parseFloat(row['aspa_effectif_2017']) || 0,
        aspa_effectif_2018: parseFloat(row['aspa_effectif_2018']) || 0,
        aspa_effectif_2019: parseFloat(row['aspa_effectif_2019']) || 0,
        aspa_effectif_2020: parseFloat(row['aspa_effectif_2020']) || 0,
        aspa_effectif_2021: parseFloat(row['aspa_effectif_2021']) || 0,
        aspa_effectif_2022: parseFloat(row['aspa_effectif_2022']) || 0,
        aspa_effectif_2023: parseFloat(row['aspa_effectif_2023']) || 0,
        // LIVIA S1
        vol_glob_s1_f_2025: parseFloat(row['vol_GLOB_s1_F_2025']) || 0,
        vol_glob_s1_f_2030: parseFloat(row['vol_GLOB_s1_F_2030']) || 0,
        vol_glob_s1_f_2035: parseFloat(row['vol_GLOB_s1_F_2035']) || 0,
        vol_glob_s1_f_2040: parseFloat(row['vol_GLOB_s1_F_2040']) || 0,
        vol_glob_s1_f_2045: parseFloat(row['vol_GLOB_s1_F_2045']) || 0,
        vol_glob_s1_f_2050: parseFloat(row['vol_GLOB_s1_F_2050']) || 0,
        vol_glob_s1_h_2025: parseFloat(row['vol_GLOB_s1_H_2025']) || 0,
        vol_glob_s1_h_2030: parseFloat(row['vol_GLOB_s1_H_2030']) || 0,
        vol_glob_s1_h_2035: parseFloat(row['vol_GLOB_s1_H_2035']) || 0,
        vol_glob_s1_h_2040: parseFloat(row['vol_GLOB_s1_H_2040']) || 0,
        vol_glob_s1_h_2045: parseFloat(row['vol_GLOB_s1_H_2045']) || 0,
        vol_glob_s1_h_2050: parseFloat(row['vol_GLOB_s1_H_2050']) || 0,
        // LIVIA S2
        vol_glob_s2_f_2025: parseFloat(row['vol_GLOB_s2_F_2025']) || 0,
        vol_glob_s2_f_2030: parseFloat(row['vol_GLOB_s2_F_2030']) || 0,
        vol_glob_s2_f_2035: parseFloat(row['vol_GLOB_s2_F_2035']) || 0,
        vol_glob_s2_f_2040: parseFloat(row['vol_GLOB_s2_F_2040']) || 0,
        vol_glob_s2_f_2045: parseFloat(row['vol_GLOB_s2_F_2045']) || 0,
        vol_glob_s2_f_2050: parseFloat(row['vol_GLOB_s2_F_2050']) || 0,
        vol_glob_s2_h_2025: parseFloat(row['vol_GLOB_s2_H_2025']) || 0,
        vol_glob_s2_h_2030: parseFloat(row['vol_GLOB_s2_H_2030']) || 0,
        vol_glob_s2_h_2035: parseFloat(row['vol_GLOB_s2_H_2035']) || 0,
        vol_glob_s2_h_2040: parseFloat(row['vol_GLOB_s2_H_2040']) || 0,
        vol_glob_s2_h_2045: parseFloat(row['vol_GLOB_s2_H_2045']) || 0,
        vol_glob_s2_h_2050: parseFloat(row['vol_GLOB_s2_H_2050']) || 0,
        // LIVIA S3
        vol_glob_s3_f_2025: parseFloat(row['vol_GLOB_s3_F_2025']) || 0,
        vol_glob_s3_f_2030: parseFloat(row['vol_GLOB_s3_F_2030']) || 0,
        vol_glob_s3_f_2035: parseFloat(row['vol_GLOB_s3_F_2035']) || 0,
        vol_glob_s3_f_2040: parseFloat(row['vol_GLOB_s3_F_2040']) || 0,
        vol_glob_s3_f_2045: parseFloat(row['vol_GLOB_s3_F_2045']) || 0,
        vol_glob_s3_f_2050: parseFloat(row['vol_GLOB_s3_F_2050']) || 0,
        vol_glob_s3_h_2025: parseFloat(row['vol_GLOB_s3_H_2025']) || 0,
        vol_glob_s3_h_2030: parseFloat(row['vol_GLOB_s3_H_2030']) || 0,
        vol_glob_s3_h_2035: parseFloat(row['vol_GLOB_s3_H_2035']) || 0,
        vol_glob_s3_h_2040: parseFloat(row['vol_GLOB_s3_H_2040']) || 0,
        vol_glob_s3_h_2045: parseFloat(row['vol_GLOB_s3_H_2045']) || 0,
        vol_glob_s3_h_2050: parseFloat(row['vol_GLOB_s3_H_2050']) || 0,
        // Maladies
        maladies_65_plus,
        maladies_femmes,
        maladies_hommes,
        // Pollution IREP
        ...(() => {
          const code = String(row['code_departement'] || row['Code département'] || '').trim();
          const p = pollutionMap[code] || {};
          return {
            irep_nb_sites: parseFloat(p.nb_sites_irep) || 0,
            irep_nb_emetteurs: parseFloat(p.nb_sites_emetteurs) || 0,
            irep_emission_air_tonnes: parseFloat(p.emission_air_tonnes) || 0,
            irep_emission_eau_tonnes: parseFloat(p.emission_eau_tonnes) || 0,
            irep_emission_sol_tonnes: parseFloat(p.emission_sol_tonnes) || 0,
            irep_nb_polluants_air: parseFloat(p.nb_polluants_air) || 0,
            irep_nb_polluants_eau: parseFloat(p.nb_polluants_eau) || 0,
          };
        })(),
        // Qualité de l'air ATMO
        ...(() => {
          const code = String(row['code_departement'] || row['Code département'] || '').trim();
          const a = atmoMap[code] || {};
          return {
            atmo_indice_moyen: parseFloat(a.indice_atmo_moyen) || 0,
            atmo_jours_bon: parseFloat(a.jours_bon) || 0,
            atmo_jours_moyen: parseFloat(a.jours_moyen) || 0,
            atmo_jours_degrade: parseFloat(a.jours_degrade) || 0,
            atmo_jours_mauvais: parseFloat(a.jours_mauvais) || 0,
            atmo_jours_tres_mauvais: parseFloat(a.jours_tres_mauvais) || 0,
          };
        })(),
        // Qualité de l'eau
        ...(() => {
          const code = String(row['code_departement'] || row['Code département'] || '').trim();
          const e = eauMap[code] || {};
          return {
            eau_conformite_bacterio: parseFloat(e.conformite_bacterio) || 0,
            eau_conformite_physicochim: parseFloat(e.conformite_physicochim) || 0,
            eau_etat_eco_bon: parseFloat(e.etat_eco_bon) || 0,
            eau_etat_eco_moyen: parseFloat(e.etat_eco_moyen) || 0,
            eau_etat_eco_mediocre: parseFloat(e.etat_eco_mediocre) || 0,
            eau_etat_chimique_bon: parseFloat(e.etat_chimique_bon) || 0,
            eau_pesticides_depassement: parseFloat(e.taux_pesticides_depassement) || 0,
          };
        })(),
      };
    }) as DepartmentData[];

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

export const getAverage = (data: DepartmentData[], field: keyof DepartmentData): number => {
  const values = data.map(d => d[field] as number).filter(v => !isNaN(v) && v > 0);
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
};
