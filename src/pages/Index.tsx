import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MetricSelector } from "@/components/map/MetricSelector";
import { DepartmentSelector } from "@/components/map/DepartmentSelector";
import { FranceMap } from "@/components/map/FranceMap";
import { DepartmentInfo } from "@/components/map/DepartmentInfo";
import { DepartmentAlerts } from "@/components/map/DepartmentAlerts";
import { DepartmentCharts } from "@/components/charts/DepartmentCharts";
import { loadDepartmentData, DepartmentData } from "@/lib/data";
import { Loader2, BarChart3, Menu } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [selectedMetric, setSelectedMetric] = useState("taux_pauvrete_75");
  const [selectedDepartment, setSelectedDepartment] = useState("01");
  const [data, setData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          {sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(false)}
              className="shrink-0"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Carte de France
            </h1>
            <p className="text-muted-foreground">
              Visualisez les indicateurs du vieillissement par département • {data.length} départements
            </p>
          </div>
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

        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="map" className="gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
              </svg>
              Carte
            </TabsTrigger>
            <TabsTrigger value="charts" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Graphiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            {/* Department Info + Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <DepartmentInfo department={selectedDeptData} allData={data} />
              </div>
              <div>
                <DepartmentAlerts department={selectedDeptData} allData={data} />
              </div>
            </div>

            {/* Map */}
            <div className="h-[calc(100vh-550px)] min-h-[400px]">
              <FranceMap 
                data={data}
                selectedMetric={selectedMetric}
                selectedDepartment={selectedDepartment}
                onDepartmentClick={setSelectedDepartment}
              />
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            {/* Department Info */}
            <DepartmentInfo department={selectedDeptData} allData={data} />

            {/* Charts */}
            <DepartmentCharts 
              department={selectedDeptData} 
              allData={data}
              selectedMetric={selectedMetric}
            />

            {/* Alerts */}
            <div className="max-w-md">
              <DepartmentAlerts department={selectedDeptData} allData={data} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
