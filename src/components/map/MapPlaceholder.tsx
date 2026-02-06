import { Map, MousePointer } from "lucide-react";

interface MapPlaceholderProps {
  selectedDepartment: string;
  selectedMetric: string;
}

export const MapPlaceholder = ({ selectedDepartment, selectedMetric }: MapPlaceholderProps) => {
  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl bg-card border border-border overflow-hidden shadow-card">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* France Map SVG Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Simple France outline */}
          <svg viewBox="0 0 300 300" className="w-80 h-80 text-primary/20">
            <path
              d="M150,20 L180,40 L220,35 L250,60 L260,100 L280,140 L270,180 L250,220 L220,250 L180,270 L150,280 L120,270 L80,250 L50,220 L30,180 L20,140 L30,100 L50,60 L80,35 L120,40 Z"
              fill="currentColor"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              className="opacity-30"
            />
            {/* Gradient overlay */}
            <defs>
              <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(221, 83%, 53%)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(262, 83%, 58%)" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M150,20 L180,40 L220,35 L250,60 L260,100 L280,140 L270,180 L250,220 L220,250 L180,270 L150,280 L120,270 L80,250 L50,220 L30,180 L20,140 L30,100 L50,60 L80,35 L120,40 Z"
              fill="url(#mapGradient)"
            />
          </svg>

          {/* Center icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-elevated animate-pulse">
              <Map className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full flex items-center gap-2 shadow-soft">
        <MousePointer className="w-4 h-4 text-primary" />
        <span className="text-sm text-muted-foreground">
          Cliquez sur un département pour voir ses informations
        </span>
      </div>

      {/* Info Badge */}
      <div className="absolute top-4 right-4 glass px-3 py-2 rounded-xl shadow-soft">
        <p className="text-xs text-muted-foreground mb-1">Métrique sélectionnée</p>
        <p className="text-sm font-medium text-foreground">{selectedMetric.replace(/_/g, ' ')}</p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 glass p-3 rounded-xl shadow-soft">
        <p className="text-xs font-medium text-foreground mb-2">Légende</p>
        <div className="flex items-center gap-1">
          <div className="h-3 w-6 rounded-sm bg-primary/20"></div>
          <div className="h-3 w-6 rounded-sm bg-primary/40"></div>
          <div className="h-3 w-6 rounded-sm bg-primary/60"></div>
          <div className="h-3 w-6 rounded-sm bg-primary/80"></div>
          <div className="h-3 w-6 rounded-sm bg-primary"></div>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Faible</span>
          <span>Élevé</span>
        </div>
      </div>
    </div>
  );
};
