import { AlertTriangle, Wrench, Info, ExternalLink, Sparkles, Heart, Euro, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { DepartmentData } from "@/lib/data";
import { getAllDepartmentAlerts, AlertDefinition, getDecile, getDeptValue } from "@/lib/alertConfig";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DepartmentAlertsProps {
  department: DepartmentData | undefined;
  allData: DepartmentData[];
  selectedMetric?: string;
}

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; colorClass: string; bgClass: string; borderClass: string }> = {
  sanitaire: { label: "Sanitaire", icon: <Heart className="w-3.5 h-3.5" />, colorClass: "text-rose-600", bgClass: "bg-rose-50 dark:bg-rose-950/20", borderClass: "border-rose-500/50" },
  economique: { label: "Économique", icon: <Euro className="w-3.5 h-3.5" />, colorClass: "text-amber-600", bgClass: "bg-amber-50 dark:bg-amber-950/20", borderClass: "border-amber-500/50" },
  social: { label: "Social", icon: <Users className="w-3.5 h-3.5" />, colorClass: "text-orange-600", bgClass: "bg-orange-50 dark:bg-orange-950/20", borderClass: "border-orange-500/50" },
};

const formatCondition = (condition: { column: keyof DepartmentData | string; direction: "low" | "high"; label: string }, allData: DepartmentData[], department: DepartmentData) => {
  const colName = String(condition.column);
  const value = getDeptValue(department, colName);
  const d1 = getDecile(allData, colName, 0.10);
  const d10 = getDecile(allData, colName, 0.90);
  const dir = condition.direction === "high" ? "supérieur" : "inférieur";
  const seuil = condition.direction === "high" ? d10 : d1;
  const decileLabel = condition.direction === "high" ? "D10 (90%)" : "D1 (10%)";
  return `${condition.label} = ${value.toFixed(1)} (${dir} au ${decileLabel} = ${seuil.toFixed(1)})`;
};

const AlertCard = ({ alert, allData, department }: { alert: AlertDefinition; allData: DepartmentData[]; department: DepartmentData }) => {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[alert.category];

  return (
    <TooltipProvider delayDuration={200}>
      <div className={`rounded-xl border ${meta.borderClass} ${meta.bgClass} overflow-hidden`}>
        {/* Header */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full text-left p-3 flex items-start gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${meta.colorClass}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${meta.bgClass} ${meta.colorClass} border ${meta.borderClass}`}>
                    {meta.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{alert.label}</span>
                  <Info className="w-3 h-3 text-muted-foreground shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{alert.explanation}</p>
              </div>
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs p-3 space-y-1.5">
            <p className="font-semibold text-xs">Méthode de calcul (Déciles) :</p>
            <p className="text-xs text-muted-foreground">
              L'alerte se déclenche quand toutes ces conditions sont réunies. « Bas » = 1er décile (10% les plus bas), « Haut » = dernier décile (10% les plus hauts) :
            </p>
            <ul className="text-xs space-y-1 list-disc pl-3">
              {alert.conditions.map((cond, j) => (
                <li key={j} className="text-muted-foreground">
                  {formatCondition(cond, allData, department)}
                </li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>

        {/* Expanded: Levers */}
        {expanded && (
          <div className="px-3 pb-3 space-y-2 border-t border-border/30 pt-2">
            {alert.levers.map((lever, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-card/60">
                <Wrench className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">Levier {i + 1} :</span>
                    <span className="text-xs font-medium text-primary">{lever.title}</span>
                    {lever.isNew && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        <Sparkles className="w-2.5 h-2.5" />
                        Nouveau
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{lever.detail}</p>
                  {lever.url && (
                    <a
                      href={lever.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1"
                    >
                      En savoir plus <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export const DepartmentAlerts = ({ department, allData }: DepartmentAlertsProps) => {
  if (!department) return null;

  const alerts = getAllDepartmentAlerts(department, allData);
  const alertCount = alerts.length;

  // Group by category
  const grouped: Record<string, AlertDefinition[]> = {};
  alerts.forEach(a => {
    if (!grouped[a.category]) grouped[a.category] = [];
    grouped[a.category].push(a);
  });

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        {alertCount} alerte{alertCount !== 1 ? 's' : ''} détectée{alertCount !== 1 ? 's' : ''}
        <span className="text-[10px] font-normal text-muted-foreground">(seuil : déciles D1/D10)</span>
      </h3>
      
      {alerts.length === 0 ? (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-500/50">
          <p className="text-sm text-green-700 dark:text-green-400">
            ✓ Aucune alerte critique pour ce département
          </p>
          <p className="text-xs text-green-600/70 dark:text-green-500/70 mt-1">
            Le département ne se situe dans aucun premier ou dernier décile pour les combinaisons d'indicateurs surveillées.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} allData={allData} department={department} />
          ))}
        </div>
      )}
    </div>
  );
};
