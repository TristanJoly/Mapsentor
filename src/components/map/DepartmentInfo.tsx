import { Users, TrendingUp, Euro, Heart, Activity, ArrowUp, ArrowDown, Minus, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DepartmentData, getAverage } from "@/lib/data";

const getRanking = (allData: DepartmentData[], code: string, key: keyof DepartmentData, ascending = false) => {
  const sorted = [...allData]
    .filter(d => (d[key] as number) > 0)
    .sort((a, b) => ascending 
      ? (a[key] as number) - (b[key] as number) 
      : (b[key] as number) - (a[key] as number)
    );
  const rank = sorted.findIndex(d => d.code_departement === code) + 1;
  return { rank, total: sorted.length };
};

const RankBadge = ({ rank, total }: { rank: number; total: number }) => {
  const isTop = rank <= 10;
  const isBottom = rank > total - 10;
  return (
    <div className="flex items-center gap-1 mt-1">
      <span className={`text-[10px] font-medium ${isTop ? 'text-amber-600' : isBottom ? 'text-rose-500' : 'text-muted-foreground/70'}`}>
        {rank}<sup>e</sup>/{total}
      </span>
    </div>
  );
};

interface DepartmentInfoProps {
  department: DepartmentData | undefined;
  allData: DepartmentData[];
}

const ComparisonBadge = ({ value, avg, unit = "pts", invert = false }: { value: number; avg: number; unit?: string; invert?: boolean }) => {
  const diff = value - avg;
  // invert: lower is better (e.g. poverty)
  const isGood = invert ? diff < -1 : diff > 1;
  const isBad = invert ? diff > 1 : diff < -1;

  if (Math.abs(diff) <= 1) {
    return (
      <div className="flex items-center gap-1 mt-1.5">
        <Minus className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">≈ moy. nationale</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-1.5">
      {diff > 0 ? (
        <ArrowUp className={`w-3.5 h-3.5 ${isBad ? 'text-rose-600' : 'text-emerald-600'}`} />
      ) : (
        <ArrowDown className={`w-3.5 h-3.5 ${isGood ? 'text-emerald-600' : 'text-rose-600'}`} />
      )}
      <span className={`text-xs font-medium ${isBad ? 'text-rose-600' : isGood ? 'text-emerald-600' : 'text-muted-foreground'}`}>
        {diff > 0 ? '+' : ''}{unit === '%' ? diff.toFixed(1) + ' pts' : Math.round(diff).toLocaleString('fr-FR') + (unit ? ' ' + unit : '')}
      </span>
      <span className="text-xs text-muted-foreground/70">vs FR</span>
    </div>
  );
};

export const DepartmentInfo = ({ department, allData }: DepartmentInfoProps) => {
  if (!department) {
    return (
      <div className="p-5 rounded-xl bg-card border border-border shadow-card">
        <p className="text-sm text-muted-foreground">Sélectionnez un département</p>
      </div>
    );
  }

  // Moyennes nationales
  const avgPauvrete65 = getAverage(allData, 'taux_pauvrete_60');
  const avgPart65 = getAverage(allData, 'part_60_plus');
  const avgNiveauVie = getAverage(allData, 'niveau_vie_median');
  const avgEsperanceVie = getAverage(allData, 'esperance_vie');

  // Calculer la maladie la plus fréquente
  const maladies = department.maladies_65_plus || {};
  let topMaladie = { name: "N/A", value: 0 };
  Object.entries(maladies).forEach(([name, value]) => {
    if (value > topMaladie.value) {
      topMaladie = { name, value };
    }
  });

  const part65Plus = department.part_60_plus;
  const tauxPauvrete65 = department.taux_pauvrete_60;
  const niveauVieMensuel = Math.round(department.niveau_vie_median / 12);
  const avgNiveauVieMensuel = Math.round(avgNiveauVie / 12);
  const esperanceVie = department.esperance_vie;

  // Rankings
  const rankPart65 = getRanking(allData, department.code_departement, 'part_60_plus');
  const rankPauvrete = getRanking(allData, department.code_departement, 'taux_pauvrete_60', true);
  const rankNiveauVie = getRanking(allData, department.code_departement, 'niveau_vie_median');
  const rankEsperance = getRanking(allData, department.code_departement, 'esperance_vie');

  return (
    <div className="p-5 rounded-xl bg-card border border-border shadow-card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-soft" 
          style={{ background: 'linear-gradient(135deg, #3B82F6, #1E40AF)' }}>
          {department.code_departement}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-xl">{department.departement}</h3>
          <p className="text-sm text-muted-foreground">{department.region}</p>
        </div>
      </div>

      <h4 className="text-base font-semibold mb-4" style={{ color: '#3B82F6' }}>Chiffres clés</h4>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        
        {/* Part 65+ */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-foreground">Part 65+</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-foreground">{part65Plus.toFixed(1)}%</p>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">de la population</p>
          <ComparisonBadge value={part65Plus} avg={avgPart65} unit="%" />
          <RankBadge rank={rankPart65.rank} total={rankPart65.total} />
        </div>

        {/* Taux de pauvreté 65+ */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-foreground">Pauvreté 65+</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-foreground">{tauxPauvrete65.toFixed(1)}%</p>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">vivent sous le seuil de pauvreté</p>
          <ComparisonBadge value={tauxPauvrete65} avg={avgPauvrete65} unit="%" invert />
          <RankBadge rank={rankPauvrete.rank} total={rankPauvrete.total} />
        </div>

        {/* Niveau de vie */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Euro className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-foreground">Niveau de vie</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-foreground">{niveauVieMensuel.toLocaleString('fr-FR')} €</p>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">médian / mois</p>
          <ComparisonBadge value={niveauVieMensuel} avg={avgNiveauVieMensuel} unit="€" />
          <RankBadge rank={rankNiveauVie.rank} total={rankNiveauVie.total} />
        </div>

        {/* Espérance de vie */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-foreground">Espérance de vie</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-foreground">
            {esperanceVie ? `${esperanceVie.toFixed(1)} ans` : 'N/A'}
          </p>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">âge moyen au décès</p>
          {esperanceVie > 0 && <ComparisonBadge value={esperanceVie} avg={avgEsperanceVie} unit="ans" />}
          {esperanceVie > 0 && <RankBadge rank={rankEsperance.rank} total={rankEsperance.total} />}
        </div>

        {/* Pathologie principale */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary/90">Diagnostic n°1</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] text-xs">
                  <p>Source : <strong>Ameli (CNAM) – 2023</strong>. Prévalence chez les ≥ 65 ans.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
