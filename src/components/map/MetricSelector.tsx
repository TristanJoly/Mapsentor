import { ChevronDown, TrendingUp } from "lucide-react";
import { metrics } from "@/lib/data";

interface MetricSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MetricSelector = ({ value, onChange }: MetricSelectorProps) => {
  const selectedMetric = metrics.find(m => m.id === value) || metrics[0];

  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Métrique</h3>
          <p className="text-xs text-muted-foreground">Indicateur à visualiser</p>
        </div>
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="select-modern appearance-none cursor-pointer pr-10"
        >
          {metrics.map((metric) => (
            <option key={metric.id} value={metric.id}>
              {metric.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{selectedMetric.description}</p>
    </div>
  );
};
