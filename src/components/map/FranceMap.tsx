import { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { DepartmentData, getMetricRange } from "@/lib/data";
import { getAllDepartmentAlerts, getWarningColor } from "@/lib/alertConfig";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle } from "lucide-react";

const GEO_URL = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson";

// Department centers for marker placement (approximate)
const DEPARTMENT_CENTERS: { [key: string]: [number, number] } = {
  "01": [5.4, 46.1], "02": [3.6, 49.5], "03": [3.2, 46.4], "04": [6.2, 44.1], "05": [6.3, 44.7],
  "06": [7.1, 43.9], "07": [4.5, 44.8], "08": [4.6, 49.6], "09": [1.6, 42.9], "10": [4.1, 48.3],
  "11": [2.4, 43.2], "12": [2.6, 44.3], "13": [5.1, 43.5], "14": [-0.4, 49.1], "15": [2.7, 45.0],
  "16": [0.2, 45.7], "17": [-0.9, 45.8], "18": [2.4, 47.1], "19": [1.8, 45.4], "21": [4.9, 47.4],
  "22": [-2.9, 48.5], "23": [2.1, 46.1], "24": [0.7, 45.1], "25": [6.3, 47.2], "26": [5.1, 44.7],
  "27": [1.0, 49.1], "28": [1.5, 48.3], "29": [-4.1, 48.3], "30": [4.2, 44.0], "31": [1.4, 43.6],
  "32": [0.6, 43.7], "33": [-0.6, 44.8], "34": [3.6, 43.6], "35": [-1.7, 48.1], "36": [1.6, 46.8],
  "37": [0.7, 47.3], "38": [5.6, 45.3], "39": [5.7, 46.7], "40": [-0.8, 43.9], "41": [1.4, 47.6],
  "42": [4.3, 45.7], "43": [3.8, 45.1], "44": [-1.7, 47.3], "45": [2.1, 47.9], "46": [1.6, 44.6],
  "47": [0.5, 44.4], "48": [3.5, 44.5], "49": [-0.6, 47.4], "50": [-1.3, 49.1], "51": [4.2, 49.0],
  "52": [5.2, 48.1], "53": [-0.8, 48.1], "54": [6.2, 48.7], "55": [5.4, 49.0], "56": [-2.8, 47.7],
  "57": [6.6, 49.1], "58": [3.5, 47.1], "59": [3.2, 50.4], "60": [2.5, 49.4], "61": [0.1, 48.6],
  "62": [2.3, 50.5], "63": [3.1, 45.8], "64": [-0.6, 43.3], "65": [0.1, 43.1], "66": [2.5, 42.6],
  "67": [7.5, 48.6], "68": [7.2, 47.9], "69": [4.6, 45.9], "70": [6.1, 47.6], "71": [4.6, 46.6],
  "72": [0.2, 47.9], "73": [6.4, 45.5], "74": [6.4, 46.0], "75": [2.35, 48.86], "76": [1.0, 49.6],
  "77": [2.9, 48.6], "78": [1.9, 48.9], "79": [-0.3, 46.5], "80": [2.3, 49.9], "81": [2.2, 43.8],
  "82": [1.3, 44.1], "83": [6.2, 43.5], "84": [5.2, 44.0], "85": [-1.3, 46.7], "86": [0.5, 46.6],
  "87": [1.3, 45.9], "88": [6.4, 48.2], "89": [3.5, 47.8], "90": [6.9, 47.6], "91": [2.2, 48.5],
  "92": [2.25, 48.85], "93": [2.45, 48.92], "94": [2.45, 48.78], "95": [2.1, 49.1],
  "2A": [8.9, 41.9], "2B": [9.3, 42.4]
};

const IDF_DEPARTMENTS = [
  { code: "75", name: "Paris" },
  { code: "77", name: "Seine-et-Marne" },
  { code: "78", name: "Yvelines" },
  { code: "91", name: "Essonne" },
  { code: "92", name: "Hauts-de-Seine" },
  { code: "93", name: "Seine-Saint-Denis" },
  { code: "94", name: "Val-de-Marne" },
  { code: "95", name: "Val-d'Oise" },
];

interface FranceMapProps {
  data: DepartmentData[];
  selectedMetric: string;
  selectedDepartment: string;
  onDepartmentClick: (code: string) => void;
}

