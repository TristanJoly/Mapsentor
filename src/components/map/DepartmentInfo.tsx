import { Users, TrendingUp, Home, Euro, Heart, UserX } from "lucide-react";
import { DepartmentData, formatValue } from "@/lib/data";

interface DepartmentInfoProps {
  department: DepartmentData | undefined;
  allData: DepartmentData[];
}

export const DepartmentInfo = ({ department, allData }: DepartmentInfoProps) => {
  if (!department) {
    return (
      <div className="p-5 rounded-xl bg-card border border-border shadow-card">
        <p className="text-sm text-muted-foreground">Sélectionnez un département</p>
      </div>
    );
  }

  // Calculate national averages
  const avgPauvrete = allData.reduce((sum, d) => sum + d.taux_pauvrete_75, 0) / allData.length;
  const avgIsoles = allData.reduce((sum, d) => sum + d.isoles_75_plus, 0) / allData.length;

  const getComparisonBadge = (value: number, avg: number, isLowerBetter: boolean = true) => {
    const diff = ((value - avg) / avg) * 100;
    const isGood = isLowerBetter ? diff < -10 : diff > 10;
    const isBad = isLowerBetter ? diff > 10 : diff < -10;
    
    if (isGood) return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">↓ {Math.abs(diff).toFixed(0)}%</span>;
    if (isBad) return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">↑ {Math.abs(diff).toFixed(0)}%</span>;
    return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">≈ moy.</span>;
  };

  const stats = [
    {
      label: "Population",
      value: formatValue(department.population, "population"),
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Part 75+",
      value: `${department.part_75_plus.toFixed(1)}%`,
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Pauvreté 75+",
      value: `${department.taux_pauvrete_75.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      comparison: getComparisonBadge(department.taux_pauvrete_75, avgPauvrete, true),
    },
    {
      label: "Niveau vie médian",
      value: formatValue(department.niveau_vie_median, "niveau_vie_median"),
      icon: Euro,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "EHPAD (étab.)",
      value: String(department.ehpad_nb_etab || 0),
      icon: Home,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Espérance vie",
      value: department.esperance_vie ? `${department.esperance_vie.toFixed(1)} ans` : 'N/A',
      icon: Heart,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
  ];

  return (
    <div className="p-5 rounded-xl bg-card border border-border shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-soft" 
          style={{ background: 'linear-gradient(135deg, #FF8C42, #C41E3A)' }}>
          {department.code_departement}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg">{department.departement}</h3>
          <p className="text-xs text-muted-foreground">{department.region}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-6 h-6 rounded-md ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <span className="text-xs text-muted-foreground truncate">{stat.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{stat.value}</p>
              {stat.comparison}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
