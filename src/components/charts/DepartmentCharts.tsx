import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { DepartmentData, getAverage } from "@/lib/data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Heart, Users, Euro, Activity, HelpCircle, Settings2, ChevronDown, ChevronUp, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ChartInfoButton = ({ title, text, howToRead }: { title?: string; text: string; howToRead?: string }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button className="ml-auto shrink-0 p-1 rounded-full hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30">
        <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
      </button>
    </PopoverTrigger>
    <PopoverContent side="top" align="end" className="max-w-[320px] w-[90vw] sm:w-[320px] p-4 space-y-3">
      {title && <p className="text-sm font-semibold text-foreground">{title}</p>}
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
      {howToRead && (
        <div className="pt-2 border-t border-border">
          <p className="text-[11px] font-medium text-primary mb-1">📖 Comment lire ce graphique ?</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{howToRead}</p>
        </div>
      )}
    </PopoverContent>
  </Popover>
);

interface DepartmentChartsProps {
  department: DepartmentData | undefined;
  allData: DepartmentData[];
  selectedMetric: string;
}

const COLORS = {
  primary: "#C41E3A",
  secondary: "#FF8C42",
  tertiary: "#E6A030",
  quaternary: "#8B4513",
  accent: "#D2691E",
  light: "#FFE8B0",
  muted: "#B8860B",
  dark: "#A0522D",
};

const formatAxisK = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return value.toLocaleString('fr-FR');
};

const AmeliSource = () => (
  <TooltipProvider>
    <UITooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help inline-block ml-1" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px] text-xs">
        <p>Données de prévalence issues du <strong>dataset Ameli (CNAM) – 2023</strong>. Effectifs normalisés en % de la population concernée.</p>
      </TooltipContent>
    </UITooltip>
  </TooltipProvider>
);

const getRegionMaladieAverage = (allData: DepartmentData[], region: string, maladieName: string): number => {
  const regionData = allData.filter(d => d.region === region);
  if (regionData.length === 0) return 0;
  const values = regionData.map(d => d.maladies_65_plus?.[maladieName] || 0).filter(v => v > 0);
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
};

const getFranceMaladieAverage = (allData: DepartmentData[], maladieName: string): number => {
  const values = allData.map(d => d.maladies_65_plus?.[maladieName] || 0).filter(v => v > 0);
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
};

// ============ GRAPHIQUES MÉDICAUX ============

