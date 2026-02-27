/**
 * Mapping des noms de colonnes CSV vers les noms d'affichage normalisés.
 * Seules les pathologies présentes ici seront conservées.
 */
export const CSV_TO_DISPLAY_NAME: Record<string, string> = {
  // Correspondances directes
  "Accident vasculaire cérébral aigu": "Accident vasculaire cérébral aigu",
  "Autres affections cardiovasculaires": "Autres affections cardiovasculaires",
  "Autres affections neurologiques": "Autres affections neurologiques",
  "Autres cancers actifs": "Autres cancers actifs",
  "Autres cancers sous surveillance": "Autres cancers sous surveillance",
  "Autres maladies inflammatoires chroniques": "Autres maladies inflammatoires chroniques",
  "Autres troubles psychiatriques": "Autres troubles psychiatriques",
  "Cancer colorectal actif": "Cancer colorectal actif",
  "Cancer colorectal sous surveillance": "Cancer colorectal sous surveillance",
  "Cancer de la prostate actif": "Cancer de la prostate actif",
  "Cancer de la prostate sous surveillance": "Cancer de la prostate sous surveillance",
  "Cancer du sein de la femme actif": "Cancer du sein de la femme actif",
  "Cancer du sein de la femme sous surveillance": "Cancer du sein de la femme sous surveillance",
  "Diabète": "Diabète",
  "Dialyse chronique": "Dialyse chronique",
  "Déficience mentale": "Déficience mentale",
  "Démences (dont maladie d'Alzheimer)": "Démences (dont maladie d'Alzheimer)",
  "Insuffisance cardiaque aiguë": "Insuffisance cardiaque aiguë",
  "Insuffisance cardiaque chronique": "Insuffisance cardiaque chronique",
  "Maladie coronaire chronique": "Maladie coronaire chronique",
  "Maladie de Parkinson": "Maladie de Parkinson",
  "Maladie valvulaire": "Maladie valvulaire",
  "Maladies du foie ou du pancréas (hors mucoviscidose)": "Maladies du foie ou du pancréas (hors mucoviscidose)",
  "Maladies inflammatoires chroniques intestinales": "Maladies inflammatoires chroniques intestinales",
  "Maladies métaboliques héréditaires ou amylose": "Maladies métaboliques héréditaires ou amylose",
  "Maladies respiratoires chroniques (hors mucoviscidose)": "Maladies respiratoires chroniques (hors mucoviscidose)",
  "Maternité (avec ou sans pathologies)": "Maternité (avec ou sans pathologies)",
  "Mucoviscidose": "Mucoviscidose",
  "Myopathie ou myasthénie": "Myopathie ou myasthénie",
  "Suivi de transplantation rénale": "Suivi de transplantation rénale",
  "Syndrome coronaire aigu": "Syndrome coronaire aigu",
  "Troubles addictifs": "Troubles addictifs",
  "Troubles du rythme ou de la conduction cardiaque": "Troubles du rythme ou de la conduction cardiaque",
  "Troubles névrotiques et de l'humeur": "Troubles névrotiques et de l'humeur",
  "Troubles psychotiques": "Troubles psychotiques",
  "VIH ou SIDA": "Infection par le VIH",
  "Épilepsie": "Épilepsie",
  "Transplantation rénale": "Transplantation rénale",

  // Renommages CSV → affichage
  "Artériopathie oblitérante du membre inférieur": "Artériopathie périphérique",
  "Autres affections de longue durée (dont 31 et 32)": "Affections de longue durée (dont 31 et 32) pour d'autres causes",
  "Cancer du poumon actif": "Cancer bronchopulmonaire actif",
  "Cancer du poumon sous surveillance": "Cancer bronchopulmonaire sous surveillance",
  "Embolie pulmonaire aiguë": "Embolie pulmonaire",
  "Hémophilie ou troubles de l'hémostase graves": "Hémophilie ou troubles de l'hémostase graves",
  "Paraplégie": "Lésion médullaire",
  "Polyarthrite rhumatoïde et maladies apparentées": "Polyarthrite rhumatoïde ou maladies apparentées",
  "Sclérose en plaques": "Sclérose en plaques",
  "Spondylarthrite ankylosante et maladies apparentées": "Spondylarthrite ankylosante ou maladies apparentées",
  "Séjours hospitaliers pour Covid-19": "Hospitalisation pour Covid-19",
  "Séquelle d'accident vasculaire cérébral": "Séquelle d'accident vasculaire cérébral",
  "Troubles psychiatriques ayant débuté dans l'enfance": "Troubles psychiatriques débutant dans l'enfance",
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
