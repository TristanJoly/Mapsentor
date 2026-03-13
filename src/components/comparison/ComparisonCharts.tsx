import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, LineChart, Line, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from "recharts";
import { DepartmentData, getAverage } from "@/lib/data";

interface ComparisonChartsProps {
  departments: DepartmentData[];
  allData: DepartmentData[];
  selectedCharts: string[];
}

const DEPT_COLORS = ["#C41E3A", "#FF8C42", "#2563EB", "#10B981"];
const FRANCE_COLOR = "#DEB887";

const tooltipStyle = { 
  background: 'hsl(var(--card))', 
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px'
};

const RadarSocialComparison = ({ departments }: { departments: DepartmentData[] }) => {
  const fields = [
    { key: "menage_peu_diplome_60_74", label: "Peu diplômés" },
    { key: "menage_immigre_60_74", label: "Immigrés" },
    { key: "proprietaires_60_74", label: "Propriétaires" },
    { key: "femmes_60_74_isolees", label: "Femmes isolées" },
    { key: "sans_voiture_60_74", label: "Sans voiture" },
  ];
  const data = fields.map(f => {
    const row: any = { subject: f.label };
    departments.forEach(d => { row[d.departement] = (d[f.key as keyof DepartmentData] as number) || 0; });
    return row;
  });

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Profil social 60–74 ans</h4>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
          <PolarRadiusAxis tick={{ fontSize: 8 }} />
          {departments.map((d, i) => (
            <Radar key={d.code_departement} name={d.departement} dataKey={d.departement}
              stroke={DEPT_COLORS[i]} fill={DEPT_COLORS[i]} fillOpacity={0.15 + (i === 0 ? 0.15 : 0)} />
          ))}
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const RadarSanteComparison = ({ departments, allData }: { departments: DepartmentData[]; allData: DepartmentData[] }) => {
  const vars = [
    { key: "vue_difficulte", label: "Vue" },
    { key: "mal_chro_oui", label: "Mal. chroniques" },
    { key: "lfphysiques_oui", label: "Lim. physiques" },
    { key: "auditif_difficulte", label: "Auditif" },
    { key: "handicap_oui", label: "Handicap" },
    { key: "etat_sante_mauvais", label: "Mauvais état" },
  ];
  const data = vars.map(v => {
    const row: any = { subject: v.label, france: getAverage(allData, v.key as keyof DepartmentData) };
    departments.forEach(d => { row[d.departement] = (d[v.key as keyof DepartmentData] as number) || 0; });
    return row;
  });

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Radar santé</h4>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8 }} />
          <PolarRadiusAxis tick={{ fontSize: 8 }} />
          {departments.map((d, i) => (
            <Radar key={d.code_departement} name={d.departement} dataKey={d.departement}
              stroke={DEPT_COLORS[i]} fill={DEPT_COLORS[i]} fillOpacity={0.15 + (i === 0 ? 0.1 : 0)} />
          ))}
          <Radar name="France" dataKey="france" stroke={FRANCE_COLOR} fill={FRANCE_COLOR} fillOpacity={0.1} />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const VaccinationComparison = ({ departments, allData }: { departments: DepartmentData[]; allData: DepartmentData[] }) => {
  const data = [
    { name: "Covid 65+", France: getAverage(allData, 'covid_65_plus') },
    { name: "Grippe 65+", France: getAverage(allData, 'grippe_65_plus') },
  ].map(row => {
    departments.forEach(d => {
      (row as any)[d.departement] = row.name === "Covid 65+" ? d.covid_65_plus : d.grippe_65_plus;
    });
    return row;
  });

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Taux de vaccination</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={tooltipStyle} />
          {departments.map((d, i) => (
            <Bar key={d.code_departement} dataKey={d.departement} fill={DEPT_COLORS[i]} />
          ))}
          <Bar dataKey="France" fill={FRANCE_COLOR} />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const RevenusComparison = ({ departments, allData }: { departments: DepartmentData[]; allData: DepartmentData[] }) => {
  const rows = [
    { name: "60-74 ans", key: "revenu_median_60_74" },
    { name: "75+ ans", key: "revenu_median_75_plus" },
  ];
  const data = rows.map(r => {
    const row: any = { name: r.name, France: getAverage(allData, r.key as keyof DepartmentData) };
    departments.forEach(d => { row[d.departement] = (d[r.key as keyof DepartmentData] as number) || 0; });
    return row;
  });

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Revenus médians</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} €`} contentStyle={tooltipStyle} />
          {departments.map((d, i) => (
            <Bar key={d.code_departement} dataKey={d.departement} fill={DEPT_COLORS[i]} />
          ))}
          <Bar dataKey="France" fill={FRANCE_COLOR} />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const IsolementComparison = ({ departments }: { departments: DepartmentData[] }) => {
  const indicators = [
    { name: "Isolés 60-74 (%)", getValue: (d: DepartmentData) => {
      const pop = d.femmes_60_74_ans + d.hommes_60_74_ans;
      return pop > 0 ? (d.isoles_60_74 / pop) * 100 : 0;
    }},
    { name: "Isolés 75+ (%)", getValue: (d: DepartmentData) => {
      const pop = d.femmes_75_plus + d.hommes_75_plus;
      return pop > 0 ? (d.isoles_75_plus / pop) * 100 : 0;
    }},
    { name: "Femmes 60-74 isolées (%)", getValue: (d: DepartmentData) => 
      d.femmes_60_74_ans > 0 ? (d.femmes_60_74_isolees / d.femmes_60_74_ans) * 100 : 0
    },
    { name: "Femmes 75+ isolées (%)", getValue: (d: DepartmentData) => 
      d.femmes_75_plus > 0 ? (d.femmes_75_plus_isolees / d.femmes_75_plus) * 100 : 0
    },
  ];
  const data = indicators.map(ind => {
    const row: any = { name: ind.name };
    departments.forEach(d => { row[d.departement] = ind.getValue(d); });
    return row;
  });

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Isolement social (%)</h4>
      <ResponsiveContainer width="100%" height={departments.length > 2 ? 300 : 250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 8 }} width={110} />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={tooltipStyle} />
          {departments.map((d, i) => (
            <Bar key={d.code_departement} dataKey={d.departement} fill={DEPT_COLORS[i]} />
          ))}
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const LiviaComparison = ({ departments }: { departments: DepartmentData[] }) => {
  const annees = [2025, 2030, 2035, 2040, 2045, 2050];
  const data = annees.map(annee => {
    const row: any = { annee };
    departments.forEach(d => {
      row[d.departement] = (d[`vol_glob_s1_f_${annee}` as keyof DepartmentData] as number) || 0;
    });
    return row;
  });

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Projections LIVIA (Femmes)</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="annee" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={tooltipStyle} />
          {departments.map((d, i) => (
            <Line key={d.code_departement} type="monotone" dataKey={d.departement}
              stroke={DEPT_COLORS[i]} strokeWidth={2} dot />
          ))}
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const AspaComparison = ({ departments }: { departments: DepartmentData[] }) => {
  const annees = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
  const data = annees.map(annee => {
    const row: any = { annee };
    departments.forEach(d => {
      row[d.departement] = (d[`aspa_effectif_${annee}` as keyof DepartmentData] as number) || 0;
    });
    return row;
  });

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Évolution ASPA</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="annee" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} contentStyle={tooltipStyle} />
          {departments.map((d, i) => (
            <Line key={d.code_departement} type="monotone" dataKey={d.departement}
              stroke={DEPT_COLORS[i]} strokeWidth={2} dot />
          ))}
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const ServicesComparison = ({ departments, allData }: { departments: DepartmentData[]; allData: DepartmentData[] }) => {
  const popNat = allData.reduce((sum, d) => sum + d.population, 0);
  const calcIndex = (dept: DepartmentData, col: keyof DepartmentData) => {
    const natRate = allData.reduce((sum, d) => sum + (d[col] as number || 0), 0) / popNat;
    const rate = (dept[col] as number || 0) / dept.population;
    return natRate > 0 ? rate / natRate : 0;
  };
  const keys: { name: string; col: keyof DepartmentData }[] = [
    { name: "Aides domicile", col: "apl_sapa" },
    { name: "EHPAD", col: "apl_ehpa" },
    { name: "Médecins", col: "access_med_generalistes" },
  ];
  const data = keys.map(k => {
    const row: any = { name: k.name };
    departments.forEach(d => { row[d.departement] = calcIndex(d, k.col); });
    return row;
  });

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4">Offre médico-sociale (indice)</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} domain={[0, 2]} />
          <Tooltip formatter={(value: number) => value.toFixed(2)} contentStyle={tooltipStyle} />
          {departments.map((d, i) => (
            <Bar key={d.code_departement} dataKey={d.departement} fill={DEPT_COLORS[i]} />
          ))}
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-xs text-center text-muted-foreground mt-2">1 = moyenne nationale</div>
    </div>
  );
};

export const ComparisonCharts = ({ departments, allData, selectedCharts }: ComparisonChartsProps) => {
  const chartComponents: { [key: string]: JSX.Element } = {
    radar_social: <RadarSocialComparison departments={departments} />,
    radar_sante: <RadarSanteComparison departments={departments} allData={allData} />,
    vaccination: <VaccinationComparison departments={departments} allData={allData} />,
    revenus: <RevenusComparison departments={departments} allData={allData} />,
    isolement: <IsolementComparison departments={departments} />,
    livia: <LiviaComparison departments={departments} />,
    aspa: <AspaComparison departments={departments} />,
    services: <ServicesComparison departments={departments} allData={allData} />,
  };

  if (selectedCharts.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-muted/50 border border-border text-center">
        <p className="text-muted-foreground">Sélectionnez des graphiques à afficher</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {selectedCharts.map(chartId => (
        <div key={chartId}>{chartComponents[chartId]}</div>
      ))}
    </div>
  );
};
