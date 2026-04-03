import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, LineChart, Line, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from "recharts";
import { DepartmentData, getAverage } from "@/lib/data";
import { ChartInfoButton } from "@/components/charts/ChartInfoButton";

interface ComparisonChartsProps {
  departments: DepartmentData[];
  allData: DepartmentData[];
  selectedCharts: string[];
}

const DEPT_COLORS = ["#1E40AF", "#3B82F6", "#60A5FA", "#10B981"];
const FRANCE_COLOR = "#DEB887";

const tooltipStyle = { 
  background: 'hsl(var(--card))', 
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px'
};

// ===== Top 5 pathologies chez 65+ =====
const Top5PathologiesComparison = ({ departments }: { departments: DepartmentData[] }) => {
  // Collect all pathologies across selected depts and pick top 5 by max prevalence
  const allPathos = new Map<string, number>();
  departments.forEach(d => {
    Object.entries(d.maladies_65_plus || {}).forEach(([name, val]) => {
      allPathos.set(name, Math.max(allPathos.get(name) || 0, val as number));
    });
  });
  const top5 = [...allPathos.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);

  const data = top5.map(name => {
    const row: any = { name: name.length > 25 ? name.slice(0, 22) + '...' : name };
    departments.forEach(d => {
      row[d.departement] = (d.maladies_65_plus?.[name] as number) || 0;
    });
    return row;
  });

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
        Top 5 pathologies chez les 65+
        <ChartInfoButton title="Top 5 pathologies comparées" text="Les 5 diagnostics les plus fréquents chez les 65+ comparés entre départements." howToRead="Plus la barre est longue, plus la prévalence est élevée dans ce département." source="Dataset Ameli (CNAM) – 2023" />
      </h4>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 8 }} width={130} />
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

// ===== Zoom état de santé 65+ (Radar) =====
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
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
        Zoom sur l'état de santé des 65+
        <ChartInfoButton title="État de santé comparatif" text="Compare les indicateurs de santé entre les départements et la moyenne France." howToRead="Plus le tracé est étendu, plus la situation est préoccupante. Le tracé beige (France) sert de référence." source="Enquête VQS 2021 – DREES" />
      </h4>
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

