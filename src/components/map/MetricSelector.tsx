import { Users, Euro, Heart } from "lucide-react";
import { metrics } from "@/lib/data";

interface MetricSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MetricSelector = ({ value, onChange }: MetricSelectorProps) => {
  const metricButtons = metrics.map(metric => {
    let icon;
    let colorClass;
    
    if (metric.id === "isoles_60_74") {
      icon = <Users className="w-4 h-4" />;
      colorClass = "text-orange-500";
    } else if (metric.id === "taux_pauvrete_75") {
      icon = <Euro className="w-4 h-4" />;
      colorClass = "text-amber-600";
    } else {
      icon = <Heart className="w-4 h-4" />;
      colorClass = "text-rose-500";
    }

    const isActive = value === metric.id;

    return (
      <button
        key={metric.id}
        onClick={() => onChange(metric.id)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
          isActive 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className={isActive ? "text-primary-foreground" : colorClass}>{icon}</span>
        <span className="hidden sm:inline">{metric.label}</span>
      </button>
    );
  });

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {metricButtons}
    </div>
  );
};