// Folium-style location pin marker component
const FoliumMarker = ({ 
  alertCount, 
  isSelected,
  onClick 
}: { 
  alertCount: number; 
  isSelected: boolean;
  onClick: () => void;
}) => {
  const color = getWarningColor(alertCount);
  const size = isSelected ? 1.2 : 1;
  
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }} transform={`scale(${size})`}>
      {/* Main pin shape - classic Folium style */}
      <g transform="translate(-14, -36)">
        {/* Outer pin shape with gradient effect */}
        <path
          d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z"
          fill={color}
          stroke="#fff"
          strokeWidth="2"
        />
        {/* Inner circle background */}
        <circle cx="14" cy="12" r="8" fill="#fff" opacity="0.95" />
        {/* Alert triangle icon */}
        <g transform="translate(14, 12)">
          <path
            d="M0 -5L4.5 4H-4.5L0 -5z"
            fill={color}
            stroke={color}
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          <line x1="0" y1="-2" x2="0" y2="0.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="0" cy="2" r="0.8" fill="#fff" />
        </g>
      </g>
      {/* Badge with count - positioned at top right */}
      {alertCount > 1 && (
        <g transform="translate(6, -38)">
          <circle r="7" fill="#fff" stroke={color} strokeWidth="1.5" />
          <text
            textAnchor="middle"
            y={4}
            style={{ 
              fontFamily: "system-ui", 
              fill: color, 
              fontSize: 10,
              fontWeight: "bold"
            }}
          >
            {alertCount}
          </text>
        </g>
      )}
    </g>
  );
};

