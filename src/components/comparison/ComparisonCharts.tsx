import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from "recharts";
import { DepartmentData, getAverage } from "@/lib/data";
import { ChartInfoButton } from "@/components/charts/ChartInfoButton";

interface ComparisonChartsProps {
  department1: DepartmentData;
  department2: DepartmentData;
  allData: DepartmentData[];
  selectedCharts: string[];
}

// Palette de couleurs pour la comparaison
const COLORS = {
  dept1: "#C41E3A",      // Rouge carmin
  dept2: "#FF8C42",      // Orange
  france: "#DEB887",     // Beige
  light: "#FFF8DC",
};

// Radar Social comparatif
const RadarSocialComparison = ({ dept1, dept2 }: { dept1: DepartmentData; dept2: DepartmentData }) => {
  const data = [
    { subject: "Peu diplômés", dept1: dept1.menage_peu_diplome_60_74, dept2: dept2.menage_peu_diplome_60_74 },
    { subject: "Immigrés", dept1: dept1.menage_immigre_60_74, dept2: dept2.menage_immigre_60_74 },
    { subject: "Propriétaires", dept1: dept1.proprietaires_60_74, dept2: dept2.proprietaires_60_74 },
    { subject: "Femmes isolées", dept1: dept1.femmes_60_74_isolees, dept2: dept2.femmes_60_74_isolees },
    { subject: "Sans voiture", dept1: dept1.sans_voiture_60_74, dept2: dept2.sans_voiture_60_74 },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
        Profil social 60–74 ans
        <ChartInfoButton
          title="Profil social comparatif"
          text="Radar comparant les caractéristiques sociales des 60-74 ans entre les deux départements : diplômes, immigration, propriété, isolement féminin et mobilité."
          howToRead="Chaque axe représente un indicateur social. Plus le tracé s'étend vers l'extérieur, plus la valeur est élevée. Comparez les deux formes pour identifier les différences de profil social."
          source="INSEE – Recensement de la population 2020, données départementales"
        />
      </h4>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
          <PolarRadiusAxis tick={{ fontSize: 8 }} />
          <Radar
            name={dept1.departement}
            dataKey="dept1"
            stroke={COLORS.dept1}
            fill={COLORS.dept1}
            fillOpacity={0.4}
          />
          <Radar
            name={dept2.departement}
            dataKey="dept2"
            stroke={COLORS.dept2}
            fill={COLORS.dept2}
            fillOpacity={0.4}
          />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Radar Santé comparatif
const RadarSanteComparison = ({ dept1, dept2, allData }: { dept1: DepartmentData; dept2: DepartmentData; allData: DepartmentData[] }) => {
  const vars = [
    { key: "vue_difficulte", label: "Vue" },
    { key: "mal_chro_oui", label: "Maladies chroniques" },
    { key: "lfphysiques_oui", label: "Limitations physiques" },
    { key: "auditif_difficulte", label: "Auditif" },
    { key: "handicap_oui", label: "Handicap" },
    { key: "etat_sante_mauvais", label: "Mauvais état" },
  ];

  const data = vars.map(v => ({
    subject: v.label,
    dept1: dept1[v.key as keyof DepartmentData] as number || 0,
    dept2: dept2[v.key as keyof DepartmentData] as number || 0,
    france: getAverage(allData, v.key as keyof DepartmentData),
  }));

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
        Radar santé
        <ChartInfoButton
          title="Radar santé comparatif"
          text="Compare les indicateurs de santé (vue, audition, maladies chroniques, limitations physiques, handicap, mauvais état de santé) entre deux départements et la moyenne France."
          howToRead="Plus le tracé est étendu, plus la situation est préoccupante. Le tracé beige (France) sert de référence. Si un département dépasse nettement la moyenne nationale sur un axe, c'est un point d'alerte."
          source="Enquête Vie Quotidienne et Santé (VQS) 2021 – DREES, données départementales"
        />
      </h4>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8 }} />
          <PolarRadiusAxis tick={{ fontSize: 8 }} />
          <Radar name={dept1.departement} dataKey="dept1" stroke={COLORS.dept1} fill={COLORS.dept1} fillOpacity={0.3} />
          <Radar name={dept2.departement} dataKey="dept2" stroke={COLORS.dept2} fill={COLORS.dept2} fillOpacity={0.3} />
          <Radar name="France" dataKey="france" stroke={COLORS.france} fill={COLORS.france} fillOpacity={0.2} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Vaccination comparatif
const VaccinationComparison = ({ dept1, dept2, allData }: { dept1: DepartmentData; dept2: DepartmentData; allData: DepartmentData[] }) => {
  const data = [
    { 
      name: "Covid 65+",
      [dept1.departement]: dept1.covid_65_plus,
      [dept2.departement]: dept2.covid_65_plus,
      France: getAverage(allData, 'covid_65_plus'),
    },
    { 
      name: "Grippe 65+",
      [dept1.departement]: dept1.grippe_65_plus,
      [dept2.departement]: dept2.grippe_65_plus,
      France: getAverage(allData, 'grippe_65_plus'),
    },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
        Taux de vaccination
        <ChartInfoButton
          title="Vaccination comparée"
          text="Taux de vaccination Covid et Grippe chez les 65+ pour les deux départements, comparés à la moyenne nationale."
          howToRead="Plus la barre est haute, meilleure est la couverture vaccinale. Si un département est nettement en dessous de la France, des campagnes ciblées pourraient être nécessaires."
          source="Santé publique France / Ameli – Taux de couverture vaccinale, 2023"
        />
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
          <Bar dataKey={dept1.departement} fill={COLORS.dept1} />
          <Bar dataKey={dept2.departement} fill={COLORS.dept2} />
          <Bar dataKey="France" fill={COLORS.france} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Revenus comparatif
const RevenusComparison = ({ dept1, dept2, allData }: { dept1: DepartmentData; dept2: DepartmentData; allData: DepartmentData[] }) => {
  const data = [
    { 
      name: "60-74 ans", 
      [dept1.departement]: dept1.revenu_median_60_74,
      [dept2.departement]: dept2.revenu_median_60_74,
      France: getAverage(allData, 'revenu_median_60_74'),
    },
    { 
      name: "75+ ans", 
      [dept1.departement]: dept1.revenu_median_75_plus,
      [dept2.departement]: dept2.revenu_median_75_plus,
      France: getAverage(allData, 'revenu_median_75_plus'),
    },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Revenus médians
      </h4>
      <ResponsiveContainer width="100%" height={250}>
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
          <Bar dataKey={dept1.departement} fill={COLORS.dept1} />
          <Bar dataKey={dept2.departement} fill={COLORS.dept2} />
          <Bar dataKey="France" fill={COLORS.france} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Isolement comparatif
const IsolementComparison = ({ dept1, dept2 }: { dept1: DepartmentData; dept2: DepartmentData }) => {
  const data = [
    { 
      name: "Isolés 60-74", 
      [dept1.departement]: dept1.isoles_60_74,
      [dept2.departement]: dept2.isoles_60_74,
    },
    { 
      name: "Isolés 75+", 
      [dept1.departement]: dept1.isoles_75_plus,
      [dept2.departement]: dept2.isoles_75_plus,
    },
    { 
      name: "Femmes 60-74 isolées", 
      [dept1.departement]: dept1.femmes_60_74_isolees,
      [dept2.departement]: dept2.femmes_60_74_isolees,
    },
    { 
      name: "Femmes 75+ isolées", 
      [dept1.departement]: dept1.femmes_75_plus_isolees,
      [dept2.departement]: dept2.femmes_75_plus_isolees,
    },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Isolement social
      </h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={100} />
          <Tooltip 
            formatter={(value: number) => value.toLocaleString('fr-FR')}
            contentStyle={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Bar dataKey={dept1.departement} fill={COLORS.dept1} />
          <Bar dataKey={dept2.departement} fill={COLORS.dept2} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// LIVIA comparatif
const LiviaComparison = ({ dept1, dept2 }: { dept1: DepartmentData; dept2: DepartmentData }) => {
  const annees = [2025, 2030, 2035, 2040, 2045, 2050];
  
  const data = annees.map(annee => ({
    annee,
    [`${dept1.departement} F`]: (dept1[`vol_glob_s1_f_${annee}` as keyof DepartmentData] as number) || 0,
    [`${dept1.departement} H`]: (dept1[`vol_glob_s1_h_${annee}` as keyof DepartmentData] as number) || 0,
    [`${dept2.departement} F`]: (dept2[`vol_glob_s1_f_${annee}` as keyof DepartmentData] as number) || 0,
    [`${dept2.departement} H`]: (dept2[`vol_glob_s1_h_${annee}` as keyof DepartmentData] as number) || 0,
  }));

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Projections LIVIA (Femmes)
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
          <Line type="monotone" dataKey={`${dept1.departement} F`} stroke={COLORS.dept1} strokeWidth={2} dot />
          <Line type="monotone" dataKey={`${dept2.departement} F`} stroke={COLORS.dept2} strokeWidth={2} dot />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// ASPA comparatif
const AspaComparison = ({ dept1, dept2 }: { dept1: DepartmentData; dept2: DepartmentData }) => {
  const annees = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
  
  const data = annees.map(annee => ({
    annee,
    [dept1.departement]: (dept1[`aspa_effectif_${annee}` as keyof DepartmentData] as number) || 0,
    [dept2.departement]: (dept2[`aspa_effectif_${annee}` as keyof DepartmentData] as number) || 0,
  }));

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Évolution ASPA
      </h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="annee" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip 
            formatter={(value: number) => value.toLocaleString('fr-FR')}
            contentStyle={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Line type="monotone" dataKey={dept1.departement} stroke={COLORS.dept1} strokeWidth={2} dot />
          <Line type="monotone" dataKey={dept2.departement} stroke={COLORS.dept2} strokeWidth={2} dot />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Services médico-sociaux comparatif
const ServicesComparison = ({ dept1, dept2, allData }: { dept1: DepartmentData; dept2: DepartmentData; allData: DepartmentData[] }) => {
  const popNat = allData.reduce((sum, d) => sum + d.population, 0);
  
  const calcIndex = (dept: DepartmentData, col: keyof DepartmentData) => {
    const natRate = allData.reduce((sum, d) => sum + (d[col] as number || 0), 0) / popNat;
    const rate = (dept[col] as number || 0) / dept.population;
    return natRate > 0 ? rate / natRate : 0;
  };

  const data = [
    { 
      name: "Aides domicile", 
      [dept1.departement]: calcIndex(dept1, 'apl_sapa'),
      [dept2.departement]: calcIndex(dept2, 'apl_sapa'),
    },
    { 
      name: "EHPAD", 
      [dept1.departement]: calcIndex(dept1, 'apl_ehpa'),
      [dept2.departement]: calcIndex(dept2, 'apl_ehpa'),
    },
    { 
      name: "Médecins", 
      [dept1.departement]: calcIndex(dept1, 'access_med_generalistes'),
      [dept2.departement]: calcIndex(dept2, 'access_med_generalistes'),
    },
  ];

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">
        Offre médico-sociale (indice)
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
          <Bar dataKey={dept1.departement} fill={COLORS.dept1} />
          <Bar dataKey={dept2.departement} fill={COLORS.dept2} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#333' }} />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-xs text-center text-muted-foreground mt-2">
        1 = moyenne nationale
      </div>
    </div>
  );
};

export const ComparisonCharts = ({ department1, department2, allData, selectedCharts }: ComparisonChartsProps) => {
  const chartComponents: { [key: string]: JSX.Element } = {
    radar_social: <RadarSocialComparison dept1={department1} dept2={department2} />,
    radar_sante: <RadarSanteComparison dept1={department1} dept2={department2} allData={allData} />,
    vaccination: <VaccinationComparison dept1={department1} dept2={department2} allData={allData} />,
    revenus: <RevenusComparison dept1={department1} dept2={department2} allData={allData} />,
    isolement: <IsolementComparison dept1={department1} dept2={department2} />,
    livia: <LiviaComparison dept1={department1} dept2={department2} />,
    aspa: <AspaComparison dept1={department1} dept2={department2} />,
    services: <ServicesComparison dept1={department1} dept2={department2} allData={allData} />,
  };

  if (selectedCharts.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-muted/50 border border-border text-center">
        <p className="text-muted-foreground">
          Sélectionnez des graphiques à afficher
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {selectedCharts.map(chartId => (
        <div key={chartId}>
          {chartComponents[chartId]}
        </div>
      ))}
    </div>
  );
};
