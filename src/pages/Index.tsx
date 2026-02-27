import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MetricSelector } from "@/components/map/MetricSelector";
import { DepartmentSelector } from "@/components/map/DepartmentSelector";
import { FranceMap } from "@/components/map/FranceMap";
import { DepartmentInfo } from "@/components/map/DepartmentInfo";
import { DepartmentAlerts } from "@/components/map/DepartmentAlerts";
import { DepartmentCharts } from "@/components/charts/DepartmentCharts";
import { DepartmentComparison } from "@/components/comparison/DepartmentComparison";
import { loadDepartmentData, DepartmentData } from "@/lib/data";
import { Loader2, BarChart3, Menu, GitCompare, Map } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  const [selectedMetric, setSelectedMetric] = useState("taux_pauvrete_75");
  const [selectedDepartment, setSelectedDepartment] = useState("01");
  const [data, setData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

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
    <div className="flex min-h-screen w-full bg-background relative">
      {/* Mobile overlay */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      {/* Sidebar - overlay on mobile */}
      <div className={`${isMobile ? 'fixed z-50 h-full' : ''} ${isMobile && sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'} transition-transform duration-300`}>
        <Sidebar 
          collapsed={isMobile ? false : sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto w-full">
        {/* Header */}
        <div className="mb-4 md:mb-6 flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="shrink-0"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-foreground">
              Mapsentor
            </h1>
          </div>
        </div>

        {/* Tabs */}

        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="bg-muted/50 w-full md:w-auto h-12">
            <TabsTrigger value="map" className="gap-2 text-sm md:text-base flex-1 md:flex-none px-4 py-2.5">
              <Map className="w-5 h-5" />
              Carte
            </TabsTrigger>
            <TabsTrigger value="charts" className="gap-2 text-sm md:text-base flex-1 md:flex-none px-4 py-2.5">
              <BarChart3 className="w-5 h-5" />
              Graphiques
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2 text-sm md:text-base flex-1 md:flex-none px-4 py-2.5">
              <GitCompare className="w-5 h-5" />
              Comparaison
            </TabsTrigger>
          </TabsList>

          {/* Onglet Carte */}
          <TabsContent value="map" className="space-y-6">
            {/* Department Selector */}
            <DepartmentSelector 
              value={selectedDepartment} 
              onChange={setSelectedDepartment}
              departments={data}
            />

            {/* Department Info + Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <DepartmentInfo department={selectedDeptData} allData={data} />
              </div>
              <div>
                <DepartmentAlerts department={selectedDeptData} allData={data} />
              </div>
            </div>

            {/* Metric Selector - juste au-dessus de la carte */}
            <div className="p-4 rounded-xl bg-card border border-border shadow-card">
              <h4 className="text-sm font-semibold text-foreground mb-3" style={{ color: '#FF8C42' }}>Choix de la métrique</h4>
              <MetricSelector value={selectedMetric} onChange={setSelectedMetric} />
            </div>

            {/* Map */}
            <div className="h-[60vh] md:h-[calc(100vh-600px)] min-h-[350px] mb-16">
              <FranceMap 
                data={data}
                selectedMetric={selectedMetric}
                selectedDepartment={selectedDepartment}
                onDepartmentClick={setSelectedDepartment}
              />
            </div>
          </TabsContent>

          {/* Onglet Graphiques */}
          <TabsContent value="charts" className="space-y-6">
            {/* Department Selector */}
            <DepartmentSelector 
              value={selectedDepartment} 
              onChange={setSelectedDepartment}
              departments={data}
            />

            {/* Department Info */}
            <DepartmentInfo department={selectedDeptData} allData={data} />

            {/* Charts */}
            <DepartmentCharts 
              department={selectedDeptData} 
              allData={data}
              selectedMetric={selectedMetric}
            />


          </TabsContent>

          {/* Onglet Comparaison */}
          <TabsContent value="compare" className="space-y-6">
            <DepartmentComparison 
              allData={data}
              selectedMetric={selectedMetric}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
