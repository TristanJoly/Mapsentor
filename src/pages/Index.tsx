import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MetricSelector } from "@/components/map/MetricSelector";
import { DepartmentSelector } from "@/components/map/DepartmentSelector";
import { FranceMap } from "@/components/map/FranceMap";
import { DepartmentInfo } from "@/components/map/DepartmentInfo";
import { loadDepartmentData, DepartmentData } from "@/lib/data";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [selectedMetric, setSelectedMetric] = useState("taux_pauvrete_75");
  const [selectedDepartment, setSelectedDepartment] = useState("01");
  const [data, setData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartmentData().then(departmentData => {
      setData(departmentData);
      setLoading(false);
      if (departmentData.length > 0 && !departmentData.find(d => d.code_departement === "01")) {
        setSelectedDepartment(departmentData[0].code_departement);
      }
    });
  }, []);

  const selectedDeptData = data.find(d => d.code_departement === selectedDepartment);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Carte de France
          </h1>
          <p className="text-muted-foreground">
            Visualisez les indicateurs du vieillissement par département • {data.length} départements
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <MetricSelector value={selectedMetric} onChange={setSelectedMetric} />
          <DepartmentSelector 
            value={selectedDepartment} 
            onChange={setSelectedDepartment}
            departments={data}
          />
        </div>

        {/* Department Info */}
        <div className="mb-6">
          <DepartmentInfo department={selectedDeptData} />
        </div>

        {/* Map */}
        <div className="h-[calc(100vh-500px)] min-h-[450px]">
          <FranceMap 
            data={data}
            selectedMetric={selectedMetric}
            selectedDepartment={selectedDepartment}
            onDepartmentClick={setSelectedDepartment}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
