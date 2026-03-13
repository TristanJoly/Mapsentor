import { useState, useMemo } from "react";
import { DepartmentData, getAverage, formatValue, metrics } from "@/lib/data";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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

// Colonnes du tableau selon la métrique sélectionnée
const getColumnsForMetric = (metricId: string) => {
  const baseColumns = [
    { key: "departement", label: "Département" },
    { key: "population", label: "Population", format: (v: number) => v.toLocaleString('fr-FR') },
    { key: "part_60_plus", label: "Part 60+", format: (v: number) => `${v.toFixed(1)}%` },
    { key: "part_75_plus", label: "Part 75+", format: (v: number) => `${v.toFixed(1)}%` },
  ];

  const metricColumns: { [key: string]: any[] } = {
    "taux_pauvrete_75": [
      { key: "taux_pauvrete_75", label: "Taux pauvreté 75+", format: (v: number) => `${v.toFixed(1)}%` },
      { key: "niveau_vie_median", label: "Niveau vie médian", format: (v: number) => `${v.toLocaleString('fr-FR')} €` },
      { key: "revenu_median_75_plus", label: "Revenu 75+", format: (v: number) => `${v.toLocaleString('fr-FR')} €` },
      { key: "aspa_effectif_2024", label: "ASPA 2024", format: (v: number) => v.toLocaleString('fr-FR') },
    ],
    "isoles_75_plus": [
      { key: "isoles_75_plus", label: "Isolés 75+", format: (v: number) => v.toLocaleString('fr-FR') },
      { key: "isoles_60_74", label: "Isolés 60-74", format: (v: number) => v.toLocaleString('fr-FR') },
      { key: "femmes_75_plus_isolees", label: "Femmes 75+ isolées", format: (v: number) => v.toLocaleString('fr-FR') },
      { key: "sans_voiture_75_plus", label: "Sans voiture 75+", format: (v: number) => v.toLocaleString('fr-FR') },
    ],
    "taux_ehpad_75_plus": [
      { key: "taux_ehpad_75_plus", label: "Taux EHPAD", format: (v: number) => `${v.toFixed(2)}%` },
      { key: "ehpad_nb_etab", label: "Nb EHPAD", format: (v: number) => v.toLocaleString('fr-FR') },
      { key: "ehpad_nb_lits", label: "Nb lits EHPAD", format: (v: number) => v.toLocaleString('fr-FR') },
      { key: "aide_menagere_personnes_agees", label: "Aides ménagères", format: (v: number) => v.toLocaleString('fr-FR') },
    ],
    "access_med_generalistes": [
      { key: "access_med_generalistes", label: "Accès médecins", format: (v: number) => v.toFixed(1) },
      { key: "esperance_vie", label: "Espérance vie", format: (v: number) => `${v.toFixed(1)} ans` },
      { key: "grippe_65_plus", label: "Vacc. Grippe 65+", format: (v: number) => `${v.toFixed(1)}%` },
      { key: "covid_65_plus", label: "Vacc. Covid 65+", format: (v: number) => `${v.toFixed(1)}%` },
    ],
    "esperance_vie": [
      { key: "esperance_vie", label: "Espérance vie", format: (v: number) => `${v.toFixed(1)} ans` },
      { key: "mal_chro_oui", label: "Maladies chroniques", format: (v: number) => `${v.toFixed(1)}%` },
      { key: "handicap_oui", label: "Handicap", format: (v: number) => `${v.toFixed(1)}%` },
      { key: "etat_sante_mauvais", label: "Mauvais état santé", format: (v: number) => `${v.toFixed(1)}%` },
    ],
  };

  return [...baseColumns, ...(metricColumns[metricId] || metricColumns["taux_pauvrete_75"])];
};

// Graphiques disponibles pour la comparaison
const availableCharts = [
  { id: "radar_social", label: "Profil social 60-74 ans" },
  { id: "radar_sante", label: "Radar santé" },
  { id: "vaccination", label: "Taux de vaccination" },
  { id: "revenus", label: "Revenus médians" },
  { id: "isolement", label: "Isolement social" },
  { id: "livia", label: "Projections LIVIA" },
  { id: "aspa", label: "Évolution ASPA" },
  { id: "services", label: "Offre médico-sociale" },
];

export const DepartmentComparison = ({ allData, selectedMetric }: DepartmentComparisonProps) => {
  const [selectedDepts, setSelectedDepts] = useState<(string | null)[]>([null, null, null, null]);
  const [selectedCharts, setSelectedCharts] = useState<string[]>(["radar_social", "vaccination"]);

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

  // Départements effectivement sélectionnés (non null)
  const activeSelection = useMemo(() => 
    selectedDepts.filter(d => d !== null) as string[]
  , [selectedDepts]);

  const selectedDepartments = useMemo(() => 
    activeSelection.map(code => allData.find(d => d.code_departement === code)).filter(Boolean) as DepartmentData[]
  , [activeSelection, allData]);

  const columns = useMemo(() => getColumnsForMetric(selectedMetric), [selectedMetric]);

  // Calcul des tendances (comparaison à la moyenne)
  const getTrend = (value: number, key: string) => {
    const avg = getAverage(allData, key as keyof DepartmentData);
    if (avg === 0) return null;
    const diff = ((value - avg) / avg) * 100;
    if (Math.abs(diff) < 5) return { icon: Minus, color: "text-muted-foreground", label: "~moy" };
    if (diff > 0) return { icon: TrendingUp, color: "text-orange-600", label: `+${diff.toFixed(0)}%` };
    return { icon: TrendingDown, color: "text-primary", label: `${diff.toFixed(0)}%` };
  };

  const currentMetric = metrics.find(m => m.id === selectedMetric);

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
            Tableau comparatif – {currentMetric?.label || selectedMetric}
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(col => (
                  <TableHead key={col.key} className="text-xs font-medium">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedDepartments.map((dept) => (
                <TableRow key={dept.code_departement}>
                  {columns.map(col => {
                    const value = dept[col.key as keyof DepartmentData];
                    const displayValue = col.format && typeof value === 'number' 
                      ? col.format(value) 
                      : String(value);
                    const trend = typeof value === 'number' && col.key !== 'departement' && col.key !== 'population'
                      ? getTrend(value, col.key)
                      : null;

                    return (
                      <TableCell key={col.key} className="text-sm">
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
                {columns.slice(1).map(col => {
                  const avg = getAverage(allData, col.key as keyof DepartmentData);
                  const displayValue = col.format ? col.format(avg) : avg.toFixed(1);
                  return (
                    <TableCell key={col.key} className="text-sm text-muted-foreground">
                      {displayValue}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {/* Sélection des graphiques (uniquement si 2 départements) */}
      {activeSelection.length === 2 && (
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
            department1={selectedDepartments[0]}
            department2={selectedDepartments[1]}
            allData={allData}
            selectedCharts={selectedCharts}
          />
        </>
      )}

      {/* Message si plus de 2 départements */}
      {activeSelection.length > 2 && (
        <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
          <p className="text-sm text-muted-foreground">
            💡 Pour afficher les graphiques comparatifs, sélectionnez exactement 2 départements
          </p>
        </div>
      )}
    </div>
  );
};
