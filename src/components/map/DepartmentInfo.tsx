import { Users, TrendingUp, Home, Activity } from "lucide-react";
import { departments } from "./DepartmentSelector";

interface DepartmentInfoProps {
  departmentCode: string;
}

// Mock data - replace with real data from your database
const getMockData = (code: string) => ({
  population75: Math.floor(Math.random() * 50000) + 10000,
  tauxIsolement: (Math.random() * 30 + 10).toFixed(1),
  placesEhpad: Math.floor(Math.random() * 5000) + 1000,
  esperanceVie: (Math.random() * 5 + 80).toFixed(1),
});

export const DepartmentInfo = ({ departmentCode }: DepartmentInfoProps) => {
  const dept = departments.find(d => d.code === departmentCode);
  const data = getMockData(departmentCode);

  if (!dept) return null;

  const stats = [
    {
      label: "Population 75+",
      value: data.population75.toLocaleString('fr-FR'),
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Taux d'isolement",
      value: `${data.tauxIsolement}%`,
      icon: TrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Places EHPAD",
      value: data.placesEhpad.toLocaleString('fr-FR'),
      icon: Home,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Espérance de vie",
      value: `${data.esperanceVie} ans`,
      icon: Activity,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <div className="p-5 rounded-xl bg-card border border-border shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm shadow-soft">
          {departmentCode}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{dept.name}</h3>
          <p className="text-xs text-muted-foreground">Département {departmentCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-6 h-6 rounded-md ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
