import { Users, TrendingUp, Euro, Heart, Activity } from "lucide-react";
import { DepartmentData, getAverage } from "@/lib/data";

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
  const avgPauvrete65 = getAverage(allData, 'taux_pauvrete_60');

  // Calculer la maladie la plus fréquente
  const maladies = department.maladies_65_plus || {};
  let topMaladie = { name: "N/A", value: 0 };
  Object.entries(maladies).forEach(([name, value]) => {
    if (value > topMaladie.value) {
      topMaladie = { name, value };
    }
  });

  // Part 65+ (on utilise part_60_plus comme approximation)
  const part65Plus = department.part_60_plus;

  // Taux pauvreté 65+ (on utilise taux_pauvrete_60)
  const tauxPauvrete65 = department.taux_pauvrete_60;

  // Niveau de vie médian en €/mois
  const niveauVieMensuel = Math.round(department.niveau_vie_median / 12);

  // Espérance de vie
  const esperanceVie = department.esperance_vie;

  const getComparisonBadge = (value: number, avg: number, isLowerBetter: boolean = true) => {
    const diff = ((value - avg) / avg) * 100;
    const isGood = isLowerBetter ? diff < -10 : diff > 10;
    const isBad = isLowerBetter ? diff > 10 : diff < -10;
    
    if (isGood) return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">↓ {Math.abs(diff).toFixed(0)}%</span>;
    if (isBad) return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">↑ {Math.abs(diff).toFixed(0)}%</span>;
    return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600">≈ moy.</span>;
  };

  const stats = [
    {
      label: "Part 65+",
      value: `${part65Plus.toFixed(1)}%`,
      icon: Users,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Pauvreté 65+",
      value: `${tauxPauvrete65.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      comparison: getComparisonBadge(tauxPauvrete65, avgPauvrete65, true),
    },
    {
      label: "Niveau vie médian",
      value: `${niveauVieMensuel.toLocaleString('fr-FR')} €/mois`,
      icon: Euro,
      color: "text-amber-600",
      bg: "bg-amber-600/10",
    },
    {
      label: "Espérance vie",
      value: esperanceVie ? `${esperanceVie.toFixed(1)} ans` : 'N/A',
      icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      label: "Maladie principale",
      value: topMaladie.name.length > 18 ? topMaladie.name.substring(0, 18) + "…" : topMaladie.name,
      subValue: `${topMaladie.value.toFixed(1)}%`,
      icon: Activity,
      color: "text-primary",
      bg: "bg-primary/10",
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

      <h4 className="text-sm font-semibold mb-3" style={{ color: '#FF8C42' }}>Chiffres clés</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-6 h-6 rounded-md ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <span className="text-xs text-muted-foreground truncate">{stat.label}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground">{stat.value}</p>
              {stat.subValue && <span className="text-xs text-muted-foreground">({stat.subValue})</span>}
              {stat.comparison}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};