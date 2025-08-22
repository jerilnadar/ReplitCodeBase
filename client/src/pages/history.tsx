import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  History, 
  Calendar, 
  Users, 
  Filter, 
  Download,
  ChevronLeft,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ScheduleCard from "@/components/schedule-card";
import type { Service, ServiceAssignment, User, Availability } from "@shared/schema";

export default function HistoryPage() {
  const { user } = useAuth();
  const [selectedTimeRange, setSelectedTimeRange] = useState("12");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [showAllServices, setShowAllServices] = useState(false);

  // Fetch historical services
  const { data: historicalServices = [], isLoading: servicesLoading } = useQuery<(Service & { assignments: (ServiceAssignment & { user: User })[] })[]>({
    queryKey: ["/api/services/historical", showAllServices ? "all" : "user"],
    queryFn: async () => {
      const url = showAllServices 
        ? "/api/services/historical?all=true" 
        : "/api/services/historical";
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch historical services');
      return response.json();
    },
    retry: false,
  });

  // Fetch historical availability
  const { data: historicalAvailabilities = [] } = useQuery<Availability[]>({
    queryKey: ["/api/availability/historical", selectedTimeRange],
    queryFn: async () => {
      const response = await fetch(`/api/availability/historical?months=${selectedTimeRange}`);
      if (!response.ok) throw new Error('Failed to fetch historical availability');
      return response.json();
    },
    retry: false,
  });

  // Fetch date range services if custom dates are provided
  const { data: dateRangeServices = [] } = useQuery<(Service & { assignments: (ServiceAssignment & { user: User })[] })[]>({
    queryKey: ["/api/services/date-range", dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      if (!dateRange.startDate || !dateRange.endDate) return [];
      const response = await fetch(`/api/services/date-range/${dateRange.startDate}/${dateRange.endDate}`);
      if (!response.ok) throw new Error('Failed to fetch date range services');
      return response.json();
    },
    enabled: !!(dateRange.startDate && dateRange.endDate),
    retry: false,
  });

  const handleDateRangeChange = (field: string, value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getServiceTypeStats = (services: (Service & { assignments: (ServiceAssignment & { user: User })[] })[]) => {
    const stats = services.reduce((acc, service) => {
      acc[service.serviceType] = (acc[service.serviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(stats).map(([type, count]) => ({ type, count }));
  };

  const getUserParticipationStats = (services: (Service & { assignments: (ServiceAssignment & { user: User })[] })[]) => {
    const userId = (user as any)?.id;
    if (!userId) return [];
    
    const userServices = services.filter(service => 
      service.assignments?.some(assignment => assignment.userId === userId)
    );
    
    const roleStats = userServices.reduce((acc, service) => {
      service.assignments?.forEach(assignment => {
        if (assignment.userId === userId) {
          acc[assignment.role] = (acc[assignment.role] || 0) + 1;
        }
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(roleStats).map(([role, count]) => ({ role, count }));
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const activeServices = dateRange.startDate && dateRange.endDate ? dateRangeServices : historicalServices;
  const serviceTypeStats = getServiceTypeStats(activeServices);
  const userParticipationStats = getUserParticipationStats(activeServices);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.history.back()}
                data-testid="button-back"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <History className="text-primary text-2xl" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Ministry History</h1>
                <p className="text-sm text-gray-500">View past services and availability</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" data-testid="button-export">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services">Historical Services</TabsTrigger>
            <TabsTrigger value="availability">My Availability</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="mt-6">
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Calendar className="mr-2 text-primary" />
                      Service History
                    </h3>
                    {(user as any)?.role === 'pastor' && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="show-all"
                          checked={showAllServices}
                          onChange={(e) => setShowAllServices(e.target.checked)}
                          className="rounded"
                          data-testid="checkbox-show-all"
                        />
                        <Label htmlFor="show-all" className="text-sm">Show all services</Label>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">From:</Label>
                      <Input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                        className="w-auto"
                        data-testid="input-start-date"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">To:</Label>
                      <Input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                        className="w-auto"
                        data-testid="input-end-date"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {servicesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-pulse">Loading historical data...</div>
                  </div>
                ) : activeServices.length > 0 ? (
                  <div className="space-y-4">
                    {activeServices.map((service) => (
                      <ScheduleCard key={service.id} service={service} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No historical services found for the selected period</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="mt-6">
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="mr-2 text-secondary" />
                    Availability History
                  </h3>
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger className="w-48" data-testid="select-time-range">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">Last 6 months</SelectItem>
                      <SelectItem value="12">Last 12 months</SelectItem>
                      <SelectItem value="18">Last 18 months</SelectItem>
                      <SelectItem value="24">Last 24 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-6">
                {historicalAvailabilities.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {historicalAvailabilities.map((availability) => (
                      <div 
                        key={availability.id} 
                        className="border border-gray-200 rounded-lg p-4"
                        data-testid={`availability-${availability.month}`}
                      >
                        <h4 className="font-medium text-gray-900 mb-2">
                          {formatMonth(availability.month)}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {availability.availableDates?.length || 0} days available
                        </p>
                        <div className="text-xs text-gray-500">
                          Submitted: {new Date(availability.submittedAt!).toLocaleDateString()}
                        </div>
                        {availability.availableDates && availability.availableDates.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {availability.availableDates.slice(0, 5).map((date) => (
                                <Badge key={date} variant="outline" className="text-xs">
                                  {new Date(date).getDate()}
                                </Badge>
                              ))}
                              {availability.availableDates.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{availability.availableDates.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No availability data found for the selected period</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Service Type Statistics */}
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <BarChart3 className="mr-2 text-primary" />
                    Service Type Distribution
                  </h3>
                </div>
                <div className="p-6">
                  {serviceTypeStats.length > 0 ? (
                    <div className="space-y-4">
                      {serviceTypeStats.map(({ type, count }) => (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              type === 'sunday' ? 'bg-primary' :
                              type === 'wednesday' ? 'bg-accent' : 
                              type === 'saturday' ? 'bg-purple-500' : 'bg-gray-500'
                            }`} />
                            <span className="capitalize text-sm font-medium">{type} Services</span>
                          </div>
                          <Badge>{count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No data available</p>
                  )}
                </div>
              </Card>

              {/* User Participation Statistics */}
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="mr-2 text-secondary" />
                    My Participation
                  </h3>
                </div>
                <div className="p-6">
                  {userParticipationStats.length > 0 ? (
                    <div className="space-y-4">
                      {userParticipationStats.map(({ role, count }) => (
                        <div key={role} className="flex items-center justify-between">
                          <span className="capitalize text-sm font-medium">
                            {role === 'pa' ? 'PA/Sound' : role}
                          </span>
                          <Badge>{count} times</Badge>
                        </div>
                      ))}
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between font-medium">
                          <span>Total Services</span>
                          <Badge className="bg-primary">{activeServices.filter(s => 
                            s.assignments?.some(a => a.userId === (user as any)?.id)
                          ).length}</Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No participation data available</p>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}