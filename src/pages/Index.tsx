import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MetricSelector } from "@/components/map/MetricSelector";
import { DepartmentSelector } from "@/components/map/DepartmentSelector";
import { MapPlaceholder } from "@/components/map/MapPlaceholder";
import { DepartmentInfo } from "@/components/map/DepartmentInfo";

const Index = () => {
  const [selectedMetric, setSelectedMetric] = useState("60_75_plus_isoles");
  const [selectedDepartment, setSelectedDepartment] = useState("01");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Carte de France
          </h1>
          <p className="text-muted-foreground">
            Visualisez les indicateurs du vieillissement par département
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <MetricSelector value={selectedMetric} onChange={setSelectedMetric} />
          <DepartmentSelector value={selectedDepartment} onChange={setSelectedDepartment} />
          <DepartmentInfo departmentCode={selectedDepartment} />
        </div>

        {/* Map */}
        <div className="h-[calc(100vh-380px)] min-h-[500px]">
          <MapPlaceholder 
            selectedDepartment={selectedDepartment} 
            selectedMetric={selectedMetric}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
