import { useState, useMemo } from "react";
import { DepartmentData, getAverage, metrics } from "@/lib/data";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ComparisonCharts } from "./ComparisonCharts";
import { ArrowUpDown, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DepartmentComparisonProps {
  allData: DepartmentData[];
  selectedMetric: string;
}

// Colonnes fixes du tableau comparatif
const comparisonColumns = [
  { key: "departement", label: "Département" },
  { key: "part_60_plus", label: "Part de 60 ans et plus", format: (v: number) => `${v.toFixed(1)}%` },
  { key: "taux_pauvrete_75", label: "Taux de pauvreté 65+", format: (v: number) => `${v.toFixed(1)}%` },
  
  
  { key: "isoles_60_74", label: "60-75 isolés", format: (v: number) => v.toLocaleString('fr-FR') },
  { key: "esperance_vie", label: "Espérance de vie à la naissance", format: (v: number) => `${v.toFixed(1)} ans` },
  { key: "taux_neurologiques_65_plus", label: "Taux de maladies neurologiques (65+)", format: (v: number) => `${v.toFixed(1)}%` },
  { key: "taux_cardiovasculaires_65_plus", label: "Taux de maladies cardiovasculaires (65+)", format: (v: number) => `${v.toFixed(1)}%` },
  { key: "access_med_generalistes", label: "APL aux médecins généralistes", format: (v: number) => `${v.toFixed(1)} C./an/hab.` },
  { key: "apa_75_plus", label: "Bénéficiaires APA 65+", format: (v: number) => v.toLocaleString('fr-FR') },
  { key: "apa_60_plus", label: "Bénéficiaires APA 60+", format: (v: number) => v.toLocaleString('fr-FR') },
  { key: "taux_ssiad_75_plus", label: "Services de Soins Infirmiers à Domicile (65+)", format: (v: number) => `${v.toFixed(2)}%` },
  { key: "atmo_indice_moyen", label: "Pollution atmosphérique", format: (v: number) => v.toFixed(1) },
  { key: "score_fragilite_numerique", label: "Score de fragilité numérique senior", format: (v: number) => v.toFixed(1) },
];

// Graphiques disponibles pour la comparaison
const availableCharts = [
  { id: "top5_pathologies", label: "Top 5 pathologies chez 65+" },
  { id: "radar_sante", label: "Zoom sur l'état de santé des 65+" },
  { id: "deficit_ehpad", label: "Déficit de l'offre en lits d'EHPAD pour les 65+" },
  { id: "isolement", label: "Isolement social (65+)" },
  { id: "fragilite_numerique", label: "Fragilité numérique" },
  { id: "revenus", label: "Revenu médian (€/mois)" },
  { id: "aspa", label: "Évolution bénéficiaires ASPA" },
  { id: "apl_sapa", label: "APL service d'aide (SAPA)" },
];

export const DepartmentComparison = ({ allData, selectedMetric }: DepartmentComparisonProps) => {
  const [selectedDepts, setSelectedDepts] = useState<(string | null)[]>([null, null, null, null]);
  const [selectedCharts, setSelectedCharts] = useState<string[]>(["top5_pathologies", "radar_sante"]);

  const handleDeptChange = (index: number, value: string) => {
    const newDepts = [...selectedDepts];
    newDepts[index] = value === "none" ? null : value;
    setSelectedDepts(newDepts);
  };

  const toggleChart = (chartId: string) => {
    setSelectedCharts(prev => 
      prev.includes(chartId) 
        ? prev.filter(id => id !== chartId)
        : [...prev, chartId]
    );
  };

  const activeSelection = useMemo(() => 
    selectedDepts.filter(d => d !== null) as string[]
  , [selectedDepts]);

  const selectedDepartments = useMemo(() => 
    activeSelection.map(code => allData.find(d => d.code_departement === code)).filter(Boolean) as DepartmentData[]
  , [activeSelection, allData]);

  // Calcul des tendances (comparaison à la moyenne)
  const getTrend = (value: number, key: string) => {
    const avg = getAverage(allData, key as keyof DepartmentData);
    if (avg === 0) return null;
    const diff = ((value - avg) / avg) * 100;
    if (Math.abs(diff) < 5) return { icon: Minus, color: "text-muted-foreground", label: "~moy" };
    if (diff > 0) return { icon: TrendingUp, color: "text-orange-600", label: `+${diff.toFixed(0)}%` };
    return { icon: TrendingDown, color: "text-primary", label: `${diff.toFixed(0)}%` };
  };

  return (
    <div className="space-y-6">
      {/* 4 sélecteurs de départements */}
      <div className="p-4 rounded-xl bg-card border border-border shadow-card">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Sélectionner jusqu'à 4 départements à comparer
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Département {index + 1}
              </Label>
              <Select 
                value={selectedDepts[index] || "none"} 
                onValueChange={(value) => handleDeptChange(index, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Aucun —</SelectItem>
                  {allData.map((dept) => (
                    <SelectItem 
                      key={dept.code_departement} 
                      value={dept.code_departement}
                      disabled={activeSelection.includes(dept.code_departement) && selectedDepts[index] !== dept.code_departement}
                    >
                      {dept.code_departement} - {dept.departement}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        
        {activeSelection.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedDepartments.map(dept => (
              <Badge key={dept.code_departement} variant="secondary" className="text-xs">
                {dept.departement}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Message si aucune sélection */}
      {activeSelection.length === 0 && (
        <div className="p-8 rounded-xl bg-muted/50 border border-border text-center">
          <ArrowUpDown className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Sélectionnez au moins 2 départements pour les comparer
          </p>
        </div>
      )}

      {/* Tableau comparatif */}
      {activeSelection.length >= 2 && (
        <div className="p-4 rounded-xl bg-card border border-border shadow-card overflow-x-auto">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" />
            Tableau comparatif
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                {comparisonColumns.map(col => (
                  <TableHead key={col.key} className="text-xs font-medium whitespace-nowrap">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedDepartments.map((dept) => (
                <TableRow key={dept.code_departement}>
                  {comparisonColumns.map(col => {
                    const value = dept[col.key as keyof DepartmentData];
                    const displayValue = col.format && typeof value === 'number' 
                      ? col.format(value) 
                      : String(value);
                    const trend = typeof value === 'number' && col.key !== 'departement'
                      ? getTrend(value, col.key)
                      : null;

                    return (
                      <TableCell key={col.key} className="text-sm whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{displayValue}</span>
                          {trend && (
                            <span className={`text-[10px] ${trend.color}`}>
                              {trend.label}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              {/* Ligne moyenne nationale */}
              <TableRow className="bg-muted/30">
                <TableCell className="text-sm font-medium text-muted-foreground">
                  Moyenne nationale
                </TableCell>
                {comparisonColumns.slice(1).map(col => {
                  const avg = getAverage(allData, col.key as keyof DepartmentData);
                  const displayValue = col.format ? col.format(avg) : avg.toFixed(1);
                  return (
                    <TableCell key={col.key} className="text-sm text-muted-foreground whitespace-nowrap">
                      {displayValue}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {/* Sélection des graphiques (2+ départements) */}
      {activeSelection.length >= 2 && (
        <>
          <div className="p-4 rounded-xl bg-card border border-border shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Graphiques comparatifs à afficher
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableCharts.map(chart => (
                <div key={chart.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={chart.id}
                    checked={selectedCharts.includes(chart.id)}
                    onCheckedChange={() => toggleChart(chart.id)}
                  />
                  <Label htmlFor={chart.id} className="text-xs cursor-pointer">
                    {chart.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Graphiques comparatifs */}
          <ComparisonCharts 
            departments={selectedDepartments}
            allData={allData}
            selectedCharts={selectedCharts}
          />
        </>
      )}
    </div>
  );
};