const Top5MaladiesChart = ({ department }: { department: DepartmentData }) => {
  const maladies = department.maladies_65_plus;
  if (!maladies || Object.keys(maladies).length === 0) {
    return (
      <div className="p-4 rounded-xl bg-card border border-border shadow-card h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Pas de données maladies</p>
      </div>
    );
  }
  const maladieEntries = Object.entries(maladies)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const data = maladieEntries.map(([name, value], index) => ({ 
    name: `${index + 1}. ${name}`, 
    value 
  }));

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Prévalence des 5 maladies les plus fréquentes <AmeliSource /><ChartInfoButton title="Top 5 maladies" text="Barres horizontales montrant les 5 maladies les plus fréquentes chez les 65+ dans ce département. La valeur est en % de la population senior." howToRead="Plus la barre est longue, plus la maladie touche de personnes. Cherchez les maladies qui dépassent nettement les autres : elles représentent les enjeux de santé prioritaires du territoire." /></h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 8 }} width={220} />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="value" fill={COLORS.secondary} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const Top10MaladiesCompareChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const maladies = department.maladies_65_plus;
  if (!maladies || Object.keys(maladies).length === 0) return null;
  const top10 = Object.entries(maladies).filter(([_, value]) => value > 0).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const data = top10.map(([name, value]) => ({
    name: name.substring(0, 22),
    fullName: name,
    departement: value,
    region: getRegionMaladieAverage(allData, department.region, name),
    france: getFranceMaladieAverage(allData, name),
  }));

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Top 10 pathologies ≥ 65 ans – Comparaison <AmeliSource /><ChartInfoButton title="Comparaison des pathologies" text="Les 10 maladies les plus fréquentes comparées entre le département (rouge), la région (orange) et la France (jaune)." howToRead="Si la barre rouge dépasse l'orange et la jaune, la pathologie est plus répandue localement. Cela peut signaler un besoin de prévention ou de soins renforcés sur le territoire." /></h4>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 10 }} unit="%" />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 8 }} width={130} />
          <Tooltip formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]} labelFormatter={(label) => data.find(d => d.name === label)?.fullName || label} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="region" fill={COLORS.secondary} name="Région" />
          <Bar dataKey="france" fill={COLORS.tertiary} name="France" />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const RadarSanteChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const vars = [
    { key: "vue_difficulte", label: "Vue" },
    { key: "mal_chro_oui", label: "Maladies chroniques" },
    { key: "lfphysiques_oui", label: "Limitations physiques" },
    { key: "auditif_difficulte", label: "Auditif" },
    { key: "handicap_oui", label: "Handicap déclaré" },
    { key: "etat_sante_mauvais", label: "Mauvais état santé" },
  ];
  const data = vars.map(v => ({ subject: v.label, departement: department[v.key as keyof DepartmentData] as number || 0, france: getAverage(allData, v.key as keyof DepartmentData) }));

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Zoom sur l'état de santé <AmeliSource /><ChartInfoButton title="Radar santé" text="Chaque axe représente un indicateur de santé (vue, audition, maladies chroniques…). Le tracé coloré = département, le tracé clair = moyenne France." howToRead="Plus le tracé est étendu vers l'extérieur, plus la situation est préoccupante. Si un axe dépasse nettement la moyenne nationale (tracé clair), c'est un point de vigilance à prioriser." /></h4>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8 }} />
          <PolarRadiusAxis tick={{ fontSize: 8 }} />
          <Radar name="France" dataKey="france" stroke={COLORS.muted} fill={COLORS.muted} fillOpacity={0.25} strokeWidth={2} />
          <Radar name={department.departement} dataKey="departement" stroke={COLORS.primary} fill={COLORS.secondary} fillOpacity={0.5} strokeWidth={2} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const VaccinationChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const regionData = allData.filter(d => d.region === department.region);
  const data = [
    { name: "Covid 65+", departement: department.covid_65_plus, region: getAverage(regionData, 'covid_65_plus'), france: getAverage(allData, 'covid_65_plus') },
    { name: "Grippe 65+", departement: department.grippe_65_plus, region: getAverage(regionData, 'grippe_65_plus'), france: getAverage(allData, 'grippe_65_plus') },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Vaccination / prévention<ChartInfoButton title="Couverture vaccinale" text="Taux de vaccination Covid et Grippe chez les 65+. Compare le département à la région et la moyenne nationale." howToRead="Un taux élevé (proche de 100 %) indique une bonne couverture. Si le département est nettement en dessous de la moyenne, des campagnes de vaccination ciblées pourraient être nécessaires." /></h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="region" fill={COLORS.secondary} name="Région" />
          <Bar dataKey="france" fill={COLORS.tertiary} name="France" />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const ServicesMedicoSociauxChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const regionData = allData.filter(d => d.region === department.region);
  const popDept = department.population;
  const popRegion = regionData.reduce((sum, d) => sum + d.population, 0);
  const popNat = allData.reduce((sum, d) => sum + d.population, 0);
  const calcIndex = (col: keyof DepartmentData, pop: number, natPop: number, natData: DepartmentData[]) => {
    const natRate = natData.reduce((sum, d) => sum + (d[col] as number || 0), 0) / natPop;
    const rate = (department[col] as number || 0) / pop;
    return natRate > 0 ? rate / natRate : 0;
  };
  const services = [
    { name: "Aides à domicile", col: "apl_sapa" as keyof DepartmentData },
    { name: "EHPAD", col: "apl_ehpa" as keyof DepartmentData },
    { name: "Médecins", col: "access_med_generalistes" as keyof DepartmentData },
  ];
  const data = services.map(s => ({ name: s.name, departement: calcIndex(s.col, popDept, popNat, allData), region: calcIndex(s.col, popRegion, popNat, allData) }));

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Offre médico-sociale<ChartInfoButton title="Indice d'offre" text="Indice comparatif par rapport à la moyenne nationale (valeur 1). Couvre les aides à domicile, EHPAD et médecins." howToRead="La ligne imaginaire à 1.0 = la moyenne nationale. Au-dessus : le département est mieux doté. En dessous : l'offre est insuffisante. Un indice de 0.5 signifie deux fois moins de ressources que la moyenne." /></h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} domain={[0, 2]} />
          <Tooltip formatter={(value: number) => value.toFixed(2)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="region" fill={COLORS.secondary} name="Région" />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Capacité EHPAD - maintenant dans Médical
const EhpadCapaciteChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const regionData = allData.filter(d => d.region === department.region);
  const data = [
    { name: "Lits EHPAD", departement: department.ehpad_nb_lits, region: Math.round(getAverage(regionData, 'ehpad_nb_lits')), france: Math.round(getAverage(allData, 'ehpad_nb_lits')) },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Capacité EHPAD<ChartInfoButton title="Lits EHPAD" text="Nombre total de lits en EHPAD dans le département, comparé à la région et à la moyenne nationale." howToRead="Si la barre du département est bien en dessous de la moyenne, cela peut indiquer un manque de places d'hébergement. À croiser avec la population 75+ pour évaluer le taux de couverture réel." /></h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={formatAxisK} />
          <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="region" fill={COLORS.secondary} name="Région" />
          <Bar dataKey="france" fill={COLORS.tertiary} name="France" />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Prévisions LIVIA - maintenant dans Médical
const LiviaProjectionsChart = ({ department }: { department: DepartmentData }) => {
  const annees = [2025, 2030, 2035, 2040, 2045, 2050];
  const data = annees.map(annee => ({
    annee,
    femmes: department[`vol_glob_s1_f_${annee}` as keyof DepartmentData] as number || 0,
    hommes: department[`vol_glob_s1_h_${annee}` as keyof DepartmentData] as number || 0,
  }));
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Prévisions LIVIA (perte d'autonomie)<ChartInfoButton title="Projections LIVIA" text="Nombre projeté de personnes en perte d'autonomie de 2025 à 2050 (scénario 1), ventilé par genre." howToRead="Si les courbes montent fortement, le département devra anticiper un besoin croissant en infrastructure et personnel. L'écart entre femmes et hommes reflète les différences d'espérance de vie." /></h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="annee" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={formatAxisK} />
          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Line type="monotone" dataKey="femmes" stroke={COLORS.primary} strokeWidth={2} name="Femmes" dot />
          <Line type="monotone" dataKey="hommes" stroke={COLORS.secondary} strokeWidth={2} strokeDasharray="5 5" name="Hommes" dot />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Offre VS Besoin (nouveau graphique)
const OffreVsBesoinChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  // Besoin = population 75+ * taux EHPAD théorique
  // Offre = lits EHPAD
  const besoin75 = department.femmes_75_plus + department.hommes_75_plus;
  const offreLits = department.ehpad_nb_lits;
  const tauxCouverture = besoin75 > 0 ? (offreLits / besoin75) * 100 : 0;
  
  const avgTaux = allData.reduce((sum, d) => {
    const b = d.femmes_75_plus + d.hommes_75_plus;
    return sum + (b > 0 ? (d.ehpad_nb_lits / b) * 100 : 0);
  }, 0) / allData.length;

  const data = [
    { name: "Département", value: tauxCouverture },
    { name: "Moy. France", value: avgTaux },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Offre vs Besoin (lits / 75+)<ChartInfoButton title="Ratio offre/besoin" text="Pourcentage de lits EHPAD par rapport à la population 75+. Compare le département à la moyenne France." howToRead="Un ratio de 10 % signifie qu'il y a 10 lits pour 100 personnes de 75+. Si le département est en dessous de la moyenne, la capacité d'accueil est sous-dimensionnée par rapport aux besoins." /></h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} unit="%" />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            <Cell fill={COLORS.primary} />
            <Cell fill={COLORS.muted} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ============ GRAPHIQUES SOCIAUX ============

const RadarSocialChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  // Toutes les données en % avec comparaison nationale
  const total_60_74 = department.femmes_60_74_ans + department.hommes_60_74_ans;
  
  const calcPercent = (value: number, total: number) => total > 0 ? (value / total) * 100 : 0;
  
  const avgTotal = allData.reduce((s, d) => s + d.femmes_60_74_ans + d.hommes_60_74_ans, 0) / allData.length;
  
  const data = [
    { 
      subject: "Peu diplômés", 
      departement: calcPercent(department.menage_peu_diplome_60_74, total_60_74),
      france: calcPercent(getAverage(allData, 'menage_peu_diplome_60_74'), avgTotal)
    },
    { 
      subject: "Immigrés", 
      departement: calcPercent(department.menage_immigre_60_74, total_60_74),
      france: calcPercent(getAverage(allData, 'menage_immigre_60_74'), avgTotal)
    },
    { 
      subject: "Propriétaires", 
      departement: calcPercent(department.proprietaires_60_74, total_60_74),
      france: calcPercent(getAverage(allData, 'proprietaires_60_74'), avgTotal)
    },
    { 
      subject: "Femmes isolées", 
      departement: calcPercent(department.femmes_60_74_isolees, total_60_74),
      france: calcPercent(getAverage(allData, 'femmes_60_74_isolees'), avgTotal)
    },
    { 
      subject: "Sans voiture", 
      departement: calcPercent(department.sans_voiture_60_74, total_60_74),
      france: calcPercent(getAverage(allData, 'sans_voiture_60_74'), avgTotal)
    },
  ];
  
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Profil social 60–74 ans (%)<ChartInfoButton title="Radar social" text="Chaque axe représente un indicateur social en % des 60-74 ans : diplôme, immigration, propriété, isolement féminin, accès voiture." howToRead="Le tracé coloré = département, le tracé clair = moyenne France. Si un axe dépasse la moyenne, c'est une spécificité locale. Ex : un axe 'Sans voiture' élevé signale un risque d'enclavement." /></h4>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
          <PolarRadiusAxis tick={{ fontSize: 8 }} />
          <Radar name="France" dataKey="france" stroke={COLORS.muted} fill={COLORS.muted} fillOpacity={0.25} strokeWidth={2} />
          <Radar name={department.departement} dataKey="departement" stroke={COLORS.primary} fill={COLORS.secondary} fillOpacity={0.5} strokeWidth={2} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const SansVoitureChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const total_60_74 = department.femmes_60_74_ans + department.hommes_60_74_ans;
  const total_75_plus = department.femmes_75_plus + department.hommes_75_plus;
  
  const avgTotal6074 = allData.reduce((s, d) => s + d.femmes_60_74_ans + d.hommes_60_74_ans, 0) / allData.length;
  const avgTotal75 = allData.reduce((s, d) => s + d.femmes_75_plus + d.hommes_75_plus, 0) / allData.length;
  
  const data = [
    { 
      name: "60–74 ans", 
      departement: total_60_74 > 0 ? (department.sans_voiture_60_74 / total_60_74) * 100 : 0,
      france: avgTotal6074 > 0 ? (getAverage(allData, 'sans_voiture_60_74') / avgTotal6074) * 100 : 0
    },
    { 
      name: "75+ ans", 
      departement: total_75_plus > 0 ? (department.sans_voiture_75_plus / total_75_plus) * 100 : 0,
      france: avgTotal75 > 0 ? (getAverage(allData, 'sans_voiture_75_plus') / avgTotal75) * 100 : 0
    },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Sans voiture par âge<ChartInfoButton text="Part des seniors sans voiture par tranche d'âge. Comparez avec la moyenne nationale pour évaluer la dépendance aux transports alternatifs." /></h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="france" fill={COLORS.muted} name="Moy. France" />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const FragiliteNumeriqueChart = ({ department }: { department: DepartmentData }) => {
  const score = department.score_fragilite_numerique || 0;
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    setAnimatedScore(0);
    const duration = 1200;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(eased * score);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  const getColor = (s: number) => s <= 3.3 ? '#22c55e' : s <= 6.6 ? '#f59e0b' : '#ef4444';
  const getLabel = (s: number) => s <= 3.3 ? 'Faible' : s <= 6.6 ? 'Modéré' : 'Élevé';
  
  const cx = 120, cy = 110, r = 80;
  const startAngle = 225, endAngle = -45;
  const totalAngle = startAngle - endAngle;
  const currentAngle = startAngle - (animatedScore / 10) * totalAngle;
  
  const polarToCartesian = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos((angle * Math.PI) / 180),
    y: cy - radius * Math.sin((angle * Math.PI) / 180),
  });

  const describeArc = (startA: number, endA: number, radius: number) => {
    const start = polarToCartesian(startA, radius);
    const end = polarToCartesian(endA, radius);
    const largeArc = startA - endA > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  const ticks = Array.from({ length: 11 }, (_, i) => {
    const angle = startAngle - (i / 10) * totalAngle;
    const inner = polarToCartesian(angle, r - 8);
    const outer = polarToCartesian(angle, r + 2);
    const labelPos = polarToCartesian(angle, r + 14);
    return { inner, outer, labelPos, value: i, isMajor: i % 5 === 0 };
  });

  const needleEnd = polarToCartesian(currentAngle, r - 16);
  const needleColor = getColor(animatedScore);

  const segments = [
    { start: startAngle, end: startAngle - totalAngle * 0.33, color: '#22c55e' },
    { start: startAngle - totalAngle * 0.33, end: startAngle - totalAngle * 0.66, color: '#f59e0b' },
    { start: startAngle - totalAngle * 0.66, end: endAngle, color: '#ef4444' },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">Fragilité numérique<ChartInfoButton text="Score de 0 à 10 : plus le score est élevé, plus la population est vulnérable face au numérique (faible accès, peu d'usages)." /></h4>
      <div className="flex justify-center">
        <svg viewBox="0 0 240 160" className="w-full max-w-[280px] md:max-w-[300px]">
          {/* Background track */}
          <path d={describeArc(startAngle, endAngle, r)} fill="none" stroke="hsl(var(--muted))" strokeWidth={14} strokeLinecap="round" />
          
          {/* Colored segments */}
          {segments.map((seg, i) => (
            <path key={i} d={describeArc(seg.start, seg.end, r)} fill="none" stroke={seg.color} strokeWidth={14} strokeLinecap="round" opacity={0.2} />
          ))}
          
          {/* Active arc (animated) */}
          {animatedScore > 0.01 && (
            <path d={describeArc(startAngle, currentAngle, r)} fill="none" stroke={needleColor} strokeWidth={14} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${needleColor}50)` }} />
          )}

          {/* Tick marks */}
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={t.inner.x} y1={t.inner.y} x2={t.outer.x} y2={t.outer.y}
                stroke={t.isMajor ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'} 
                strokeWidth={t.isMajor ? 2 : 1} opacity={t.isMajor ? 0.6 : 0.3} />
              {t.isMajor && (
                <text x={t.labelPos.x} y={t.labelPos.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize={10} fill="hsl(var(--muted-foreground))" fontWeight={500}>{t.value}</text>
              )}
            </g>
          ))}

          {/* Needle (animated) */}
          <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y}
            stroke={needleColor} strokeWidth={3} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 1px 3px ${needleColor}80)` }} />
          <circle cx={cx} cy={cy} r={6} fill={needleColor} />
          <circle cx={cx} cy={cy} r={3} fill="hsl(var(--card))" />

          {/* Score text */}
          <text x={cx} y={cy + 28} textAnchor="middle" fontSize={22} fontWeight={700} fill={needleColor}>
            {animatedScore.toFixed(1)}
          </text>
          <text x={cx} y={cy + 42} textAnchor="middle" fontSize={11} fill="hsl(var(--muted-foreground))">
            /10 — {getLabel(score)}
          </text>
        </svg>
      </div>
    </div>
  );
};

const IsolementSocialChart = ({ department }: { department: DepartmentData }) => {
  const total = department.total_seniors;
  const isoles = department.isoles_60_74 + department.isoles_75_plus;
  const femmesIsolees = department.femmes_60_74_isolees + department.femmes_75_plus_isolees;
  const outerData = [{ name: "Non isolés", value: Math.max(0, total - isoles) }, { name: "Isolés", value: isoles }];
  const innerData = [{ name: "Hommes isolés", value: Math.max(0, isoles - femmesIsolees) }, { name: "Femmes isolées", value: femmesIsolees }];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Isolement social +60 ans<ChartInfoButton text="Anneau extérieur : part des seniors isolés vs non-isolés. Anneau intérieur : répartition hommes/femmes parmi les isolés." /></h4>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={outerData} cx="50%" cy="50%" outerRadius={65} innerRadius={40} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: '10px', fill: '#222' }}>
            <Cell fill={COLORS.muted} />
            <Cell fill={COLORS.primary} />
          </Pie>
          <Pie data={innerData} cx="50%" cy="50%" outerRadius={35} innerRadius={18} dataKey="value">
            <Cell fill={COLORS.quaternary} />
            <Cell fill={COLORS.secondary} />
          </Pie>
          <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const IsolementParAgeChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const data = [
    { name: "60-74 ans", departement: department.isoles_60_74, france: getAverage(allData, 'isoles_60_74') },
    { name: "75+ ans", departement: department.isoles_75_plus, france: getAverage(allData, 'isoles_75_plus') },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Seniors vivant seuls par tranche d'âge<ChartInfoButton text="Nombre de seniors vivant seuls, ventilé par tranche d'âge. Comparez avec la moyenne française pour situer le département." /></h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={formatAxisK} />
          <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="france" fill={COLORS.muted} name="Moy. France" />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const DemographieSeniorsChart = ({ department }: { department: DepartmentData }) => {
  const data = [
    { name: "F 60-74", value: department.femmes_60_74_ans },
    { name: "F 75+", value: department.femmes_75_plus },
    { name: "H 60-74", value: department.hommes_60_74_ans },
    { name: "H 75+", value: department.hommes_75_plus },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Répartition démographique seniors<ChartInfoButton text="Effectifs de la population senior répartis par genre et tranche d'âge (60-74 ans et 75+). Permet de visualiser la pyramide des âges locale." /></h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={formatAxisK} />
          <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            <Cell fill={COLORS.secondary} />
            <Cell fill={COLORS.primary} />
            <Cell fill={COLORS.tertiary} />
            <Cell fill={COLORS.quaternary} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ============ GRAPHIQUES ÉCONOMIQUES ============

const RevenusChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const data = [
    { name: "60-74 ans", departement: Math.round(department.revenu_median_60_74 / 100 / 12), moyenne: Math.round(getAverage(allData, 'revenu_median_60_74') / 100 / 12) },
    { name: "75+ ans", departement: Math.round(department.revenu_median_75_plus / 100 / 12), moyenne: Math.round(getAverage(allData, 'revenu_median_75_plus') / 100 / 12) },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Revenu médian (€/mois)<ChartInfoButton text="Revenu médian mensuel par tranche d'âge. La moitié de la population gagne plus, l'autre moitié moins. Comparez avec la moyenne nationale." /></h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} €/mois`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="moyenne" fill={COLORS.secondary} name="Moyenne nationale" />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Propriétaires vs Locataires - maintenant dans Économique
const LogementChart = ({ department }: { department: DepartmentData }) => {
  const proprietaires = department.proprietaires_60_74 + department.proprietaires_75_plus;
  const total = department.total_seniors;
  const data = [{ name: "Propriétaires", value: proprietaires }, { name: "Locataires", value: Math.max(0, total - proprietaires) }];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Propriétaires vs Locataires<ChartInfoButton text="Répartition des seniors entre propriétaires et locataires. Un taux élevé de propriétaires peut indiquer un meilleur ancrage territorial." /></h4>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: '10px', fill: '#222' }}>
            <Cell fill={COLORS.quaternary} />
            <Cell fill={COLORS.tertiary} />
          </Pie>
          <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const AspaEvolutionChart = ({ department }: { department: DepartmentData }) => {
  const annees = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
  const data = annees.map(annee => ({ annee, value: department[`aspa_effectif_${annee}` as keyof DepartmentData] as number || 0 }));
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Évolution bénéficiaires ASPA<ChartInfoButton text="Nombre de bénéficiaires de l'Allocation de Solidarité aux Personnes Âgées au fil des années. Une hausse peut indiquer une précarisation croissante." /></h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="annee" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Line type="monotone" dataKey="value" stroke={COLORS.quaternary} strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Graphiques APL (nouveaux)
const AplSapaChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const regionData = allData.filter(d => d.region === department.region);
  const data = [
    { name: "APL SAPA", departement: department.apl_sapa, region: getAverage(regionData, 'apl_sapa'), france: getAverage(allData, 'apl_sapa') },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">APL Services d'aide (SAPA)<ChartInfoButton text="Accessibilité potentielle localisée aux services d'aide à domicile. Compare le département à la région et la moyenne nationale." /></h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={formatAxisK} />
          <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="region" fill={COLORS.secondary} name="Région" />
          <Bar dataKey="france" fill={COLORS.tertiary} name="France" />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const AplEhpaChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const regionData = allData.filter(d => d.region === department.region);
  const data = [
    { name: "APL EHPA", departement: department.apl_ehpa, region: getAverage(regionData, 'apl_ehpa'), france: getAverage(allData, 'apl_ehpa') },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">APL Établissements (EHPA)<ChartInfoButton text="Accessibilité potentielle localisée aux établissements d'hébergement. Compare le département à la région et la moyenne nationale." /></h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={formatAxisK} />
          <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="region" fill={COLORS.secondary} name="Région" />
          <Bar dataKey="france" fill={COLORS.tertiary} name="France" />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Pathologies par genre (Femmes vs Hommes)
const PathologiesGenreChart = ({ department }: { department: DepartmentData }) => {
  const femmes = department.maladies_femmes || {};
  const hommes = department.maladies_hommes || {};
  
  // Get top pathologies from 65+ then show F vs H
  const maladies65 = department.maladies_65_plus || {};
  const top8 = Object.entries(maladies65)
    .filter(([_, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  
  const data = top8.map(([name]) => ({
    name: name.length > 20 ? name.substring(0, 20) + '…' : name,
    fullName: name,
    femmes: femmes[name] || 0,
    hommes: hommes[name] || 0,
  }));

  if (data.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Pathologies par genre (top 8) <AmeliSource /><ChartInfoButton text="Compare la prévalence des 8 maladies les plus courantes entre femmes et hommes. Permet d'identifier les disparités de santé par genre." /></h4>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 10 }} unit="%" />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 8 }} width={130} />
          <Tooltip 
            formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name]} 
            labelFormatter={(label) => data.find(d => d.name === label)?.fullName || label}
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} 
          />
          <Bar dataKey="femmes" fill={COLORS.primary} name="Femmes" />
          <Bar dataKey="hommes" fill={COLORS.secondary} name="Hommes" />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Main component
// Chart registry
type ChartDef = {
  id: string;
  label: string;
  category: "medical" | "social" | "economic";
  render: (dept: DepartmentData, allData: DepartmentData[]) => React.ReactNode;
};

const CHART_REGISTRY: ChartDef[] = [
  { id: "top5", label: "Top 5 maladies", category: "medical", render: (d) => <Top5MaladiesChart department={d} /> },
  { id: "patho_genre", label: "Pathologies par genre", category: "medical", render: (d) => <PathologiesGenreChart department={d} /> },
  { id: "radar_sante", label: "Zoom état de santé", category: "medical", render: (d, a) => <RadarSanteChart department={d} allData={a} /> },
  { id: "vaccination", label: "Vaccination", category: "medical", render: (d, a) => <VaccinationChart department={d} allData={a} /> },
  { id: "services_medico", label: "Offre médico-sociale", category: "medical", render: (d, a) => <ServicesMedicoSociauxChart department={d} allData={a} /> },
  { id: "ehpad_capacite", label: "Capacité EHPAD", category: "medical", render: (d, a) => <EhpadCapaciteChart department={d} allData={a} /> },
  { id: "apl_sapa", label: "APL SAPA", category: "medical", render: (d, a) => <AplSapaChart department={d} allData={a} /> },
  { id: "apl_ehpa", label: "APL EHPA", category: "medical", render: (d, a) => <AplEhpaChart department={d} allData={a} /> },
  { id: "offre_besoin", label: "Offre vs Besoin", category: "medical", render: (d, a) => <OffreVsBesoinChart department={d} allData={a} /> },
  { id: "livia", label: "Prévisions LIVIA", category: "medical", render: (d) => <LiviaProjectionsChart department={d} /> },
  { id: "top10_compare", label: "Top 10 comparaison", category: "medical", render: (d, a) => <Top10MaladiesCompareChart department={d} allData={a} /> },
  { id: "radar_social", label: "Profil social 60-74", category: "social", render: (d, a) => <RadarSocialChart department={d} allData={a} /> },
  { id: "isolement_social", label: "Isolement social", category: "social", render: (d) => <IsolementSocialChart department={d} /> },
  { id: "fragilite_num", label: "Fragilité numérique", category: "social", render: (d) => <FragiliteNumeriqueChart department={d} /> },
  { id: "sans_voiture", label: "Sans voiture", category: "social", render: (d, a) => <SansVoitureChart department={d} allData={a} /> },
  { id: "isolement_age", label: "Seniors seuls par âge", category: "social", render: (d, a) => <IsolementParAgeChart department={d} allData={a} /> },
  { id: "demographie", label: "Démographie seniors", category: "social", render: (d) => <DemographieSeniorsChart department={d} /> },
  { id: "revenus", label: "Revenus médians", category: "economic", render: (d, a) => <RevenusChart department={d} allData={a} /> },
  { id: "logement", label: "Propriétaires vs Locataires", category: "economic", render: (d) => <LogementChart department={d} /> },
  { id: "aspa", label: "Évolution ASPA", category: "economic", render: (d) => <AspaEvolutionChart department={d} /> },
];

const DEFAULT_SELECTED: Record<string, string[]> = {
  all: ["top5", "radar_social", "revenus"],
  medical: ["top5", "patho_genre", "radar_sante"],
  social: ["radar_social", "isolement_social", "isolement_age"],
  economic: ["revenus", "logement", "aspa"],
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  medical: <Heart className="w-3.5 h-3.5 text-primary" />,
  social: <Users className="w-3.5 h-3.5 text-secondary" />,
  economic: <Euro className="w-3.5 h-3.5" style={{ color: COLORS.quaternary }} />,
};

// Main component
export const DepartmentCharts = ({ department, allData, selectedMetric }: DepartmentChartsProps) => {
  const [category, setCategory] = useState<"all" | "medical" | "social" | "economic">("all");
  const [selectedCharts, setSelectedCharts] = useState<Record<string, string[]>>(DEFAULT_SELECTED);
  const [showAll, setShowAll] = useState(false);
  
  if (!department) return null;

  const availableCharts = category === "all" 
    ? CHART_REGISTRY 
    : CHART_REGISTRY.filter(c => c.category === category);

  const currentSelection = selectedCharts[category] || DEFAULT_SELECTED[category];
  const visibleCharts = showAll 
    ? availableCharts 
    : availableCharts.filter(c => currentSelection.includes(c.id));

  const toggleChart = (chartId: string) => {
    setSelectedCharts(prev => {
      const current = prev[category] || DEFAULT_SELECTED[category];
      const updated = current.includes(chartId)
        ? current.filter(id => id !== chartId)
        : [...current, chartId];
      return { ...prev, [category]: updated.length > 0 ? updated : current };
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-card border border-border shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">Catégorie de graphiques</h4>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Settings2 className="w-3.5 h-3.5" />
                Choisir ({currentSelection.length})
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="end">
              <p className="text-xs font-semibold text-foreground mb-2">Graphiques à afficher</p>
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {availableCharts.map(chart => (
                  <button
                    key={chart.id}
                    onClick={() => toggleChart(chart.id)}
                    className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-accent transition-colors"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      currentSelection.includes(chart.id) 
                        ? 'bg-primary border-primary' 
                        : 'border-border'
                    }`}>
                      {currentSelection.includes(chart.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    {CATEGORY_ICONS[chart.category]}
                    <span className="truncate">{chart.label}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Tabs value={category} onValueChange={(v) => { setCategory(v as typeof category); setShowAll(false); }}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all" className="gap-1.5 text-xs"><Activity className="w-3.5 h-3.5" />Tous</TabsTrigger>
            <TabsTrigger value="medical" className="gap-1.5 text-xs"><Heart className="w-3.5 h-3.5" />Médical</TabsTrigger>
            <TabsTrigger value="social" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" />Social</TabsTrigger>
            <TabsTrigger value="economic" className="gap-1.5 text-xs"><Euro className="w-3.5 h-3.5" />Économique</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
        {visibleCharts.map(chart => (
          <div key={chart.id}>
            {chart.render(department, allData)}
          </div>
        ))}
      </div>

      {!showAll && availableCharts.length > visibleCharts.length && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground" onClick={() => setShowAll(true)}>
            <ChevronDown className="w-4 h-4" />
            Afficher tous ({availableCharts.length - visibleCharts.length} de plus)
          </Button>
        </div>
      )}
      {showAll && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground" onClick={() => setShowAll(false)}>
            <ChevronUp className="w-4 h-4" />
            Réduire
          </Button>
        </div>
      )}
    </div>
  );
};