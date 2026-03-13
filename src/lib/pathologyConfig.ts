/**
 * Mapping des noms de colonnes CSV vers les noms d'affichage normalisés.
 * Seules les pathologies présentes ici seront conservées.
 */
export const CSV_TO_DISPLAY_NAME: Record<string, string> = {
  // Pathologies précises uniquement — exclusion des catégories "Autres..." et "Affections de longue durée"
  "Accident vasculaire cérébral aigu": "AVC aigu",
  "Cancer colorectal actif": "Cancer colorectal actif",
  "Cancer colorectal sous surveillance": "Cancer colorectal (surveillance)",
  "Cancer de la prostate actif": "Cancer de la prostate actif",
  "Cancer de la prostate sous surveillance": "Cancer de la prostate (surveillance)",
  "Cancer du sein de la femme actif": "Cancer du sein actif",
  "Cancer du sein de la femme sous surveillance": "Cancer du sein (surveillance)",
  "Diabète": "Diabète",
  "Dialyse chronique": "Dialyse chronique",
  "Déficience mentale": "Déficience mentale",
  "Démences (dont maladie d'Alzheimer)": "Démences (dont Alzheimer)",
  "Insuffisance cardiaque aiguë": "Insuffisance cardiaque aiguë",
  "Insuffisance cardiaque chronique": "Insuffisance cardiaque chronique",
  "Maladie coronaire chronique": "Maladie coronaire chronique",
  "Maladie de Parkinson": "Maladie de Parkinson",
  "Maladie valvulaire": "Maladie valvulaire",
  "Maladies du foie ou du pancréas (hors mucoviscidose)": "Maladies du foie ou du pancréas",
  "Maladies inflammatoires chroniques intestinales": "MICI",
  "Maladies métaboliques héréditaires ou amylose": "Maladies métaboliques héréditaires / amylose",
  "Maladies respiratoires chroniques (hors mucoviscidose)": "Maladies respiratoires chroniques",
  "Maternité (avec ou sans pathologies)": "Maternité",
  "Mucoviscidose": "Mucoviscidose",
  "Myopathie ou myasthénie": "Myopathie / myasthénie",
  "Suivi de transplantation rénale": "Suivi transplantation rénale",
  "Syndrome coronaire aigu": "Syndrome coronaire aigu",
  "Troubles addictifs": "Troubles addictifs",
  "Troubles du rythme ou de la conduction cardiaque": "Troubles du rythme cardiaque",
  "Troubles névrotiques et de l'humeur": "Troubles névrotiques / humeur",
  "Troubles psychotiques": "Troubles psychotiques",
  "VIH ou SIDA": "VIH / SIDA",
  "Épilepsie": "Épilepsie",
  "Transplantation rénale": "Transplantation rénale",

  // Renommages CSV → affichage
  "Artériopathie oblitérante du membre inférieur": "Artériopathie périphérique",
  "Cancer du poumon actif": "Cancer bronchopulmonaire actif",
  "Cancer du poumon sous surveillance": "Cancer bronchopulmonaire (surveillance)",
  "Embolie pulmonaire aiguë": "Embolie pulmonaire",
  "Hémophilie ou troubles de l'hémostase graves": "Hémophilie / troubles hémostase",
  "Paraplégie": "Lésion médullaire",
  "Polyarthrite rhumatoïde et maladies apparentées": "Polyarthrite rhumatoïde",
  "Sclérose en plaques": "Sclérose en plaques",
  "Spondylarthrite ankylosante et maladies apparentées": "Spondylarthrite ankylosante",
  "Séjours hospitaliers pour Covid-19": "Hospitalisation Covid-19",
  "Séquelle d'accident vasculaire cérébral": "Séquelle d'AVC",
  "Troubles psychiatriques ayant débuté dans l'enfance": "Troubles psychiatriques de l'enfance",
};

/**
 * Normalise et filtre un dictionnaire de maladies brutes (extraites du CSV)
 * en ne gardant que les pathologies autorisées et en les renommant.
 */
export const normalizeMaladies = (raw: Record<string, number>): Record<string, number> => {
  const result: Record<string, number> = {};
  for (const [csvName, value] of Object.entries(raw)) {
    const displayName = CSV_TO_DISPLAY_NAME[csvName];
    if (displayName && value > 0) {
      result[displayName] = value;
    }
  }
  return result;
};
