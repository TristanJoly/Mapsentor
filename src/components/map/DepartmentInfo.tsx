import { Users, TrendingUp, Home, Activity, Euro, Heart, UserX } from "lucide-react";
import { DepartmentData, formatValue } from "@/lib/data";

interface DepartmentInfoProps {
  department: DepartmentData | undefined;
}

export const DepartmentInfo = ({ department }: DepartmentInfoProps) => {
  if (!department) {
    return (
      <div className="p-5 rounded-xl bg-card border border-border shadow-card">
        <p className="text-sm text-muted-foreground">Sélectionnez un département</p>
      </div>
    );
  }

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
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Isolés 75+",
      value: formatValue(department.isoles_75_plus, "isoles_75_plus"),
      icon: UserX,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Pauvreté 75+",
      value: `${department.taux_pauvrete_75.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
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
    {
      label: "Accès médecins",
      value: department.access_med_generalistes ? department.access_med_generalistes.toFixed(0) : 'N/A',
      icon: Activity,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="p-5 rounded-xl bg-card border border-border shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm shadow-soft">
          {department.code_departement}
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-lg">{department.departement}</h3>
          <p className="text-xs text-muted-foreground">{department.region}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-6 h-6 rounded-md ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <span className="text-xs text-muted-foreground truncate">{stat.label}</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
