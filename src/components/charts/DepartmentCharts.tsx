import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from "recharts";
import { DepartmentData, getAverage } from "@/lib/data";

interface DepartmentChartsProps {
  department: DepartmentData | undefined;
  allData: DepartmentData[];
  selectedMetric: string;
}

// Palette de couleurs harmonisée (tons chauds beige-orange-rouge, sans vert)
const COLORS = {
  primary: "#C41E3A",      // Rouge carmin
  secondary: "#FF8C42",    // Orange
  tertiary: "#FFD580",     // Orange clair / doré
  quaternary: "#8B4513",   // Brun
  accent: "#D2691E",       // Chocolat
  light: "#FFF8DC",        // Beige clair
  muted: "#DEB887",        // Beige sable
  dark: "#A0522D",         // Sienna
};

const CHART_PALETTE = [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.quaternary, COLORS.accent];

// Chart 1: Top 5 maladies ≥65 ans
const Top5MaladiesChart = ({ department }: { department: DepartmentData }) => {
  const maladies = department.maladies_65_plus;
  if (!maladies || Object.keys(maladies).length === 0) {
    return (
      <div className="p-4 rounded-xl bg-card border border-border shadow-card h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Pas de données maladies</p>
      </div>
    );
  }

  const data = Object.entries(maladies)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name: name.substring(0, 25), value }));

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Top 5 maladies chez les ≥ 65 ans – {department.departement}
      </h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={120} />
          <Tooltip 
            contentStyle={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="value" fill={COLORS.secondary} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 2: Radar Profil Social 60-74 ans
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
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Profil social 60–74 ans
      </h4>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
          <PolarRadiusAxis tick={{ fontSize: 8 }} />
          <Radar
            name={department.departement}
            dataKey="value"
            stroke={COLORS.primary}
            fill={COLORS.secondary}
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 3: Part des 60 ans ou plus (Pie)
const Part60PlusChart = ({ department }: { department: DepartmentData }) => {
  const part60 = department.part_60_plus;
  const reste = Math.max(0, 100 - part60);

  const data = [
    { name: `60+ (${part60.toFixed(1)}%)`, value: part60 },
    { name: "Autres", value: reste },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Part des 60 ans ou plus
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            dataKey="value"
            label={({ name }) => name}
            labelLine={false}
          >
            <Cell fill={COLORS.primary} />
            <Cell fill={COLORS.light} />
          </Pie>
          <Tooltip 
            contentStyle={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 4: Radar Santé (6 variables)
const RadarSanteChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const vars = [
    { key: "vue_difficulte", label: "Vue" },
    { key: "mal_chro_oui", label: "Maladies chroniques" },
    { key: "lfphysiques_oui", label: "Limitations physiques" },
    { key: "auditif_difficulte", label: "Auditif" },
    { key: "handicap_oui", label: "Handicap déclaré" },
    { key: "etat_sante_mauvais", label: "Mauvais état santé" },
  ];

  const data = vars.map(v => ({
    subject: v.label,
    departement: department[v.key as keyof DepartmentData] as number || 0,
    france: getAverage(allData, v.key as keyof DepartmentData),
  }));

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Radar santé – difficultés et limitations
      </h4>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8 }} />
          <PolarRadiusAxis tick={{ fontSize: 8 }} />
          <Radar
            name={department.departement}
            dataKey="departement"
            stroke={COLORS.primary}
            fill={COLORS.secondary}
            fillOpacity={0.5}
          />
          <Radar
            name="France"
            dataKey="france"
            stroke={COLORS.muted}
            fill={COLORS.light}
            fillOpacity={0.3}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 5: Espérance de vie
const EsperanceVieChart = ({ department }: { department: DepartmentData }) => {
  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card flex flex-col items-center justify-center h-[200px]">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Espérance de vie
      </h4>
      <div className="text-5xl font-bold" style={{ color: COLORS.primary }}>
        {department.esperance_vie.toFixed(1)}
      </div>
      <div className="text-sm text-muted-foreground mt-2">ans</div>
    </div>
  );
};

// Chart 6: Sans voiture par âge
const SansVoitureChart = ({ department }: { department: DepartmentData }) => {
  const total_60_74 = department.femmes_60_74_ans + department.hommes_60_74_ans;
  const total_75_plus = department.femmes_75_plus + department.hommes_75_plus;

  const part_60_74 = total_60_74 > 0 ? (department.sans_voiture_60_74 / total_60_74) * 100 : 0;
  const part_75_plus = total_75_plus > 0 ? (department.sans_voiture_75_plus / total_75_plus) * 100 : 0;

  const data = [
    { name: "60–74 ans", value: part_60_74 },
    { name: "75 ans et plus", value: part_75_plus },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Part des personnes sans voiture par âge
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
          <Tooltip 
            formatter={(value: number) => `${value.toFixed(1)} %`}
            contentStyle={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            <Cell fill={COLORS.tertiary} />
            <Cell fill={COLORS.secondary} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 7: Fragilité numérique (semi-circular gauge)
const FragiliteNumeriqueChart = ({ department }: { department: DepartmentData }) => {
  const score = department.score_fragilite_numerique || 0;
  
  // Données pour le graphique en demi-cercle
  const percentage = (score / 10) * 100;
  const remaining = 100 - percentage;
  
  const getColor = (s: number) => {
    if (s <= 3.3) return COLORS.tertiary; // faible
    if (s <= 6.6) return COLORS.secondary; // moyen
    return COLORS.primary; // élevé
  };

  const gaugeData = [
    { name: "Score", value: percentage },
    { name: "Restant", value: remaining },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-2">
        Fragilité numérique des seniors
      </h4>
      <div className="relative">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={getColor(score)} />
              <Cell fill="hsl(var(--muted))" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-3xl font-bold" style={{ color: getColor(score) }}>
            {score.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">/10</div>
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-2 px-4">
        <span>Faible</span>
        <span>Moyen</span>
        <span>Élevé</span>
      </div>
    </div>
  );
};

// Chart 8: Projections LIVIA
const LiviaProjectionsChart = ({ department }: { department: DepartmentData }) => {
  const annees = [2025, 2030, 2035, 2040, 2045, 2050];
  
  const data = annees.map(annee => ({
    annee,
    femmes: department[`vol_glob_s1_f_${annee}` as keyof DepartmentData] as number || 0,
    hommes: department[`vol_glob_s1_h_${annee}` as keyof DepartmentData] as number || 0,
  }));

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Prévisions LIVIA – {department.departement}
      </h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="annee" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip 
            contentStyle={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Line type="monotone" dataKey="femmes" stroke={COLORS.primary} strokeWidth={2} name="Femmes" dot />
          <Line type="monotone" dataKey="hommes" stroke={COLORS.secondary} strokeWidth={2} strokeDasharray="5 5" name="Hommes" dot />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 9: Évolution ASPA
const AspaEvolutionChart = ({ department }: { department: DepartmentData }) => {
  const annees = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
  
  const data = annees.map(annee => ({
    annee,
    value: department[`aspa_effectif_${annee}` as keyof DepartmentData] as number || 0,
  }));

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Évolution des bénéficiaires ASPA – {department.departement}
      </h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="annee" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip 
            contentStyle={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number) => value.toLocaleString('fr-FR')}
          />
          <Line type="monotone" dataKey="value" stroke={COLORS.quaternary} strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 10: Vaccination
const VaccinationChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const regionData = allData.filter(d => d.region === department.region);
  
  const data = [
    { 
      name: "Covid 65+",
      departement: department.covid_65_plus,
      region: getAverage(regionData, 'covid_65_plus'),
      france: getAverage(allData, 'covid_65_plus'),
    },
    { 
      name: "Grippe 65+",
      departement: department.grippe_65_plus,
      region: getAverage(regionData, 'grippe_65_plus'),
      france: getAverage(allData, 'grippe_65_plus'),
    },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Taux de vaccination / prévention
      </h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip 
            formatter={(value: number) => `${value.toFixed(1)}%`}
            contentStyle={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="region" fill={COLORS.secondary} name="Région" />
          <Bar dataKey="france" fill={COLORS.tertiary} name="France" />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 11: Offre de services médico-sociaux
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

  const data = services.map(s => ({
    name: s.name,
    departement: calcIndex(s.col, popDept, popNat, allData),
    region: calcIndex(s.col, popRegion, popNat, allData),
  }));

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Indice normalisé de l'offre médico-sociale
      </h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} domain={[0, 2]} />
          <Tooltip 
            formatter={(value: number) => value.toFixed(2)}
            contentStyle={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="region" fill={COLORS.secondary} name="Région" />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-xs text-center text-muted-foreground mt-2">
        1 = moyenne nationale
      </div>
    </div>
  );
};

// Chart 12: Isolement social (donut)
const IsolementSocialChart = ({ department }: { department: DepartmentData }) => {
  const total = department.total_seniors;
  const isoles = department.isoles_60_74 + department.isoles_75_plus;
  const nonIsoles = Math.max(0, total - isoles);

  const femmesIsolees = department.femmes_60_74_isolees + department.femmes_75_plus_isolees;
  const hommesIsoles = isoles - femmesIsolees;

  const outerData = [
    { name: "Non isolés", value: nonIsoles },
    { name: "Isolés", value: isoles },
  ];

  const innerData = [
    { name: "Hommes isolés", value: Math.max(0, hommesIsoles) },
    { name: "Femmes isolées", value: femmesIsolees },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Isolement social des +60 ans
      </h4>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={outerData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={50}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            <Cell fill={COLORS.muted} />
            <Cell fill={COLORS.primary} />
          </Pie>
          <Pie
            data={innerData}
            cx="50%"
            cy="50%"
            outerRadius={45}
            innerRadius={25}
            dataKey="value"
          >
            <Cell fill={COLORS.quaternary} />
            <Cell fill={COLORS.secondary} />
          </Pie>
          <Tooltip 
            formatter={(value: number) => value.toLocaleString('fr-FR')}
            contentStyle={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 13: Propriétaires vs Locataires
const LogementChart = ({ department }: { department: DepartmentData }) => {
  const proprietaires = department.proprietaires_60_74 + department.proprietaires_75_plus;
  const total = department.total_seniors;
  const locataires = Math.max(0, total - proprietaires);

  const data = [
    { name: "Propriétaires", value: proprietaires },
    { name: "Locataires", value: locataires },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Propriétaires vs Locataires (+60 ans)
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            <Cell fill={COLORS.quaternary} />
            <Cell fill={COLORS.tertiary} />
          </Pie>
          <Tooltip 
            formatter={(value: number) => value.toLocaleString('fr-FR')}
            contentStyle={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 14: Revenus médians
const RevenusChart = ({ department, allData }: { department: DepartmentData; allData: DepartmentData[] }) => {
  const avg60_74 = getAverage(allData, 'revenu_median_60_74');
  const avg75_plus = getAverage(allData, 'revenu_median_75_plus');

  const data = [
    { 
      name: "60-74 ans", 
      departement: department.revenu_median_60_74,
      moyenne: avg60_74,
    },
    { 
      name: "75+ ans", 
      departement: department.revenu_median_75_plus,
      moyenne: avg75_plus,
    },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Revenu médian des seniors
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip 
            formatter={(value: number) => `${value.toLocaleString('fr-FR')} €`}
            contentStyle={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="departement" fill={COLORS.primary} name="Département" />
          <Bar dataKey="moyenne" fill={COLORS.secondary} name="Moyenne nationale" />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Main component
export const DepartmentCharts = ({ department, allData, selectedMetric }: DepartmentChartsProps) => {
  if (!department) return null;

  return (
    <div className="space-y-6">
      {/* Row 1: Top 5 maladies + Radar social */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Top5MaladiesChart department={department} />
        <RadarSocialChart department={department} />
      </div>

      {/* Row 2: Part 60+ + Esperance de vie + Fragilité numérique */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Part60PlusChart department={department} />
        <EsperanceVieChart department={department} />
        <FragiliteNumeriqueChart department={department} />
      </div>

      {/* Row 3: Radar santé + Sans voiture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RadarSanteChart department={department} allData={allData} />
        <SansVoitureChart department={department} />
      </div>

      {/* Row 4: LIVIA + ASPA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LiviaProjectionsChart department={department} />
        <AspaEvolutionChart department={department} />
      </div>

      {/* Row 5: Vaccination + Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VaccinationChart department={department} allData={allData} />
        <ServicesMedicoSociauxChart department={department} allData={allData} />
      </div>

      {/* Row 6: Isolement + Logement + Revenus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <IsolementSocialChart department={department} />
        <LogementChart department={department} />
        <RevenusChart department={department} allData={allData} />
      </div>
    </div>
  );
};
