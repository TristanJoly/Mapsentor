import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { DepartmentData, getAverage } from "@/lib/data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, Euro, Activity } from "lucide-react";

interface DepartmentChartsProps {
  department: DepartmentData | undefined;
  allData: DepartmentData[];
  selectedMetric: string;
}

const COLORS = {
  primary: "#C41E3A",
  secondary: "#FF8C42",
  tertiary: "#FFD580",
  quaternary: "#8B4513",
  accent: "#D2691E",
  light: "#FFF8DC",
  muted: "#DEB887",
  dark: "#A0522D",
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
  if (!maladies || Object.keys(maladies).length === 0) {
    return (
      <div className="p-4 rounded-xl bg-card border border-border shadow-card h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Pas de données maladies</p>
      </div>
    );
  }
  // Deduplicate by using a Map with truncated name as key, keeping highest value
  const maladieEntries = Object.entries(maladies)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const data = maladieEntries.map(([name, value], index) => ({ 
    name: `${index + 1}. ${name.substring(0, 22)}`, 
    value 
  }));

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Prévalence des 5 maladies les plus fréquentes</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={120} />
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
      <h4 className="text-sm font-semibold text-foreground mb-4">Top 10 pathologies ≥ 65 ans – Comparaison</h4>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 10 }} unit="%" />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 8 }} width={130} />
          <Tooltip formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]} labelFormatter={(label) => data.find(d => d.name === label)?.fullName || label} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="region" fill={COLORS.secondary} name="Région" />
          <Bar dataKey="france" fill={COLORS.tertiary} name="France" />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
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
      <h4 className="text-sm font-semibold text-foreground mb-4">Zoom sur l'état de santé</h4>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8 }} />
          <PolarRadiusAxis tick={{ fontSize: 8 }} />
          <Radar name={department.departement} dataKey="departement" stroke={COLORS.primary} fill={COLORS.secondary} fillOpacity={0.5} />
          <Radar name="France" dataKey="france" stroke={COLORS.muted} fill={COLORS.light} fillOpacity={0.3} />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const EsperanceVieChart = ({ department }: { department: DepartmentData }) => (
  <div className="p-4 rounded-xl bg-card border border-border shadow-card flex flex-col items-center justify-center h-[200px]">
    <h4 className="text-sm font-semibold text-foreground mb-4">Espérance de vie</h4>
    <div className="text-5xl font-bold" style={{ color: COLORS.primary }}>{department.esperance_vie.toFixed(1)}</div>
    <div className="text-sm text-muted-foreground mt-2">ans</div>
  </div>
);

const VaccinationChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const regionData = allData.filter(d => d.region === department.region);
  const data = [
    { name: "Covid 65+", departement: department.covid_65_plus, region: getAverage(regionData, 'covid_65_plus'), france: getAverage(allData, 'covid_65_plus') },
    { name: "Grippe 65+", departement: department.grippe_65_plus, region: getAverage(regionData, 'grippe_65_plus'), france: getAverage(allData, 'grippe_65_plus') },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Vaccination / prévention</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="region" fill={COLORS.secondary} name="Région" />
          <Bar dataKey="france" fill={COLORS.tertiary} name="France" />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const LimitationsChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const data = [
    { name: "Vue", departement: department.vue_difficulte, france: getAverage(allData, 'vue_difficulte') },
    { name: "Audition", departement: department.auditif_difficulte, france: getAverage(allData, 'auditif_difficulte') },
    { name: "Physiques", departement: department.lfphysiques_oui, france: getAverage(allData, 'lfphysiques_oui') },
    { name: "Handicap", departement: department.handicap_oui, france: getAverage(allData, 'handicap_oui') },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Limitations fonctionnelles</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="france" fill={COLORS.muted} name="France" />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
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
      <h4 className="text-sm font-semibold text-foreground mb-4">Offre médico-sociale</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} domain={[0, 2]} />
          <Tooltip formatter={(value: number) => value.toFixed(2)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="region" fill={COLORS.secondary} name="Région" />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ============ GRAPHIQUES SOCIAUX ============

const RadarSocialChart = ({ department }: { department: DepartmentData }) => {
  const data = [
    { subject: "Peu diplômés", value: department.menage_peu_diplome_60_74 },
    { subject: "Immigrés", value: department.menage_immigre_60_74 },
    { subject: "Propriétaires", value: department.proprietaires_60_74 },
    { subject: "Femmes isolées", value: department.femmes_60_74_isolees },
    { subject: "Sans voiture", value: department.sans_voiture_60_74 },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Profil social 60–74 ans</h4>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
          <PolarRadiusAxis tick={{ fontSize: 8 }} />
          <Radar name={department.departement} dataKey="value" stroke={COLORS.primary} fill={COLORS.secondary} fillOpacity={0.5} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const Part60PlusChart = ({ department }: { department: DepartmentData }) => {
  const part60 = department.part_60_plus;
  const data = [{ name: `60+ (${part60.toFixed(1)}%)`, value: part60 }, { name: "Autres", value: Math.max(0, 100 - part60) }];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Part des 60 ans ou plus</h4>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" label={({ name }) => name} labelLine={false}>
            <Cell fill={COLORS.primary} />
            <Cell fill={COLORS.light} />
          </Pie>
          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const SansVoitureChart = ({ department }: { department: DepartmentData }) => {
  const total_60_74 = department.femmes_60_74_ans + department.hommes_60_74_ans;
  const total_75_plus = department.femmes_75_plus + department.hommes_75_plus;
  const data = [
    { name: "60–74 ans", value: total_60_74 > 0 ? (department.sans_voiture_60_74 / total_60_74) * 100 : 0 },
    { name: "75+ ans", value: total_75_plus > 0 ? (department.sans_voiture_75_plus / total_75_plus) * 100 : 0 },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Sans voiture par âge</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            <Cell fill={COLORS.tertiary} />
            <Cell fill={COLORS.secondary} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const FragiliteNumeriqueChart = ({ department }: { department: DepartmentData }) => {
  const score = department.score_fragilite_numerique || 0;
  const percentage = (score / 10) * 100;
  const getColor = (s: number) => s <= 3.3 ? COLORS.tertiary : s <= 6.6 ? COLORS.secondary : COLORS.primary;
  const gaugeData = [{ name: "Score", value: percentage }, { name: "Restant", value: 100 - percentage }];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-2">Fragilité numérique</h4>
      <div className="relative">
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie data={gaugeData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={50} outerRadius={65} dataKey="value" stroke="none">
              <Cell fill={getColor(score)} />
              <Cell fill="hsl(var(--muted))" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-3xl font-bold" style={{ color: getColor(score) }}>{score.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">/10</div>
        </div>
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
      <h4 className="text-sm font-semibold text-foreground mb-4">Isolement social +60 ans</h4>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={outerData} cx="50%" cy="50%" outerRadius={65} innerRadius={40} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
            <Cell fill={COLORS.muted} />
            <Cell fill={COLORS.primary} />
          </Pie>
          <Pie data={innerData} cx="50%" cy="50%" outerRadius={35} innerRadius={18} dataKey="value">
            <Cell fill={COLORS.quaternary} />
            <Cell fill={COLORS.secondary} />
          </Pie>
          <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const LogementChart = ({ department }: { department: DepartmentData }) => {
  const proprietaires = department.proprietaires_60_74 + department.proprietaires_75_plus;
  const total = department.total_seniors;
  const data = [{ name: "Propriétaires", value: proprietaires }, { name: "Locataires", value: Math.max(0, total - proprietaires) }];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Propriétaires vs Locataires</h4>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
            <Cell fill={COLORS.quaternary} />
            <Cell fill={COLORS.tertiary} />
          </Pie>
          <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Nouveaux graphiques sociaux
const IsolementParAgeChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const data = [
    { name: "60-74 ans", departement: department.isoles_60_74, france: getAverage(allData, 'isoles_60_74') },
    { name: "75+ ans", departement: department.isoles_75_plus, france: getAverage(allData, 'isoles_75_plus') },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Seniors vivant seuls par tranche d'âge</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="france" fill={COLORS.muted} name="Moy. France" />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
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
      <h4 className="text-sm font-semibold text-foreground mb-4">Répartition démographique seniors</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
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
  // Les revenus dans le CSV sont en centaines d'euros annuels, donc on divise par 100 puis par 12 pour obtenir €/mois
  const data = [
    { name: "60-74 ans", departement: Math.round(department.revenu_median_60_74 / 100 / 12), moyenne: Math.round(getAverage(allData, 'revenu_median_60_74') / 100 / 12) },
    { name: "75+ ans", departement: Math.round(department.revenu_median_75_plus / 100 / 12), moyenne: Math.round(getAverage(allData, 'revenu_median_75_plus') / 100 / 12) },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Revenu médian (€/mois)</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} €/mois`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="moyenne" fill={COLORS.secondary} name="Moyenne nationale" />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const LiviaProjectionsChart = ({ department }: { department: DepartmentData }) => {
  const annees = [2025, 2030, 2035, 2040, 2045, 2050];
  const data = annees.map(annee => ({
    annee,
    femmes: department[`vol_glob_s1_f_${annee}` as keyof DepartmentData] as number || 0,
    hommes: department[`vol_glob_s1_h_${annee}` as keyof DepartmentData] as number || 0,
  }));
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Prévisions LIVIA</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="annee" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Line type="monotone" dataKey="femmes" stroke={COLORS.primary} strokeWidth={2} name="Femmes" dot />
          <Line type="monotone" dataKey="hommes" stroke={COLORS.secondary} strokeWidth={2} strokeDasharray="5 5" name="Hommes" dot />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const AspaEvolutionChart = ({ department }: { department: DepartmentData }) => {
  const annees = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
  const data = annees.map(annee => ({ annee, value: department[`aspa_effectif_${annee}` as keyof DepartmentData] as number || 0 }));
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Évolution bénéficiaires ASPA</h4>
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

const PauvreteCompareChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const regionData = allData.filter(d => d.region === department.region);
  const data = [
    { name: "Pauvreté 60%", departement: department.taux_pauvrete_60, region: getAverage(regionData, 'taux_pauvrete_60'), france: getAverage(allData, 'taux_pauvrete_60') },
    { name: "Pauvreté 75+", departement: department.taux_pauvrete_75, region: getAverage(regionData, 'taux_pauvrete_75'), france: getAverage(allData, 'taux_pauvrete_75') },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Taux de pauvreté comparé</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="region" fill={COLORS.secondary} name="Région" />
          <Bar dataKey="france" fill={COLORS.tertiary} name="France" />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const NiveauVieChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const avgNiveauVie = getAverage(allData, 'niveau_vie_median') / 12;
  const deptNiveauVie = department.niveau_vie_median / 12;
  const diff = ((deptNiveauVie - avgNiveauVie) / avgNiveauVie) * 100;
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card flex flex-col items-center justify-center h-[200px]">
      <h4 className="text-sm font-semibold text-foreground mb-4">Niveau de vie médian</h4>
      <div className="text-4xl font-bold" style={{ color: COLORS.primary }}>{Math.round(deptNiveauVie).toLocaleString('fr-FR')} €</div>
      <div className="text-sm text-muted-foreground mt-1">/mois</div>
      <div className={`text-xs mt-2 px-2 py-1 rounded-full ${diff >= 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}% vs moyenne
      </div>
    </div>
  );
};

// Nouveaux graphiques économiques
const EhpadCapaciteChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const regionData = allData.filter(d => d.region === department.region);
  const data = [
    { name: "Lits EHPAD", departement: department.ehpad_nb_lits, region: Math.round(getAverage(regionData, 'ehpad_nb_lits')), france: Math.round(getAverage(allData, 'ehpad_nb_lits')) },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Capacité EHPAD</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="region" fill={COLORS.secondary} name="Région" />
          <Bar dataKey="france" fill={COLORS.tertiary} name="France" />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const AidesAllocationsChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const data = [
    { name: "Aide ménagère", departement: department.aide_menagere_personnes_agees, france: getAverage(allData, 'aide_menagere_personnes_agees') },
    { name: "APL SAPA", departement: department.apl_sapa, france: getAverage(allData, 'apl_sapa') },
    { name: "APL EHPA", departement: department.apl_ehpa, france: getAverage(allData, 'apl_ehpa') },
  ];
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Aides et allocations</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="france" fill={COLORS.muted} name="Moy. France" />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Main component
export const DepartmentCharts = ({ department, allData, selectedMetric }: DepartmentChartsProps) => {
  const [category, setCategory] = useState<"all" | "medical" | "social" | "economic">("all");
  
  if (!department) return null;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-card border border-border shadow-card">
        <h4 className="text-sm font-semibold text-foreground mb-3">Catégorie de graphiques</h4>
        <Tabs value={category} onValueChange={(v) => setCategory(v as typeof category)}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all" className="gap-1.5 text-xs"><Activity className="w-3.5 h-3.5" />Tous</TabsTrigger>
            <TabsTrigger value="medical" className="gap-1.5 text-xs"><Heart className="w-3.5 h-3.5" />Médical</TabsTrigger>
            <TabsTrigger value="social" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" />Social</TabsTrigger>
            <TabsTrigger value="economic" className="gap-1.5 text-xs"><Euro className="w-3.5 h-3.5" />Économique</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Medical Charts */}
      {(category === "all" || category === "medical") && (
        <div className="space-y-4">
          {category === "all" && <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><Heart className="w-5 h-5 text-primary" />Indicateurs médicaux</h3>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Top5MaladiesChart department={department} />
            <RadarSanteChart department={department} allData={allData} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <VaccinationChart department={department} allData={allData} />
            <ServicesMedicoSociauxChart department={department} allData={allData} />
          </div>
          {category === "medical" && <Top10MaladiesCompareChart department={department} allData={allData} />}
        </div>
      )}

      {/* Social Charts */}
      {(category === "all" || category === "social") && (
        <div className="space-y-4">
          {category === "all" && <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><Users className="w-5 h-5 text-secondary" />Indicateurs sociaux</h3>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RadarSocialChart department={department} />
            <IsolementSocialChart department={department} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FragiliteNumeriqueChart department={department} />
            <LogementChart department={department} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SansVoitureChart department={department} />
            <IsolementParAgeChart department={department} allData={allData} />
          </div>
          <DemographieSeniorsChart department={department} />
        </div>
      )}

      {/* Economic Charts */}
      {(category === "all" || category === "economic") && (
        <div className="space-y-4">
          {category === "all" && <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><Euro className="w-5 h-5" style={{ color: COLORS.quaternary }} />Indicateurs économiques</h3>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RevenusChart department={department} allData={allData} />
            <EhpadCapaciteChart department={department} allData={allData} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LiviaProjectionsChart department={department} />
            <AspaEvolutionChart department={department} />
          </div>
        </div>
      )}
    </div>
  );
};
