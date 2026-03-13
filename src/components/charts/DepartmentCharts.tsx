import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { DepartmentData, getAverage } from "@/lib/data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, Euro, Activity, Settings2, ChevronDown, ChevronUp, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { ChartInfoButton } from "./ChartInfoButton";

interface DepartmentChartsProps {
  department: DepartmentData | undefined;
  allData: DepartmentData[];
  selectedMetric: string;
}

const COLORS = {
  primary: "#1E40AF",
  secondary: "#3B82F6",
  tertiary: "#60A5FA",
  quaternary: "#1E3A5F",
  accent: "#2563EB",
  light: "#DBEAFE",
  muted: "#6B7280",
  dark: "#1E3A8A",
};

const formatAxisK = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return value.toLocaleString('fr-FR');
};


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
  const total65 = department.total_65_plus || 0;
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
    value,
    effectif: total65 > 0 ? Math.round(value * total65 / 100) : 0,
  }));

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1"><h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Top 5 pathologies identifiées chez les 65+<ChartInfoButton title="Top 5 diagnostics" text="Barres horizontales montrant les 5 diagnostics les plus fréquents chez les 65+ dans ce département (catégories génériques exclues). La valeur est en % de la population senior." howToRead="Plus la barre est longue, plus la pathologie touche de personnes. Cherchez les diagnostics qui dépassent nettement les autres : ils représentent les enjeux de santé prioritaires du territoire." source="Dataset Ameli (CNAM) – Effectif départemental par pathologie, sexe et âge, 2023" /></h4><ChartInfoButton title="Top 5 diagnostics" text="Barres horizontales montrant les 5 diagnostics les plus fréquents chez les 65+ dans ce département (catégories génériques exclues). La valeur est en % de la population senior." howToRead="Plus la barre est longue, plus la pathologie touche de personnes. Cherchez les diagnostics qui dépassent nettement les autres : ils représentent les enjeux de santé prioritaires du territoire." source="Dataset Ameli (CNAM) – Effectif départemental par pathologie, sexe et âge, 2023" /></h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 8 }} width={220} />
          <Tooltip 
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs">
                  <p className="font-medium text-foreground mb-1">{d.name}</p>
                  <p className="text-muted-foreground">{d.value.toFixed(1)}% des 65+</p>
                  <p className="text-muted-foreground font-semibold">≈ {d.effectif.toLocaleString('fr-FR')} personnes</p>
                </div>
              );
            }}
          />
          <Bar dataKey="value" fill={COLORS.secondary} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const Top10MaladiesCompareChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const maladies = department.maladies_65_plus;
  const total65 = department.total_65_plus || 0;
  if (!maladies || Object.keys(maladies).length === 0) return null;

  // Totaux région et France pour estimer les effectifs
  const regionData = allData.filter(d => d.region === department.region);
  const totalRegion65 = regionData.reduce((s, d) => s + (d.total_65_plus || 0), 0);
  const totalFrance65 = allData.reduce((s, d) => s + (d.total_65_plus || 0), 0);

  const top10 = Object.entries(maladies).filter(([_, value]) => value > 0).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const data = top10.map(([name, value]) => {
    const regionPct = getRegionMaladieAverage(allData, department.region, name);
    const francePct = getFranceMaladieAverage(allData, name);
    return {
      name: name.substring(0, 22),
      fullName: name,
      departement: value,
      effectifDept: total65 > 0 ? Math.round(value * total65 / 100) : 0,
      region: regionPct,
      effectifRegion: totalRegion65 > 0 ? Math.round(regionPct * totalRegion65 / 100) : 0,
      france: francePct,
      effectifFrance: totalFrance65 > 0 ? Math.round(francePct * totalFrance65 / 100) : 0,
    };
  });

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1"><h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Top 10 pathologies ≥ 65 ans – Comparaison<ChartInfoButton title="Comparaison des diagnostics" text="Les 10 diagnostics les plus fréquents comparés entre le département (rouge), la région (orange) et la France (jaune). Catégories génériques (« Autres… ») exclues." howToRead="Si la barre rouge dépasse l'orange et la jaune, la pathologie est plus répandue localement. Cela peut signaler un besoin de prévention ou de soins renforcés sur le territoire." source="Dataset Ameli (CNAM) – Effectif départemental par pathologie, sexe et âge, 2023" /></h4><ChartInfoButton title="Comparaison des diagnostics" text="Les 10 diagnostics les plus fréquents comparés entre le département (rouge), la région (orange) et la France (jaune). Catégories génériques (« Autres… ») exclues." howToRead="Si la barre rouge dépasse l'orange et la jaune, la pathologie est plus répandue localement. Cela peut signaler un besoin de prévention ou de soins renforcés sur le territoire." source="Dataset Ameli (CNAM) – Effectif départemental par pathologie, sexe et âge, 2023" /></h4>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 10 }} unit="%" />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 8 }} width={130} />
          <Tooltip 
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs">
                  <p className="font-medium text-foreground mb-1">{d.fullName}</p>
                  <p className="text-muted-foreground">
                    <span style={{ color: COLORS.primary }}>●</span> Département : {d.departement.toFixed(1)}%
                    {d.effectifDept > 0 && <span className="font-semibold"> (≈ {d.effectifDept.toLocaleString('fr-FR')} pers.)</span>}
                  </p>
                  <p className="text-muted-foreground">
                    <span style={{ color: COLORS.secondary }}>●</span> Région : {d.region.toFixed(1)}%
                    {d.effectifRegion > 0 && <span className="font-semibold"> (≈ {d.effectifRegion.toLocaleString('fr-FR')} pers.)</span>}
                  </p>
                  <p className="text-muted-foreground">
                    <span style={{ color: COLORS.tertiary }}>●</span> France : {d.france.toFixed(1)}%
                    {d.effectifFrance > 0 && <span className="font-semibold"> (≈ {d.effectifFrance.toLocaleString('fr-FR')} pers.)</span>}
                  </p>
                </div>
              );
            }}
          />
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
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1"><h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Zoom sur l'état de santé des 65+<ChartInfoButton title="Radar santé" text="Chaque axe représente un indicateur de santé (vue, audition, maladies chroniques…). Le tracé coloré = département, le tracé clair = moyenne France." howToRead="Plus le tracé est étendu vers l'extérieur, plus la situation est préoccupante. Si un axe dépasse nettement la moyenne nationale (tracé clair), c'est un point de vigilance à prioriser." source="Enquête Vie Quotidienne et Santé (VQS) 2021 – DREES, données départementales" /></h4>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8 }} />
          <PolarRadiusAxis tick={{ fontSize: 8 }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
          <Radar name="France" dataKey="france" stroke={COLORS.muted} fill={COLORS.muted} fillOpacity={0.25} strokeWidth={2} />
          <Radar name={department.departement} dataKey="departement" stroke={COLORS.primary} fill={COLORS.secondary} fillOpacity={0.5} strokeWidth={2} />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
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
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1"><h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Taux de vaccination chez les 65+<ChartInfoButton title="Couverture vaccinale" text="Taux de vaccination Covid et Grippe chez les 65+. Compare le département à la région et la moyenne nationale." howToRead="Un taux élevé (proche de 100 %) indique une bonne couverture. Si le département est nettement en dessous de la moyenne, des campagnes de vaccination ciblées pourraient être nécessaires." source="Santé publique France / Ameli – Taux de couverture vaccinale, 2023" /></h4>
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
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1"><h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Offre médico-sociale pour 65+<ChartInfoButton title="Indice d'offre" text="Indice comparatif par rapport à la moyenne nationale (valeur 1). Couvre les aides à domicile, EHPAD et médecins." howToRead="La ligne imaginaire à 1.0 = la moyenne nationale. Au-dessus : le département est mieux doté. En dessous : l'offre est insuffisante. Un indice de 0.5 signifie deux fois moins de ressources que la moyenne." source="DREES – Panorama statistique 2024 (APL SAPA, EHPA, médecins généralistes)" /></h4>
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
  
  // Taux pour 1000 habitants 65+
  const pop65Dept = department.total_65_plus || 0;
  const tauxDept = pop65Dept > 0 ? (department.ehpad_nb_lits / pop65Dept) * 1000 : 0;
  
  const regionLits = getAverage(regionData, 'ehpad_nb_lits');
  const regionPop65 = regionData.reduce((s, d) => s + (d.total_65_plus || 0), 0) / regionData.length;
  const tauxRegion = regionPop65 > 0 ? (regionLits / regionPop65) * 1000 : 0;
  
  const franceLits = getAverage(allData, 'ehpad_nb_lits');
  const francePop65 = allData.reduce((s, d) => s + (d.total_65_plus || 0), 0) / allData.length;
  const tauxFrance = francePop65 > 0 ? (franceLits / francePop65) * 1000 : 0;

  const data = [
    { 
      name: "Lits / 1 000 hab. 65+", 
      departement: parseFloat(tauxDept.toFixed(1)), 
      region: parseFloat(tauxRegion.toFixed(1)), 
      france: parseFloat(tauxFrance.toFixed(1)),
      litsDept: department.ehpad_nb_lits,
      litsRegion: Math.round(regionLits),
      litsFrance: Math.round(franceLits),
      pop65Dept,
    },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Capacité EHPAD (taux)<ChartInfoButton title="Lits EHPAD pour 1 000 hab. 65+" text="Nombre de lits EHPAD rapporté à la population de 65 ans et plus (pour 1 000 habitants). Permet une comparaison équitable entre territoires." howToRead="Plus le taux est élevé, plus la couverture est bonne. Survolez une barre pour voir le nombre absolu de lits. Si le département est sous la moyenne, la capacité d'accueil est insuffisante." source="DREES – Panorama statistique 2024 + INSEE RP 2020" /></h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip 
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs">
                  <p className="font-medium text-foreground mb-1">Lits EHPAD pour 1 000 hab. 65+</p>
                  <p className="text-muted-foreground">
                    <span style={{ color: COLORS.primary }}>●</span> Département : {d.departement} ‰
                    <span className="font-semibold"> ({d.litsDept.toLocaleString('fr-FR')} lits pour {d.pop65Dept.toLocaleString('fr-FR')} hab. 65+)</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span style={{ color: COLORS.secondary }}>●</span> Région : {d.region} ‰
                    <span className="font-semibold"> (≈ {d.litsRegion.toLocaleString('fr-FR')} lits moy.)</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span style={{ color: COLORS.tertiary }}>●</span> France : {d.france} ‰
                    <span className="font-semibold"> (≈ {d.litsFrance.toLocaleString('fr-FR')} lits moy.)</span>
                  </p>
                </div>
              );
            }}
          />
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
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1"><h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Prévisions LIVIA (prédictions sur le nombre de seniors en perte d'autonomie)<ChartInfoButton title="Projections LIVIA" text="Nombre projeté de personnes en perte d'autonomie de 2025 à 2050 (scénario 1), ventilé par genre." howToRead="Si les courbes montent fortement, le département devra anticiper un besoin croissant en infrastructure et personnel. L'écart entre femmes et hommes reflète les différences d'espérance de vie." source="Modèle LIVIA (DREES) – Projections de perte d'autonomie, scénario 2 (lieux de vie)" /></h4>
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
  const regionData = allData.filter(d => d.region === department.region);
  const besoin75 = department.femmes_75_plus + department.hommes_75_plus;
  const offreLits = department.ehpad_nb_lits;
  const nbEtab = department.ehpad_nb_etab;
  const tauxCouverture = besoin75 > 0 ? (offreLits / besoin75) * 100 : 0;
  
  // Moyennes médecins et aides à domicile
  const aplSapa = department.apl_sapa;
  const aplEhpa = department.apl_ehpa;
  const medecins = department.access_med_generalistes;

  const calcTaux = (d: DepartmentData) => {
    const b = d.femmes_75_plus + d.hommes_75_plus;
    return b > 0 ? (d.ehpad_nb_lits / b) * 100 : 0;
  };
  const avgTaux = allData.reduce((sum, d) => sum + calcTaux(d), 0) / allData.length;
  const regionTaux = regionData.reduce((sum, d) => sum + calcTaux(d), 0) / (regionData.length || 1);

  const data = [
    { 
      name: "Taux couverture EHPAD", 
      departement: parseFloat(tauxCouverture.toFixed(1)), 
      region: parseFloat(regionTaux.toFixed(1)),
      france: parseFloat(avgTaux.toFixed(1)),
    },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1"><h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Déficit de l'offre en lits d'EHPAD pour les 65 ans et plus (en %)<ChartInfoButton title="Synthèse offre/besoin" text="Vue d'ensemble de l'adéquation entre l'offre médico-sociale et les besoins du département : taux de couverture EHPAD, distances d'accès aux services." howToRead="Comparez le taux de couverture du département à la région et la France. Le tableau ci-dessous détaille les indicateurs clés pour évaluer si le territoire est bien doté." source="DREES – Panorama statistique 2024 + INSEE RP 2020" /></h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} unit="%" />
          <Tooltip 
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs">
                  <p className="font-medium text-foreground mb-1">Taux de couverture EHPAD (lits / pop. 75+)</p>
                  <p className="text-muted-foreground"><span style={{ color: COLORS.primary }}>●</span> Département : {d.departement}%</p>
                  <p className="text-muted-foreground"><span style={{ color: COLORS.secondary }}>●</span> Région : {d.region}%</p>
                  <p className="text-muted-foreground"><span style={{ color: COLORS.tertiary }}>●</span> France : {d.france}%</p>
                </div>
              );
            }}
          />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="region" fill={COLORS.secondary} name="Région" />
          <Bar dataKey="france" fill={COLORS.tertiary} name="France" />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
      {/* Tableau de synthèse */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
          <p className="text-muted-foreground">Population 75+</p>
          <p className="font-bold text-foreground">{besoin75.toLocaleString('fr-FR')}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
          <p className="text-muted-foreground">Lits EHPAD</p>
          <p className="font-bold text-foreground">{offreLits.toLocaleString('fr-FR')} <span className="font-normal text-muted-foreground">({nbEtab} étab.)</span></p>
        </div>
        <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
          <p className="text-muted-foreground">Accès aide à domicile</p>
          <p className="font-bold text-foreground">{aplSapa.toFixed(1)} min</p>
        </div>
        <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
          <p className="text-muted-foreground">Accès EHPA</p>
          <p className="font-bold text-foreground">{aplEhpa.toFixed(1)} min</p>
        </div>
        <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 col-span-2">
          <p className="text-muted-foreground">Accès médecin généraliste</p>
          <p className="font-bold text-foreground">{medecins.toFixed(1)} min</p>
        </div>
      </div>
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
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1"><h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Profil social 65+<ChartInfoButton title="Radar social" text="Chaque axe représente un indicateur social en % des 60-74 ans : diplôme, immigration, propriété, isolement féminin, accès voiture." howToRead="Le tracé coloré = département, le tracé clair = moyenne France. Si un axe dépasse la moyenne, c'est une spécificité locale. Ex : un axe 'Sans voiture' élevé signale un risque d'enclavement." source="INSEE – Recensement de la population 2020, indicateurs départementaux 60+ et 75+" /></h4>
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
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Sans voiture par âge<ChartInfoButton title="Mobilité des seniors" text="Part des seniors sans voiture, ventilée par tranche d'âge (60-74 ans et 75+)." howToRead="Comparez les barres rouges (département) aux grises (moyenne France). Un taux élevé chez les 75+ sans offre de transport adaptée = risque d'isolement et de renoncement aux soins." source="INSEE – Recensement de la population 2020, indicateurs départementaux 75+" /></h4>
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
      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">Fragilité numérique<ChartInfoButton title="Score de fragilité numérique" text="Score de 0 à 10 mesurant la vulnérabilité numérique de la population senior du département." howToRead="L'aiguille pointe vers la zone verte (0-3 : faible), jaune (3-7 : modéré) ou rouge (7-10 : élevé). Un score élevé signifie que beaucoup de seniors ont un accès limité à Internet et aux démarches en ligne." source="Score composite – INSEE (diplôme, accès Internet) et indicateurs communaux 60+" /></h4>
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
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Isolement social +60 ans<ChartInfoButton title="Isolement social" text="Anneau extérieur : proportion de seniors isolés vs non-isolés. Anneau intérieur : répartition hommes/femmes parmi les personnes isolées." howToRead="Plus la part rouge (isolés) est grande dans l'anneau extérieur, plus le département est touché. L'anneau intérieur montre si les femmes sont plus concernées — ce qui est souvent le cas après le décès du conjoint." source="INSEE – Recensement de la population 2020, indicateurs départementaux 60+ et 75+" /></h4>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={outerData} cx="50%" cy="50%" outerRadius={65} innerRadius={40} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: '10px' }}>
            <Cell fill="#DBEAFE" />
            <Cell fill="#1E40AF" />
          </Pie>
          <Pie data={innerData} cx="50%" cy="50%" outerRadius={35} innerRadius={18} dataKey="value">
            <Cell fill="#1E3A5F" />
            <Cell fill="#3B82F6" />
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
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Seniors vivant seuls par tranche d'âge<ChartInfoButton title="Seniors seuls" text="Nombre de seniors vivant seuls, ventilé par tranche d'âge (60-74 et 75+)." howToRead="Comparez la barre rouge (département) à la grise (moyenne France). Un nombre élevé chez les 75+ est particulièrement préoccupant car ces personnes sont plus vulnérables et dépendantes." source="INSEE – Recensement de la population 2020, indicateurs départementaux 60+ et 75+" /></h4>
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
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Répartition démographique seniors<ChartInfoButton title="Pyramide des âges" text="Effectifs de la population senior répartis par genre (F/H) et tranche d'âge (60-74 et 75+)." howToRead="Les 4 barres permettent de voir l'équilibre du département : un fort décalage entre F et H chez les 75+ reflète l'écart d'espérance de vie. Une dominance des 75+ peut indiquer un vieillissement accéléré." source="INSEE – Recensement de la population 2020, populations départementales 60+ et 75+" /></h4>
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
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Revenu médian (€/mois)<ChartInfoButton title="Revenus médians" text="Revenu médian mensuel par tranche d'âge. La moitié de la population gagne plus, l'autre moitié gagne moins." howToRead="Comparez les barres rouges (département) aux oranges (moyenne nationale). Un revenu plus bas que la moyenne, surtout chez les 75+, signale un risque de précarité et potentiellement de renoncement aux soins." source="FILOSOFI (INSEE) – Revenus fiscaux localisés des ménages, 2020" /></h4>
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
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Propriétaires vs Locataires<ChartInfoButton title="Statut d'occupation" text="Répartition des seniors entre propriétaires et locataires dans le département." howToRead="Un taux élevé de propriétaires indique un meilleur ancrage territorial et moins de charges de logement. À l'inverse, beaucoup de locataires seniors avec des revenus faibles = risque de précarité locative." source="INSEE – Recensement de la population 2020, indicateurs départementaux 60+ et 75+" /></h4>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" label={({ name, percent, x, y }) => <text x={x} y={y} fill="#1e293b" fontSize={10} textAnchor="middle" dominantBaseline="central">{`${name} ${(percent * 100).toFixed(0)}%`}</text>} labelLine={false} stroke="none">
            <Cell fill="#60A5FA" />
            <Cell fill="#DBEAFE" />
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
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Évolution bénéficiaires ASPA<ChartInfoButton title="Évolution ASPA" text="Nombre de bénéficiaires de l'Allocation de Solidarité aux Personnes Âgées (minimum vieillesse) de 2013 à 2024." howToRead="Une courbe qui monte indique une précarisation croissante des retraités. Si la hausse est plus forte que la moyenne nationale, le département se paupérise plus vite que le reste du pays." source="Caisse des Dépôts / DREES – Effectifs ASPA par département, série annuelle 2013-2024" /></h4>
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
    { name: "APL SAPA", departement: department.apl_sapa, region: parseFloat(getAverage(regionData, 'apl_sapa').toFixed(1)), france: parseFloat(getAverage(allData, 'apl_sapa').toFixed(1)) },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">APL Services d'aide (SAPA)<ChartInfoButton title="APL SAPA" text="Accessibilité Potentielle Localisée aux Services d'Aide et de soins à domicile. Mesure la distance moyenne (en minutes) pour accéder à un service d'aide à domicile." howToRead="Plus la valeur est basse, plus l'accès est facile. Comparez le département à la région et la France : un temps nettement supérieur signale un déficit d'offre de proximité." source="DREES – Panorama statistique 2024, APL aux Services Autonomie à domicile" /></h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} unit=" min" />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)} min`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
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
    { name: "APL EHPA", departement: department.apl_ehpa, region: parseFloat(getAverage(regionData, 'apl_ehpa').toFixed(1)), france: parseFloat(getAverage(allData, 'apl_ehpa').toFixed(1)) },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">APL Établissements (EHPA)<ChartInfoButton title="APL EHPA" text="Accessibilité Potentielle Localisée aux Établissements d'Hébergement pour Personnes Âgées. Mesure la distance moyenne (en minutes) pour accéder à un EHPA." howToRead="Même lecture que l'APL SAPA : plus c'est bas, plus l'accès est facile. Un temps nettement supérieur à la moyenne signale un déficit de places en établissement sur le territoire." source="DREES – Panorama statistique 2024, APL aux EHPA" /></h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} unit=" min" />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)} min`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
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
  const totalF = department.total_femmes_65_plus || 0;
  const totalH = department.total_hommes_65_plus || 0;
  
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
    effectifF: totalF > 0 ? Math.round((femmes[name] || 0) * totalF / 100) : 0,
    effectifH: totalH > 0 ? Math.round((hommes[name] || 0) * totalH / 100) : 0,
  }));

  if (data.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">Diagnostics par genre (top 8)<ChartInfoButton title="Diagnostics par genre" text="Compare la prévalence des 8 diagnostics les plus courants entre femmes (rouge) et hommes (orange). Catégories génériques exclues." howToRead="Si une barre rouge est nettement plus longue que l'orange pour un même diagnostic, les femmes sont davantage touchées (et inversement). Cela peut orienter des actions de prévention ciblées par genre." source="Dataset Ameli (CNAM) – Effectif départemental par pathologie, sexe et âge, 2023" /></h4>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 10 }} unit="%" />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 8 }} width={130} />
          <Tooltip 
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs">
                  <p className="font-medium text-foreground mb-1">{d.fullName}</p>
                  <p className="text-muted-foreground"><span style={{ color: COLORS.primary }}>●</span> Femmes : {d.femmes.toFixed(2)}%{d.effectifF > 0 && <span className="font-semibold"> (≈ {d.effectifF.toLocaleString('fr-FR')})</span>}</p>
                  <p className="text-muted-foreground"><span style={{ color: COLORS.secondary }}>●</span> Hommes : {d.hommes.toFixed(2)}%{d.effectifH > 0 && <span className="font-semibold"> (≈ {d.effectifH.toLocaleString('fr-FR')})</span>}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="femmes" fill={COLORS.primary} name="Femmes" />
          <Bar dataKey="hommes" fill={COLORS.secondary} name="Hommes" />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ============ GRAPHIQUES POLLUTION (IREP) ============

const EmissionsAirChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const regionData = allData.filter(d => d.region === department.region);
  const data = [
    { 
      name: department.departement.length > 12 ? department.departement.substring(0, 12) + '…' : department.departement, 
      value: department.irep_emission_air_tonnes,
      sites: department.irep_nb_emetteurs,
    },
    { 
      name: "Moy. Région", 
      value: Math.round(regionData.reduce((s, d) => s + d.irep_emission_air_tonnes, 0) / regionData.length),
      sites: Math.round(regionData.reduce((s, d) => s + d.irep_nb_emetteurs, 0) / regionData.length),
    },
    { 
      name: "Moy. France", 
      value: Math.round(allData.reduce((s, d) => s + d.irep_emission_air_tonnes, 0) / allData.length),
      sites: Math.round(allData.reduce((s, d) => s + d.irep_nb_emetteurs, 0) / allData.length),
    },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
        Émissions polluantes air (IREP)
        <ChartInfoButton 
          title="Émissions industrielles dans l'air" 
          text="Total des émissions polluantes dans l'air déclarées par les établissements industriels du département (registre IREP 2019), en tonnes/an." 
          howToRead="Plus la barre est haute, plus le département concentre d'émissions industrielles dans l'air. Un niveau élevé peut impacter la santé respiratoire des seniors." 
          source="Registre français des émissions polluantes (IREP) – Georisques / Ministère de la Transition écologique, 2019" 
        />
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={formatAxisK} />
          <Tooltip 
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs">
                  <p className="font-medium text-foreground mb-1">{d.name}</p>
                  <p className="text-muted-foreground">{d.value.toLocaleString('fr-FR')} tonnes/an</p>
                  <p className="text-muted-foreground">{d.sites} sites émetteurs</p>
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            <Cell fill={COLORS.primary} />
            <Cell fill={COLORS.secondary} />
            <Cell fill={COLORS.muted} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground text-center mt-1">
        {department.irep_nb_sites} sites IREP · {department.irep_nb_emetteurs} émetteurs · {department.irep_nb_polluants_air} polluants dans l'air
      </p>
    </div>
  );
};

const SitesPolluantsChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const regionData = allData.filter(d => d.region === department.region);
  const sitesPerCapita = (d: DepartmentData) => d.population > 0 ? (d.irep_nb_sites / d.population) * 100000 : 0;
  
  const data = [
    { name: "Sites IREP", 
      departement: department.irep_nb_sites, 
      region: Math.round(regionData.reduce((s, d) => s + d.irep_nb_sites, 0) / regionData.length),
      france: Math.round(allData.reduce((s, d) => s + d.irep_nb_sites, 0) / allData.length),
    },
    { name: "Sites émetteurs", 
      departement: department.irep_nb_emetteurs, 
      region: Math.round(regionData.reduce((s, d) => s + d.irep_nb_emetteurs, 0) / regionData.length),
      france: Math.round(allData.reduce((s, d) => s + d.irep_nb_emetteurs, 0) / allData.length),
    },
  ];

  const deptRate = sitesPerCapita(department);
  const franceRate = allData.reduce((s, d) => s + sitesPerCapita(d), 0) / allData.length;

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
        Sites industriels polluants (IREP)
        <ChartInfoButton 
          title="Densité de sites polluants" 
          text="Nombre de sites industriels déclarant des émissions polluantes, comparé à la région et à la moyenne France." 
          howToRead="Plus le nombre de sites est élevé, plus le département est exposé. Le taux pour 100k habitants permet de comparer indépendamment de la taille." 
          source="Registre français des émissions polluantes (IREP) – Georisques, 2019" 
        />
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="region" fill={COLORS.secondary} name="Région" />
          <Bar dataKey="france" fill={COLORS.muted} name="France" />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground text-center mt-1">
        Densité : {deptRate.toFixed(1)} sites / 100k hab. (moy. France : {franceRate.toFixed(1)})
      </p>
    </div>
  );
};

