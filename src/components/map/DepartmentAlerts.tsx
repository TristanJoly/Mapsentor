import { AlertTriangle, Wrench, Info } from "lucide-react";
import { DepartmentData } from "@/lib/data";
import { getAllDepartmentAlerts, AlertDefinition, getQuantile } from "@/lib/alertConfig";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DepartmentAlertsProps {
  department: DepartmentData | undefined;
  allData: DepartmentData[];
  selectedMetric?: string;
}

const formatCondition = (condition: { column: keyof DepartmentData | string; direction: "low" | "high" }, allData: DepartmentData[], department: DepartmentData) => {
  const colName = String(condition.column);
  const value = parseFloat(String(department[colName as keyof DepartmentData])) || 0;
  const q25 = getQuantile(allData, colName, 0.25);
  const q75 = getQuantile(allData, colName, 0.75);
  const dir = condition.direction === "high" ? "supérieur" : "inférieur";
  const seuil = condition.direction === "high" ? q75 : q25;
  const quantileLabel = condition.direction === "high" ? "Q75" : "Q25";
  return `${colName} = ${value.toFixed(1)} (${dir} au ${quantileLabel} = ${seuil.toFixed(1)})`;
};

export const DepartmentAlerts = ({ department, allData }: DepartmentAlertsProps) => {
  if (!department) return null;

  const alerts = getAllDepartmentAlerts(department, allData);
  const alertCount = alerts.length;

  const getAlertClasses = (index: number) => {
    if (index === 0) return "border-red-500/50 bg-red-50 dark:bg-red-950/20";
    if (index === 1) return "border-orange-500/50 bg-orange-50 dark:bg-orange-950/20";
    return "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20";
  };

  const getIconClasses = (index: number) => {
    if (index === 0) return "text-red-600";
    if (index === 1) return "text-orange-600";
    return "text-amber-600";
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        {alertCount} alerte{alertCount !== 1 ? 's' : ''} détectée{alertCount !== 1 ? 's' : ''}
      </h3>
      
      {alerts.length === 0 ? (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-500/50">
          <p className="text-sm text-green-700 dark:text-green-400">
            ✓ Aucune alerte critique pour ce département
          </p>
        </div>
      ) : (
        <TooltipProvider delayDuration={200}>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {alerts.map((alert, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div>
                    <Alert className={`${getAlertClasses(i)} cursor-help`}>
                      <AlertTriangle className={`h-4 w-4 ${getIconClasses(i)}`} />
                      <AlertTitle className="text-sm font-medium flex items-center gap-2">
                        ⚠️ {alert.label}
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </AlertTitle>
                      <AlertDescription className="text-xs space-y-2 mt-2">
                        <p className="text-muted-foreground">{alert.explanation}</p>
                        <div className="flex items-start gap-1 pt-1 border-t border-border/50">
                          <Wrench className="w-3 h-3 mt-0.5 text-primary" />
                          <span className="text-primary font-medium">Levier d'action : {alert.action}</span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs p-3 space-y-1.5">
                  <p className="font-semibold text-xs">Méthode de calcul :</p>
                  <p className="text-xs text-muted-foreground">
                    L'alerte se déclenche quand toutes ces conditions sont réunies (basées sur les quartiles Q25/Q75 nationaux) :
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
            ))}
          </div>
        </TooltipProvider>
      )}
    </div>
  );
};
