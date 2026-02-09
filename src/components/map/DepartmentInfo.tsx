import { Users, TrendingUp, Euro, Heart, Activity, ArrowUp, ArrowDown, Minus } from "lucide-react";
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

  // Part 65+
  const part65Plus = department.part_60_plus;

  // Taux pauvreté 65+
  const tauxPauvrete65 = department.taux_pauvrete_60;
  const diffPauvrete = tauxPauvrete65 - avgPauvrete65;

  // Niveau de vie médian en €/mois
  const niveauVieMensuel = Math.round(department.niveau_vie_median / 12);

  // Espérance de vie
  const esperanceVie = department.esperance_vie;

  return (
    <div className="p-5 rounded-xl bg-card border border-border shadow-card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-soft" 
          style={{ background: 'linear-gradient(135deg, #FF8C42, #C41E3A)' }}>
          {department.code_departement}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-xl">{department.departement}</h3>
          <p className="text-sm text-muted-foreground">{department.region}</p>
        </div>
      </div>

      <h4 className="text-base font-semibold mb-4" style={{ color: '#FF8C42' }}>Chiffres clés</h4>
      
      {/* Grid avec cartes plus grandes et lisibles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Part 65+ */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Part 65+</span>
          </div>
          <p className="text-2xl font-bold text-orange-700">{part65Plus.toFixed(1)}%</p>
          <p className="text-xs text-orange-600/80 mt-1">de la population</p>
        </div>

        {/* Pauvreté 65+ */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-rose-600" />
            <span className="text-sm font-medium text-rose-800">Pauvreté 65+</span>
          </div>
          <p className="text-2xl font-bold text-rose-700">{tauxPauvrete65.toFixed(1)}%</p>
          <div className="flex items-center gap-1.5 mt-2">
            {diffPauvrete > 1 ? (
              <>
                <ArrowUp className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-medium text-rose-600">+{diffPauvrete.toFixed(1)} pts</span>
              </>
            ) : diffPauvrete < -1 ? (
              <>
                <ArrowDown className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-600">{diffPauvrete.toFixed(1)} pts</span>
              </>
            ) : (
              <>
                <Minus className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-orange-500">≈ moyenne</span>
              </>
            )}
            <span className="text-xs text-rose-500/70">vs France ({avgPauvrete65.toFixed(1)}%)</span>
          </div>
        </div>

        {/* Niveau de vie */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50">
          <div className="flex items-center gap-2 mb-2">
            <Euro className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Niveau de vie</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{niveauVieMensuel.toLocaleString('fr-FR')} €</p>
          <p className="text-xs text-amber-600/80 mt-1">médian / mois</p>
        </div>

        {/* Espérance de vie */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-100/50 border border-rose-200/50">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <span className="text-sm font-medium text-rose-700">Espérance de vie</span>
          </div>
          <p className="text-2xl font-bold text-rose-600">
            {esperanceVie ? `${esperanceVie.toFixed(1)} ans` : 'N/A'}
          </p>
          <p className="text-xs text-rose-500/80 mt-1">âge moyen au décès</p>
        </div>

        {/* Pathologie principale */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary/90">Pathologie n°1</span>
          </div>
          <p className="text-lg font-bold text-primary leading-tight" title={topMaladie.name}>
            {topMaladie.name.length > 20 ? topMaladie.name.substring(0, 20) + "…" : topMaladie.name}
          </p>
          <p className="text-sm font-semibold text-primary/70 mt-1">{topMaladie.value.toFixed(1)}% des 65+</p>
        </div>
      </div>
    </div>
  );
};