// ===== Déficit de l'offre en lits d'EHPAD 75+ =====
const DeficitEhpadComparison = ({ departments, allData }: { departments: DepartmentData[]; allData: DepartmentData[] }) => {
  const data = departments.map(d => {
    const pop75 = d.femmes_75_plus + d.hommes_75_plus;
    const tauxCouverture = pop75 > 0 ? (d.ehpad_nb_lits / pop75) * 100 : 0;
    return { name: d.departement, taux: tauxCouverture };
  });
  // National average
  const totalLits = allData.reduce((s, d) => s + d.ehpad_nb_lits, 0);
  const totalPop75 = allData.reduce((s, d) => s + d.femmes_75_plus + d.hommes_75_plus, 0);
  const avgNat = totalPop75 > 0 ? (totalLits / totalPop75) * 100 : 0;

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
        Déficit de l'offre en lits d'EHPAD pour les 75+
        <ChartInfoButton title="Couverture EHPAD" text="Taux de couverture : nombre de lits EHPAD pour 100 personnes de 75+ ans." howToRead="Plus le taux est bas, plus le déficit est important. La ligne pointillée = moyenne nationale." source="DREES – Panorama statistique 2024" />
      </h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v.toFixed(1)}%`} />
          <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} contentStyle={tooltipStyle} />
          {data.map((_, i) => null)}
          <Bar dataKey="taux" fill={DEPT_COLORS[0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
            ))}
          </Bar>
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-xs text-center text-muted-foreground mt-1">Moyenne nationale : {avgNat.toFixed(2)}%</div>
    </div>
  );
};

// ===== Isolement social (65+) =====
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
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
        Isolement social (65+)
        <ChartInfoButton title="Isolement social comparé" text="Taux de personnes isolées par tranche d'âge et genre." howToRead="Plus la barre est longue, plus le taux d'isolement est élevé." source="INSEE – Recensement 2020" />
      </h4>
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

// ===== Fragilité numérique =====
const FragiliteNumeriqueComparison = ({ departments, allData }: { departments: DepartmentData[]; allData: DepartmentData[] }) => {
  const data = departments.map(d => ({
    name: d.departement,
    score: d.score_fragilite_numerique,
  }));
  const avgFrance = getAverage(allData, 'score_fragilite_numerique');

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
        Fragilité numérique
        <ChartInfoButton title="Fragilité numérique comparée" text="Score de fragilité numérique des seniors par département." howToRead="Plus le score est élevé, plus les seniors sont en difficulté face au numérique." source="Indice de fragilité numérique – INSEE / ARCEP" />
      </h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => value.toFixed(1)} contentStyle={tooltipStyle} />
          <Bar dataKey="score" fill={DEPT_COLORS[0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
            ))}
          </Bar>
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-xs text-center text-muted-foreground mt-1">Moyenne nationale : {avgFrance.toFixed(1)}</div>
    </div>
  );
};

// ===== Revenu médian (€/mois) =====
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
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
        Revenu médian (€/mois)
        <ChartInfoButton title="Revenus médians comparés" text="Revenu médian mensuel par tranche d'âge." howToRead="Plus la barre est haute, plus le revenu est élevé." source="INSEE – FILOSOFI 2021" />
      </h4>
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

// ===== Évolution bénéficiaires ASPA =====
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
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
        Évolution bénéficiaires ASPA
        <ChartInfoButton title="Évolution ASPA" text="Nombre de bénéficiaires ASPA de 2013 à 2024." howToRead="Une courbe ascendante indique un nombre croissant de seniors en précarité." source="CNAV / Caisse des Dépôts, 2013-2024" />
      </h4>
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

// ===== APL service d'aide (SAPA) =====
const AplSapaComparison = ({ departments, allData }: { departments: DepartmentData[]; allData: DepartmentData[] }) => {
  const data = departments.map(d => ({
    name: d.departement,
    apl: d.apl_sapa,
  }));
  const avgFrance = getAverage(allData, 'apl_sapa');

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-card">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
        APL service d'aide (SAPA)
        <ChartInfoButton title="APL SAPA comparé" text="Nombre de consultations accessibles par an par habitant standardisé pour les services d'aide à domicile." howToRead="Plus la valeur est élevée, meilleur est l'accès." source="DREES – Panorama statistique 2024" />
      </h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v.toFixed(1)} C./an/hab.`} />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)} C./an/hab.`} contentStyle={tooltipStyle} />
          <Bar dataKey="apl" fill={DEPT_COLORS[0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
            ))}
          </Bar>
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-xs text-center text-muted-foreground mt-1">Moyenne nationale : {avgFrance.toFixed(1)} C./an/hab.</div>
    </div>
  );
};

// Need to import Cell for individual bar coloring
import { Cell } from "recharts";

export const ComparisonCharts = ({ departments, allData, selectedCharts }: ComparisonChartsProps) => {
  const chartComponents: { [key: string]: JSX.Element } = {
    top5_pathologies: <Top5PathologiesComparison departments={departments} />,
    radar_sante: <RadarSanteComparison departments={departments} allData={allData} />,
    deficit_ehpad: <DeficitEhpadComparison departments={departments} allData={allData} />,
    isolement: <IsolementComparison departments={departments} />,
    fragilite_numerique: <FragiliteNumeriqueComparison departments={departments} allData={allData} />,
    revenus: <RevenusComparison departments={departments} allData={allData} />,
    aspa: <AspaComparison departments={departments} />,
    apl_sapa: <AplSapaComparison departments={departments} allData={allData} />,
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
        chartComponents[chartId] ? <div key={chartId}>{chartComponents[chartId]}</div> : null
      ))}
    </div>
  );
};
