import { Users, TrendingUp, Euro, Heart, Activity, TrendingDown } from "lucide-react";
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

  // Calculate national average for poverty rate
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
  const diffPauvrete = tauxPauvrete65 - avgPauvrete65;

  // Niveau de vie médian en €/mois
  const niveauVieMensuel = Math.round(department.niveau_vie_median / 12);

  // Espérance de vie
  const esperanceVie = department.esperance_vie;

  // Comparison badge with clearer text
  const getPauvreteComparison = () => {
    if (diffPauvrete > 1) {
      return (
        <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
          <TrendingUp className="w-3 h-3" />
          <span>+{diffPauvrete.toFixed(1)} pts vs France</span>
        </div>
      );
    } else if (diffPauvrete < -1) {
      return (
        <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
          <TrendingDown className="w-3 h-3" />
          <span>{diffPauvrete.toFixed(1)} pts vs France</span>
        </div>
      );
    }
    return (
      <div className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
        ≈ moyenne nationale
      </div>
    );
  };

  const stats = [
    {
      label: "Part 65+",
      value: `${part65Plus.toFixed(1)}%`,
      subtitle: "de la population",
      icon: Users,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Pauvreté 65+",
      value: `${tauxPauvrete65.toFixed(1)}%`,
      subtitle: `moy. France : ${avgPauvrete65.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      comparison: getPauvreteComparison(),
    },
    {
      label: "Niveau vie médian",
      value: `${niveauVieMensuel.toLocaleString('fr-FR')} €`,
      subtitle: "par mois",
      icon: Euro,
      color: "text-amber-600",
      bg: "bg-amber-600/10",
    },
    {
      label: "Espérance vie",
      value: esperanceVie ? `${esperanceVie.toFixed(1)} ans` : 'N/A',
      subtitle: "âge moyen au décès",
      icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      label: "Pathologie n°1",
      value: topMaladie.name.length > 16 ? topMaladie.name.substring(0, 16) + "…" : topMaladie.name,
      subtitle: `${topMaladie.value.toFixed(1)}% des 65+`,
      fullName: topMaladie.name,
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
          <div key={i} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group" title={stat.fullName || stat.label}>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-6 h-6 rounded-md ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <span className="text-xs text-muted-foreground truncate">{stat.label}</span>
            </div>
            <p className="text-sm font-semibold text-foreground truncate">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.subtitle}</p>
            )}
            {stat.comparison && (
              <div className="mt-1.5">{stat.comparison}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
