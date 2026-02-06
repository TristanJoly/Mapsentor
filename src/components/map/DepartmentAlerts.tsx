import { AlertTriangle, AlertCircle, Info, TrendingUp, Users } from "lucide-react";
import { DepartmentData } from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DepartmentAlertsProps {
  department: DepartmentData | undefined;
  allData: DepartmentData[];
}

interface AlertInfo {
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  icon: typeof AlertTriangle;
}

export const DepartmentAlerts = ({ department, allData }: DepartmentAlertsProps) => {
  if (!department) return null;

  const alerts: AlertInfo[] = [];

  // Calculate averages for comparison
  const avgPauvrete = allData.reduce((sum, d) => sum + d.taux_pauvrete_75, 0) / allData.length;
  const avgIsoles = allData.reduce((sum, d) => sum + d.isoles_75_plus, 0) / allData.length;
  const avgPart75 = allData.reduce((sum, d) => sum + d.part_75_plus, 0) / allData.length;

  // Critical: Taux de pauvreté très élevé (> 25%)
  if (department.taux_pauvrete_75 > 25) {
    alerts.push({
      type: "critical",
      title: "Taux de pauvreté critique",
      message: `${department.taux_pauvrete_75.toFixed(1)}% des 75+ vivent sous le seuil de pauvreté (moyenne nationale: ${avgPauvrete.toFixed(1)}%)`,
      icon: AlertTriangle,
    });
  } else if (department.taux_pauvrete_75 > avgPauvrete * 1.3) {
    alerts.push({
      type: "warning",
      title: "Taux de pauvreté élevé",
      message: `${department.taux_pauvrete_75.toFixed(1)}% supérieur à la moyenne de ${avgPauvrete.toFixed(1)}%`,
      icon: AlertCircle,
    });
  }

  // Warning: Beaucoup de personnes isolées
  if (department.isoles_75_plus > avgIsoles * 1.5) {
    alerts.push({
      type: "warning",
      title: "Isolement préoccupant",
      message: `${department.isoles_75_plus.toLocaleString('fr-FR')} personnes de 75+ sont isolées dans ce département`,
      icon: Users,
    });
  }

  // Info: Population vieillissante
  if (department.part_75_plus > avgPart75 * 1.2) {
    alerts.push({
      type: "info",
      title: "Département vieillissant",
      message: `${department.part_75_plus.toFixed(1)}% de 75+ (moyenne: ${avgPart75.toFixed(1)}%)`,
      icon: TrendingUp,
    });
  }

  // Info: Bon accès aux soins
  if (department.access_med_generalistes > 2000) {
    alerts.push({
      type: "info",
      title: "Bon accès aux médecins",
      message: `Accessibilité aux généralistes supérieure à la moyenne`,
      icon: Info,
    });
  }

  // Warning: Faible accès aux soins
  if (department.access_med_generalistes < 1000 && department.access_med_generalistes > 0) {
    alerts.push({
      type: "warning",
      title: "Accès aux soins limité",
      message: `Accessibilité aux médecins généralistes inférieure à la moyenne`,
      icon: AlertCircle,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "info",
      title: "Situation équilibrée",
      message: "Les indicateurs de ce département sont proches des moyennes nationales",
      icon: Info,
    });
  }

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "critical": return "destructive";
      default: return "default";
    }
  };

  const getAlertClasses = (type: string) => {
    switch (type) {
      case "critical": return "border-red-500/50 bg-red-50 dark:bg-red-950/20";
      case "warning": return "border-orange-500/50 bg-orange-50 dark:bg-orange-950/20";
      case "info": return "border-blue-500/50 bg-blue-50 dark:bg-blue-950/20";
      default: return "";
    }
  };

  const getIconClasses = (type: string) => {
    switch (type) {
      case "critical": return "text-red-600";
      case "warning": return "text-orange-600";
      case "info": return "text-blue-600";
      default: return "";
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        Alertes et observations
      </h3>
      <div className="space-y-2">
        {alerts.slice(0, 3).map((alert, i) => (
          <Alert 
            key={i} 
            variant={getAlertVariant(alert.type) as any}
            className={getAlertClasses(alert.type)}
          >
            <alert.icon className={`h-4 w-4 ${getIconClasses(alert.type)}`} />
            <AlertTitle className="text-sm font-medium">{alert.title}</AlertTitle>
            <AlertDescription className="text-xs">
              {alert.message}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  );
};
