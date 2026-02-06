import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from "recharts";
import { DepartmentData, formatValue, metrics } from "@/lib/data";

interface DepartmentChartsProps {
  department: DepartmentData | undefined;
  allData: DepartmentData[];
  selectedMetric: string;
}

const COLORS = ["#FF8C42", "#C41E3A", "#FFD580", "#8B4513", "#D2691E"];

export const DepartmentCharts = ({ department, allData, selectedMetric }: DepartmentChartsProps) => {
  if (!department) return null;

  // Données pour le graphique de comparaison du département vs moyenne
  const comparisonData = [
    {
      name: "Pauvreté 75+",
      departement: department.taux_pauvrete_75,
      moyenne: allData.reduce((sum, d) => sum + d.taux_pauvrete_75, 0) / allData.length,
    },
    {
      name: "Part 75+",
      departement: department.part_75_plus,
      moyenne: allData.reduce((sum, d) => sum + d.part_75_plus, 0) / allData.length,
    },
    {
      name: "Part 60+",
      departement: department.part_60_plus,
      moyenne: allData.reduce((sum, d) => sum + d.part_60_plus, 0) / allData.length,
    },
  ];

  // Données pour le pie chart population
  const populationData = [
    { name: "Femmes 60-74", value: department.femmes_60_74_isolees || 0 },
    { name: "Femmes 75+", value: department.femmes_75_plus_isolees || 0 },
    { name: "Hommes 60-74", value: department.isoles_60_74 - (department.femmes_60_74_isolees || 0) },
    { name: "Hommes 75+", value: department.isoles_75_plus - (department.femmes_75_plus_isolees || 0) },
  ].filter(d => d.value > 0);

  // Top 10 départements pour la métrique sélectionnée
  const metric = metrics.find(m => m.id === selectedMetric);
  const top10Data = [...allData]
    .filter(d => d[selectedMetric] as number > 0)
    .sort((a, b) => (b[selectedMetric] as number) - (a[selectedMetric] as number))
    .slice(0, 10)
    .map(d => ({
      name: d.code_departement,
      value: d[selectedMetric] as number,
      isSelected: d.code_departement === department.code_departement,
    }));

  // Données régionales - groupe par région et calcule la moyenne
  const regionData = Object.entries(
    allData.reduce((acc, d) => {
      const region = d.region || 'Autre';
      if (!acc[region]) acc[region] = { sum: 0, count: 0 };
      acc[region].sum += d[selectedMetric] as number || 0;
      acc[region].count += 1;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>)
  )
    .map(([region, data]) => ({
      name: region.substring(0, 15),
      value: data.sum / data.count,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Comparaison Département vs Moyenne */}
      <div className="p-4 rounded-xl bg-card border border-border shadow-card">
        <h4 className="text-sm font-semibold text-foreground mb-4">
          {department.departement} vs Moyenne nationale
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={comparisonData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
            <Tooltip 
              contentStyle={{ 
                background: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => `${value.toFixed(1)}%`}
            />
            <Bar dataKey="departement" fill="#FF8C42" name="Département" radius={[0, 4, 4, 0]} />
            <Bar dataKey="moyenne" fill="#C41E3A" name="Moyenne" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Répartition des personnes isolées */}
      <div className="p-4 rounded-xl bg-card border border-border shadow-card">
        <h4 className="text-sm font-semibold text-foreground mb-4">
          Répartition des personnes isolées
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={populationData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {populationData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                background: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => value.toLocaleString('fr-FR')}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              wrapperStyle={{ fontSize: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top 10 départements */}
      <div className="p-4 rounded-xl bg-card border border-border shadow-card">
        <h4 className="text-sm font-semibold text-foreground mb-4">
          Top 10 - {metric?.label || selectedMetric}
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={top10Data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ 
                background: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => formatValue(value, selectedMetric)}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
            >
              {top10Data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isSelected ? "#C41E3A" : "#FF8C42"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Moyenne par région */}
      <div className="p-4 rounded-xl bg-card border border-border shadow-card">
        <h4 className="text-sm font-semibold text-foreground mb-4">
          Moyenne par région
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={regionData}>
            <defs>
              <linearGradient id="colorRegion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF8C42" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FF8C42" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-45} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ 
                background: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => formatValue(value, selectedMetric)}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#C41E3A" 
              fillOpacity={1} 
              fill="url(#colorRegion)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
