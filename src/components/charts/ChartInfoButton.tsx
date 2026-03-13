import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ChartInfoButtonProps {
  title?: string;
  text: string;
  howToRead?: string;
  source?: string;
}

export const ChartInfoButton = ({ title, text, howToRead, source }: ChartInfoButtonProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <button className="ml-auto shrink-0 p-1 rounded-full hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30">
        <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
      </button>
    </PopoverTrigger>
    <PopoverContent side="top" align="end" className="max-w-[320px] w-[90vw] sm:w-[320px] p-4 space-y-3">
      {title && <p className="text-sm font-semibold text-foreground">{title}</p>}
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
      {howToRead && (
        <div className="pt-2 border-t border-border">
          <p className="text-[11px] font-medium text-primary mb-1">📖 Comment lire ce graphique ?</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{howToRead}</p>
        </div>
      )}
      {source && (
        <div className="pt-2 border-t border-border">
          <p className="text-[11px] font-medium text-muted-foreground/70">📂 Source : {source}</p>
        </div>
      )}
    </PopoverContent>
  </Popover>
);
