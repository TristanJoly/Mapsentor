import { AlertTriangle, Wrench, Info, ExternalLink, Sparkles, Heart, Euro, Users, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { useState } from "react";
import { DepartmentData } from "@/lib/data";
import { getAllDepartmentAlerts, AlertDefinition, getQuintile, getDeptValue } from "@/lib/alertConfig";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DepartmentAlertsProps {
  department: DepartmentData | undefined;
  allData: DepartmentData[];
  selectedMetric?: string;
  enabledCategories: Set<string>;
}

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; colorClass: string; bgClass: string; borderClass: string }> = {
  sanitaire: { label: "Sanitaire", icon: <Heart className="w-3.5 h-3.5" />, colorClass: "text-rose-600", bgClass: "bg-rose-50 dark:bg-rose-950/20", borderClass: "border-rose-500/50" },
  economique: { label: "Économique", icon: <Euro className="w-3.5 h-3.5" />, colorClass: "text-amber-600", bgClass: "bg-amber-50 dark:bg-amber-950/20", borderClass: "border-amber-500/50" },
  social: { label: "Social", icon: <Users className="w-3.5 h-3.5" />, colorClass: "text-orange-600", bgClass: "bg-orange-50 dark:bg-orange-950/20", borderClass: "border-orange-500/50" },
};

const formatCondition = (condition: { column: keyof DepartmentData | string; direction: "low" | "high"; label: string }, allData: DepartmentData[], department: DepartmentData) => {
  const colName = String(condition.column);
  const value = getDeptValue(department, colName);
  const q1 = getQuintile(allData, colName, 0.20);
  const q5 = getQuintile(allData, colName, 0.80);
  const dir = condition.direction === "high" ? "supérieur" : "inférieur";
  const seuil = condition.direction === "high" ? q5 : q1;
  const quintileLabel = condition.direction === "high" ? "Q5 (80%)" : "Q1 (20%)";
  return `${condition.label} = ${value.toFixed(1)} (${dir} au ${quintileLabel} = ${seuil.toFixed(1)})`;
};

const AlertCard = ({ alert, allData, department }: { alert: AlertDefinition; allData: DepartmentData[]; department: DepartmentData }) => {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[alert.category];

  return (
    <div className={`rounded-xl border ${meta.borderClass} ${meta.bgClass} overflow-hidden`}>
      <div className="flex items-start">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 text-left p-3 flex items-start gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
        >
          <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${meta.colorClass}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-foreground shrink-0" />
              <span className="text-xs font-medium text-foreground">Action : {alert.action}</span>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
        </button>
        <Popover>
          <PopoverTrigger asChild>
            <button className="shrink-0 p-2 mt-1 mr-1 rounded-full hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30">
              <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="left" align="start" className="max-w-[320px] w-[90vw] sm:w-[320px] p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">{alert.label}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{alert.explanation}</p>
            <div className="pt-2 border-t border-border">
              <p className="text-[11px] font-medium text-primary mb-1">📖 Comment lire cette alerte ?</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                L'alerte se déclenche quand toutes les conditions ci-dessous sont réunies. « Bas » = 1er quintile (20% les plus bas), « Haut » = dernier quintile (20% les plus hauts).
              </p>
              <ul className="text-xs space-y-1 list-disc pl-3">
                {alert.conditions.map((cond, j) => (
                  <li key={j} className="text-muted-foreground">
                    {formatCondition(cond, allData, department)}
                  </li>
                ))}
              </ul>
            </div>
            {alert.source && (
              <div className="pt-2 border-t border-border">
                <p className="text-[11px] font-medium text-muted-foreground/70">📂 Source : {alert.source}</p>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

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
  );
};

export const DepartmentAlerts = ({ department, allData, enabledCategories }: DepartmentAlertsProps) => {
  if (!department) return null;

  const alerts = getAllDepartmentAlerts(department, allData, enabledCategories);
  const alertCount = alerts.length;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        {alertCount} alerte{alertCount !== 1 ? 's' : ''} détectée{alertCount !== 1 ? 's' : ''}
        <span className="text-[10px] font-normal text-muted-foreground">(seuil : quintiles Q1/Q5)</span>
      </h3>
      
      {alerts.length === 0 ? (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-500/50">
          <p className="text-sm text-green-700 dark:text-green-400">
            ✓ Aucune alerte critique pour ce département
          </p>
          <p className="text-xs text-green-600/70 dark:text-green-500/70 mt-1">
            {enabledCategories.size < 3
              ? "Essayez d'activer toutes les catégories pour voir l'ensemble des alertes."
              : "Le département ne se situe dans aucun premier ou dernier quintile pour les combinaisons d'indicateurs surveillées."}
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
