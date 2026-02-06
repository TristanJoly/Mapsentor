import { useState, useEffect, useMemo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { DepartmentData, getMetricRange } from "@/lib/data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const GEO_URL = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson";

interface FranceMapProps {
  data: DepartmentData[];
  selectedMetric: string;
  selectedDepartment: string;
  onDepartmentClick: (code: string) => void;
}

export const FranceMap = ({ data, selectedMetric, selectedDepartment, onDepartmentClick }: FranceMapProps) => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [position, setPosition] = useState({ coordinates: [2.5, 46.5] as [number, number], zoom: 1 });

  const colorScale = useMemo(() => {
    const [min, max] = getMetricRange(data, selectedMetric);
    return scaleLinear<string>()
      .domain([min, (min + max) / 2, max])
      .range(["hsl(220, 70%, 95%)", "hsl(221, 83%, 65%)", "hsl(262, 83%, 45%)"]);
  }, [data, selectedMetric]);

  const getDataForCode = (code: string): DepartmentData | undefined => {
    const normalizedCode = code.padStart(2, '0');
    return data.find(d => d.code_departement === normalizedCode || d.code_departement === code);
  };

  const getFillColor = (code: string): string => {
    const deptData = getDataForCode(code);
    if (!deptData) return "hsl(var(--muted))";
    const value = deptData[selectedMetric] as number;
    if (isNaN(value) || value === 0) return "hsl(var(--muted))";
    return colorScale(value);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl bg-card border border-border overflow-hidden shadow-card">
      <TooltipProvider>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [2.5, 46.5],
            scale: 2800,
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            onMoveEnd={({ coordinates, zoom }) => setPosition({ coordinates: coordinates as [number, number], zoom })}
            minZoom={1}
            maxZoom={8}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const code = geo.properties.code;
                  const isSelected = code === selectedDepartment || code.padStart(2, '0') === selectedDepartment;
                  const deptData = getDataForCode(code);
                  
                  return (
                    <Tooltip key={geo.rsmKey}>
                      <TooltipTrigger asChild>
                        <Geography
                          geography={geo}
                          fill={getFillColor(code)}
                          stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}
                          strokeWidth={isSelected ? 2 : 0.5}
                          style={{
                            default: {
                              outline: "none",
                              transition: "all 0.2s",
                            },
                            hover: {
                              fill: "hsl(221, 83%, 53%)",
                              stroke: "hsl(var(--primary))",
                              strokeWidth: 1.5,
                              outline: "none",
                              cursor: "pointer",
                            },
                            pressed: {
                              fill: "hsl(262, 83%, 58%)",
                              outline: "none",
                            },
                          }}
                          onClick={() => onDepartmentClick(code.padStart(2, '0'))}
                          onMouseEnter={() => {
                            setTooltipContent(deptData ? `${deptData.departement} (${code})` : geo.properties.nom);
                          }}
                          onMouseLeave={() => setTooltipContent("")}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-card border border-border shadow-elevated z-50">
                        <p className="font-medium">{deptData?.departement || geo.properties.nom}</p>
                        {deptData && (
                          <p className="text-sm text-muted-foreground">
                            Code: {code}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </TooltipProvider>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        <button
          onClick={() => setPosition(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.5, 8) }))}
          className="w-8 h-8 rounded-lg bg-card border border-border shadow-soft flex items-center justify-center text-foreground hover:bg-muted transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setPosition(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.5, 1) }))}
          className="w-8 h-8 rounded-lg bg-card border border-border shadow-soft flex items-center justify-center text-foreground hover:bg-muted transition-colors"
        >
          −
        </button>
        <button
          onClick={() => setPosition({ coordinates: [2.5, 46.5], zoom: 1 })}
          className="w-8 h-8 rounded-lg bg-card border border-border shadow-soft flex items-center justify-center text-xs text-muted-foreground hover:bg-muted transition-colors"
        >
          ⌂
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 glass p-3 rounded-xl shadow-soft">
        <p className="text-xs font-medium text-foreground mb-2">Intensité</p>
        <div className="flex items-center gap-0.5">
          <div className="h-3 w-6 rounded-l-sm" style={{ background: "hsl(220, 70%, 95%)" }}></div>
          <div className="h-3 w-6" style={{ background: "hsl(221, 83%, 75%)" }}></div>
          <div className="h-3 w-6" style={{ background: "hsl(221, 83%, 65%)" }}></div>
          <div className="h-3 w-6" style={{ background: "hsl(242, 83%, 55%)" }}></div>
          <div className="h-3 w-6 rounded-r-sm" style={{ background: "hsl(262, 83%, 45%)" }}></div>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Faible</span>
          <span>Élevé</span>
        </div>
      </div>
    </div>
  );
};