export const FranceMap = ({ data, selectedMetric, selectedDepartment, onDepartmentClick }: FranceMapProps) => {
  
  const [position, setPosition] = useState({ coordinates: [2.5, 46.5] as [number, number], zoom: 1 });

  const metricRange = useMemo(() => getMetricRange(data, selectedMetric), [data, selectedMetric]);

  const colorScale = useMemo(() => {
    const values = data.map(d => d[selectedMetric] as number).filter(v => !isNaN(v) && v > 0).sort((a, b) => a - b);
    if (values.length === 0) {
      return scaleLinear<string>().domain([0, 100]).range(["#EFF6FF", "#1E40AF"]);
    }
    const [min, max] = [values[0], values[values.length - 1]];

    if (selectedMetric === 'mal_chro_oui') {
      // Percentile-based scale for sanitaire only
      const p20 = values[Math.floor(values.length * 0.20)];
      const p40 = values[Math.floor(values.length * 0.40)];
      const p60 = values[Math.floor(values.length * 0.60)];
      const p80 = values[Math.floor(values.length * 0.80)];
      const domain = [min, p20, p40, p60, p80, max].reduce<number[]>((acc, v) => {
        if (acc.length === 0 || v > acc[acc.length - 1]) acc.push(v);
        return acc;
      }, []);
      const colors = ["#EFF6FF", "#DBEAFE", "#93C5FD", "#3B82F6", "#2563EB", "#1E40AF"];
      const selectedColors = domain.length <= 2 
        ? [colors[0], colors[colors.length - 1]]
        : domain.map((_, i) => colors[Math.round(i * (colors.length - 1) / (domain.length - 1))]);
      return scaleLinear<string>().domain(domain).range(selectedColors);
    }

    // Linear scale for social and economic
    return scaleLinear<string>()
      .domain([min, (min + max) / 3, (min + max) * 2/3, max])
      .range(["#EFF6FF", "#93C5FD", "#3B82F6", "#1E40AF"]);
  }, [data, selectedMetric]);

  // Calculate alerts for all departments
  const departmentAlerts = useMemo(() => {
    const alerts: { [key: string]: number } = {};
    data.forEach(dept => {
      const deptAlerts = getAllDepartmentAlerts(dept, data);
      alerts[dept.code_departement] = deptAlerts.length;
    });
    return alerts;
  }, [data]);

  const getDataForCode = (code: string): DepartmentData | undefined => {
    const normalizedCode = code.padStart(2, '0');
    return data.find(d => d.code_departement === normalizedCode || d.code_departement === code);
  };

  const getFillColor = (code: string): string => {
    const deptData = getDataForCode(code);
    if (!deptData) return "#f5f5f5";
    const value = deptData[selectedMetric] as number;
    if (isNaN(value) || value === 0) return "#f5f5f5";
    return colorScale(value);
  };

  return (
    <div className="relative w-full h-full min-h-[350px] md:min-h-[500px] rounded-2xl bg-card border border-border overflow-hidden shadow-card">
      <TooltipProvider>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [2.5, 46.8],
            scale: 1800,
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            onMoveEnd={({ coordinates, zoom }) => setPosition({ coordinates: coordinates as [number, number], zoom })}
            minZoom={0.3}
            maxZoom={16}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const code = geo.properties.code;
                  const isSelected = code === selectedDepartment || code.padStart(2, '0') === selectedDepartment;
                  const deptData = getDataForCode(code);
                  const alertCount = departmentAlerts[code.padStart(2, '0')] || departmentAlerts[code] || 0;
                  
                  return (
                    <Tooltip key={geo.rsmKey}>
                      <TooltipTrigger asChild>
                        <Geography
                          geography={geo}
                          fill={getFillColor(code)}
                          stroke={isSelected ? "#1E40AF" : "#e5e5e5"}
                          strokeWidth={isSelected ? 2 : 0.5}
                          style={{
                            default: {
                              outline: "none",
                              transition: "all 0.2s",
                            },
                            hover: {
                              fill: "#60A5FA",
                              stroke: "#1E40AF",
                              strokeWidth: 1.5,
                              outline: "none",
                              cursor: "pointer",
                            },
                            pressed: {
                              fill: "#1E40AF",
                              outline: "none",
                            },
                          }}
                          onClick={() => onDepartmentClick(code.padStart(2, '0'))}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-card border border-border shadow-elevated z-50">
                        <p className="font-medium">{deptData?.departement || geo.properties.nom}</p>
                        <p className="text-sm text-muted-foreground">Code: {code}</p>
                        {alertCount > 0 && (
                          <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            {alertCount} alerte{alertCount > 1 ? 's' : ''}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })
              }
            </Geographies>

            {/* Folium-style Alert Markers */}
            {data.map(dept => {
              const alertCount = departmentAlerts[dept.code_departement] || 0;
              if (alertCount === 0) return null;
              
              const coords = DEPARTMENT_CENTERS[dept.code_departement];
              if (!coords) return null;

              const isSelected = dept.code_departement === selectedDepartment;

              return (
                <Marker 
                  key={`marker-${dept.code_departement}`} 
                  coordinates={coords}
                >
                  <FoliumMarker 
                    alertCount={alertCount}
                    isSelected={isSelected}
                    onClick={() => onDepartmentClick(dept.code_departement)}
                  />
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </TooltipProvider>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        <button
          onClick={() => setPosition(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.5, 16) }))}
          className="w-8 h-8 rounded-lg bg-card border border-border shadow-soft flex items-center justify-center text-foreground hover:bg-muted transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setPosition(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.5, 0.3) }))}
          className="w-8 h-8 rounded-lg bg-card border border-border shadow-soft flex items-center justify-center text-foreground hover:bg-muted transition-colors"
        >
          −
        </button>
        <button
          onClick={() => setPosition({ coordinates: [2.5, 46.5], zoom: 1 })}
          className="w-8 h-8 rounded-lg bg-card border border-border shadow-soft flex items-center justify-center text-xs text-muted-foreground hover:bg-muted transition-colors"
          title="Vue France"
        >
          ⌂
        </button>
      </div>

      {/* Île-de-France inset map */}
      <div 
        className="absolute top-3 right-3 w-[130px] h-[130px] md:w-[170px] md:h-[170px] rounded-xl bg-card border-2 border-primary/30 shadow-elevated overflow-hidden z-10"
      >
        <p className="absolute top-1.5 left-0 right-0 text-center text-[10px] md:text-xs font-semibold text-foreground z-10 pointer-events-none drop-shadow-sm">Île-de-France</p>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [2.42, 48.78],
            scale: 32000,
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies
                .filter(geo => {
                  const code = geo.properties.code?.padStart(2, '0');
                  return IDF_DEPARTMENTS.some(d => d.code === code);
                })
                .map((geo) => {
                  const code = geo.properties.code?.padStart(2, '0');
                  const isSelected = code === selectedDepartment;
                  const deptData = getDataForCode(code);
                  const alertCount = departmentAlerts[code] || 0;
                  return (
                    <Tooltip key={geo.rsmKey}>
                      <TooltipTrigger asChild>
                        <Geography
                          geography={geo}
                          fill={getFillColor(code)}
                          stroke={isSelected ? "#1E40AF" : "#64748b"}
                          strokeWidth={isSelected ? 2.5 : 1}
                          style={{
                            default: { outline: "none", transition: "all 0.2s" },
                            hover: { fill: "#60A5FA", stroke: "#1E40AF", strokeWidth: 2, outline: "none", cursor: "pointer" },
                            pressed: { fill: "#1E40AF", outline: "none" },
                          }}
                          onClick={() => onDepartmentClick(code)}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-card border border-border shadow-elevated z-50">
                        <p className="font-medium text-xs">{deptData?.departement || geo.properties.nom}</p>
                        {alertCount > 0 && (
                          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: getWarningColor(alertCount) }}>
                            <AlertTriangle className="w-3 h-3" />
                            {alertCount} alerte{alertCount > 1 ? 's' : ''}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })
            }
          </Geographies>
          {/* Alert markers for IdF */}
          {IDF_DEPARTMENTS.map(dept => {
            const alertCount = departmentAlerts[dept.code] || 0;
            if (alertCount === 0) return null;
            const coords = DEPARTMENT_CENTERS[dept.code];
            if (!coords) return null;
            const color = getWarningColor(alertCount);
            return (
              <Marker key={`idf-marker-${dept.code}`} coordinates={coords}>
                <g style={{ cursor: 'pointer' }} onClick={() => onDepartmentClick(dept.code)}>
                  {/* Large pin for max visibility */}
                  <g transform="translate(-20, -50)">
                    <path
                      d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30s20-15 20-30C40 8.954 31.046 0 20 0z"
                      fill={color}
                      stroke="#fff"
                      strokeWidth="3"
                    />
                    <circle cx="20" cy="17" r="11" fill="#fff" opacity="0.95" />
                    <text textAnchor="middle" x="20" y="22" style={{ fontFamily: "system-ui", fill: color, fontSize: 16, fontWeight: "bold" }}>
                      {alertCount}
                    </text>
                  </g>
                </g>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 glass p-3 rounded-xl shadow-soft">
        <p className="text-xs font-medium text-foreground mb-2 max-w-[120px] leading-tight">
          {selectedMetric === 'isoles_60_74' ? 'Seniors isolés (60-74 ans)' : selectedMetric === 'taux_pauvrete_75' ? 'Taux de pauvreté (+75 ans)' : 'Nb maladies moy. / personne (+65 ans)'}
        </p>
        <div className="flex items-center gap-0.5">
          <div className="h-3 w-6 rounded-l-sm" style={{ background: "#EFF6FF" }}></div>
          <div className="h-3 w-6" style={{ background: "#93C5FD" }}></div>
          <div className="h-3 w-6" style={{ background: "#3B82F6" }}></div>
          <div className="h-3 w-6 rounded-r-sm" style={{ background: "#1E40AF" }}></div>
        </div>
        {/* Tick values under the scale */}
        <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5 w-[96px]">
          {(() => {
            const values = data.map(d => d[selectedMetric] as number).filter(v => !isNaN(v) && v > 0).sort((a, b) => a - b);
            if (values.length === 0) return null;
            const min = values[0];
            const max = values[values.length - 1];
            let steps: number[];
            if (selectedMetric === 'mal_chro_oui') {
              steps = [min, values[Math.floor(values.length * 0.33)], values[Math.floor(values.length * 0.66)], max];
            } else {
              steps = [min, (min + max) / 3, (min + max) * 2 / 3, max];
            }
            return steps.map((v, i) => (
              <span key={i} className="text-center" style={{ width: 24 }}>
                {v > 1000 ? `${Math.round(v / 1000)}k` : v % 1 === 0 ? Math.round(v) : v.toFixed(1)}
              </span>
            ));
          })()}
        </div>
        
        {/* Alert Legend */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs font-medium text-foreground mb-2">Alertes</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <svg width="12" height="16" viewBox="0 0 24 28">
                <path d="M12 0C7.58 0 4 3.58 4 8c0 5.76 7.11 11.38 7.42 11.62a1 1 0 0 0 1.16 0C12.89 19.38 20 13.76 20 8c0-4.42-3.58-8-8-8z" fill="#eab308" stroke="#fff" strokeWidth="1"/>
              </svg>
              <span className="text-[10px] text-muted-foreground">1</span>
            </div>
            <div className="flex items-center gap-1">
              <svg width="12" height="16" viewBox="0 0 24 28">
                <path d="M12 0C7.58 0 4 3.58 4 8c0 5.76 7.11 11.38 7.42 11.62a1 1 0 0 0 1.16 0C12.89 19.38 20 13.76 20 8c0-4.42-3.58-8-8-8z" fill="#f97316" stroke="#fff" strokeWidth="1"/>
              </svg>
              <span className="text-[10px] text-muted-foreground">2</span>
            </div>
            <div className="flex items-center gap-1">
              <svg width="12" height="16" viewBox="0 0 24 28">
                <path d="M12 0C7.58 0 4 3.58 4 8c0 5.76 7.11 11.38 7.42 11.62a1 1 0 0 0 1.16 0C12.89 19.38 20 13.76 20 8c0-4.42-3.58-8-8-8z" fill="#ef4444" stroke="#fff" strokeWidth="1"/>
              </svg>
              <span className="text-[10px] text-muted-foreground">3+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
