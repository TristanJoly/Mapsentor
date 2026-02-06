import { ChevronDown, MapPin } from "lucide-react";
import { DepartmentData } from "@/lib/data";

interface DepartmentSelectorProps {
  value: string;
  onChange: (value: string) => void;
  departments: DepartmentData[];
}

export const DepartmentSelector = ({ value, onChange, departments }: DepartmentSelectorProps) => {
  const selectedDept = departments.find(d => d.code_departement === value);

  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Département</h3>
          <p className="text-xs text-muted-foreground">Zone géographique</p>
        </div>
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="select-modern appearance-none cursor-pointer pr-10"
        >
          {departments
            .filter(dept => dept.code_departement && dept.departement)
            .sort((a, b) => a.code_departement.localeCompare(b.code_departement))
            .map((dept) => (
              <option key={dept.code_departement} value={dept.code_departement}>
                {dept.code_departement} - {dept.departement}
              </option>
            ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
      </div>
      {selectedDept && (
        <p className="mt-2 text-xs text-muted-foreground">
          Région : {selectedDept.region || 'Non spécifiée'}
        </p>
      )}
    </div>
  );
};