// ============ GRAPHIQUE QUALITÉ DE L'AIR (ATMO) ============

const QualiteAirAtmoChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const regionData = allData.filter(d => d.region === department.region);
  const avgRegion = regionData.reduce((s, d) => s + d.atmo_indice_moyen, 0) / regionData.length;
  const avgFrance = allData.reduce((s, d) => s + d.atmo_indice_moyen, 0) / allData.length;

  const dataJours = [
    { name: "Bon", departement: department.atmo_jours_bon, fill: "#4CAF50" },
    { name: "Moyen", departement: department.atmo_jours_moyen, fill: "#DBEAFE" },
    { name: "Dégradé", departement: department.atmo_jours_degrade, fill: COLORS.secondary },
    { name: "Mauvais", departement: department.atmo_jours_mauvais, fill: COLORS.primary },
    { name: "Très mauvais", departement: department.atmo_jours_tres_mauvais, fill: "#8B0000" },
  ];

  const getQualiteLabel = (indice: number) => {
    if (indice <= 2) return "Bonne";
    if (indice <= 3) return "Moyenne";
    if (indice <= 4) return "Dégradée";
    return "Mauvaise";
  };

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
        Qualité de l'air (Indice ATMO)
        <ChartInfoButton 
          title="Qualité de l'air – Indice ATMO" 
          text="Répartition des jours de l'année selon la qualité de l'air (indice ATMO : 1=Bon à 5=Très mauvais). L'indice moyen synthétise la qualité sur l'année." 
          howToRead="Plus il y a de jours 'Bon' (vert), meilleure est la qualité de l'air. Les jours mauvais/très mauvais (rouge) signalent un risque accru pour la santé respiratoire des seniors." 
          source="Associations agréées de surveillance de la qualité de l'air (AASQA) – Atmo France, 2023" 
        />
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={dataJours} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 10 }} label={{ value: "Jours/an", position: "insideBottom", offset: -2, fontSize: 10 }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
          <Tooltip formatter={(value: number) => `${value} jours`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" name="Jours">
            {dataJours.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground text-center mt-1">
        Indice moyen : <strong>{department.atmo_indice_moyen.toFixed(1)}</strong> ({getQualiteLabel(department.atmo_indice_moyen)}) · Région : {avgRegion.toFixed(1)} · France : {avgFrance.toFixed(1)}
      </p>
    </div>
  );
};

// ============ GRAPHIQUES QUALITÉ DE L'EAU ============

const EauPotableChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const regionData = allData.filter(d => d.region === department.region);
  const avg = (arr: DepartmentData[], field: keyof DepartmentData) => arr.reduce((s, d) => s + (d[field] as number), 0) / arr.length;

  const dataConformite = [
    { name: "Bactériologique", departement: department.eau_conformite_bacterio, region: parseFloat(avg(regionData, 'eau_conformite_bacterio').toFixed(1)), france: parseFloat(avg(allData, 'eau_conformite_bacterio').toFixed(1)) },
    { name: "Physico-chimique", departement: department.eau_conformite_physicochim, region: parseFloat(avg(regionData, 'eau_conformite_physicochim').toFixed(1)), france: parseFloat(avg(allData, 'eau_conformite_physicochim').toFixed(1)) },
    { name: "État chimique bon", departement: department.eau_etat_chimique_bon, region: parseFloat(avg(regionData, 'eau_etat_chimique_bon').toFixed(1)), france: parseFloat(avg(allData, 'eau_etat_chimique_bon').toFixed(1)) },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
        Eau potable – Conformité
        <ChartInfoButton 
          title="Conformité de l'eau potable" 
          text="Taux de conformité bactériologique et physico-chimique de l'eau du robinet, et part des masses d'eau en bon état chimique." 
          howToRead="Des taux proches de 100% indiquent une eau potable de bonne qualité. Un taux plus bas peut signaler des risques sanitaires pour les populations fragiles." 
          source="ARS / SISE-Eaux, 2023" 
        />
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={dataConformite} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" domain={[40, 100]} tick={{ fontSize: 10 }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
          <Tooltip formatter={(value: number) => `${value}%`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill="#4CAF50" name="Département" />
          <Bar dataKey="region" fill={COLORS.secondary} name="Région" />
          <Bar dataKey="france" fill={COLORS.muted} name="France" />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground text-center mt-1">
        Pesticides : <strong>{department.eau_pesticides_depassement}%</strong> de dépassement (Région : {avg(regionData, 'eau_pesticides_depassement').toFixed(1)}% · France : {avg(allData, 'eau_pesticides_depassement').toFixed(1)}%)
      </p>
    </div>
  );
};

const EauCoursEauChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const regionData = allData.filter(d => d.region === department.region);
  const avg = (arr: DepartmentData[], field: keyof DepartmentData) => arr.reduce((s, d) => s + (d[field] as number), 0) / arr.length;

  const dataEcoEtat = [
    { name: "Bon", value: department.eau_etat_eco_bon, fill: "#4CAF50" },
    { name: "Moyen", value: department.eau_etat_eco_moyen, fill: "#DBEAFE" },
    { name: "Médiocre", value: department.eau_etat_eco_mediocre, fill: COLORS.primary },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
        Cours d'eau – État écologique
        <ChartInfoButton 
          title="État écologique des cours d'eau" 
          text="Répartition des masses d'eau de surface selon leur état écologique (bon, moyen, médiocre). Un bon état écologique garantit un environnement sain." 
          howToRead="Plus la part 'Bon' (vert) est grande, meilleure est la qualité des cours d'eau du département. Une forte part médiocre (rouge) indique une dégradation de l'environnement aquatique." 
          source="Naïades / Agences de l'eau, 2023" 
        />
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={dataEcoEtat} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
            {dataEcoEtat.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value}%`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground text-center mt-1">
        Bon état régional : {avg(regionData, 'eau_etat_eco_bon').toFixed(0)}% · France : {avg(allData, 'eau_etat_eco_bon').toFixed(0)}%
      </p>
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
  { id: "top5", label: "Top 5 diagnostics", category: "medical", render: (d) => <Top5MaladiesChart department={d} /> },
  { id: "patho_genre", label: "Diagnostics par genre", category: "medical", render: (d) => <PathologiesGenreChart department={d} /> },
  { id: "radar_sante", label: "Zoom état de santé", category: "medical", render: (d, a) => <RadarSanteChart department={d} allData={a} /> },
  { id: "vaccination", label: "Vaccination", category: "medical", render: (d, a) => <VaccinationChart department={d} allData={a} /> },
  { id: "services_medico", label: "Offre médico-sociale", category: "medical", render: (d, a) => <ServicesMedicoSociauxChart department={d} allData={a} /> },
  { id: "ehpad_capacite", label: "Capacité EHPAD", category: "medical", render: (d, a) => <EhpadCapaciteChart department={d} allData={a} /> },
  { id: "apl_sapa", label: "APL SAPA", category: "medical", render: (d, a) => <AplSapaChart department={d} allData={a} /> },
  { id: "apl_ehpa", label: "APL EHPA", category: "medical", render: (d, a) => <AplEhpaChart department={d} allData={a} /> },
  { id: "offre_besoin", label: "Offre vs Besoin", category: "medical", render: (d, a) => <OffreVsBesoinChart department={d} allData={a} /> },
  { id: "livia", label: "Prévisions LIVIA", category: "medical", render: (d) => <LiviaProjectionsChart department={d} /> },
  { id: "top10_compare", label: "Top 10 diagnostics", category: "medical", render: (d, a) => <Top10MaladiesCompareChart department={d} allData={a} /> },
  { id: "radar_social", label: "Profil social 60-74", category: "social", render: (d, a) => <RadarSocialChart department={d} allData={a} /> },
  { id: "isolement_social", label: "Isolement social", category: "social", render: (d) => <IsolementSocialChart department={d} /> },
  { id: "fragilite_num", label: "Fragilité numérique", category: "social", render: (d) => <FragiliteNumeriqueChart department={d} /> },
  { id: "sans_voiture", label: "Sans voiture", category: "social", render: (d, a) => <SansVoitureChart department={d} allData={a} /> },
  { id: "isolement_age", label: "Seniors seuls par âge", category: "social", render: (d, a) => <IsolementParAgeChart department={d} allData={a} /> },
  { id: "demographie", label: "Démographie seniors", category: "social", render: (d) => <DemographieSeniorsChart department={d} /> },
  { id: "emissions_air", label: "Émissions air (IREP)", category: "social", render: (d, a) => <EmissionsAirChart department={d} allData={a} /> },
  { id: "sites_polluants", label: "Sites polluants (IREP)", category: "social", render: (d, a) => <SitesPolluantsChart department={d} allData={a} /> },
  { id: "qualite_air_atmo", label: "Qualité air (ATMO)", category: "social", render: (d, a) => <QualiteAirAtmoChart department={d} allData={a} /> },
  { id: "eau_potable", label: "Eau potable", category: "social", render: (d, a) => <EauPotableChart department={d} allData={a} /> },
  
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
  social: <Users className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} />,
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