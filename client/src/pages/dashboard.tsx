import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Music, LogOut, CalendarCheck, Clock, Users, AlertTriangle, Bell, Bolt } from "lucide-react";
import AvailabilityCalendar from "@/components/availability-calendar";
import ScheduleCard from "@/components/schedule-card";
import NotificationsPanel from "@/components/notifications-panel";
import TeamMembersPanel from "@/components/team-members-panel";
import QuickActionsPanel from "@/components/quick-actions-panel";
import PastorApprovalSection from "@/components/pastor-approval-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services/month", new Date().toISOString().slice(0, 7)],
    enabled: !!user,
    retry: false,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const { data: weekServices = [] } = useQuery({
    queryKey: ["/api/services/week", "2025-01-08", "2025-01-12"],
    enabled: !!user,
    retry: false,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "singer": return "bg-primary text-white";
      case "guitarist": return "bg-secondary text-white";
      case "bassist": return "bg-accent text-white";
      case "keyboard": return "bg-purple-500 text-white";
      case "drums": return "bg-green-500 text-white";
      case "pa": return "bg-indigo-500 text-white";
      case "melody": return "bg-pink-500 text-white";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Music className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Music className="text-primary text-2xl" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Ministry Scheduler</h1>
                  <p className="text-sm text-gray-500">Music Ministry Coordination</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                {user.instrumentRole && (
                  <Badge className={getRoleBadgeColor(user.instrumentRole)} data-testid="badge-user-role">
                    <Music className="w-3 h-3 mr-1" />
                    {user.instrumentRole.charAt(0).toUpperCase() + user.instrumentRole.slice(1)}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <span className="font-medium" data-testid="text-username">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600 mt-1">Welcome back! Here's your ministry schedule overview.</p>
          </div>
          
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarCheck className="text-2xl text-secondary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">This Month</p>
                    <p className="text-2xl font-semibold text-gray-900" data-testid="stat-this-month">
                      {services.length}
                    </p>
                    <p className="text-xs text-gray-500">Services Scheduled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="text-2xl text-accent" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-semibold text-gray-900" data-testid="stat-pending">
                      {services.filter(s => s.approvalStatus === 'pending').length}
                    </p>
                    <p className="text-xs text-gray-500">Awaiting Approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="text-2xl text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Available</p>
                    <p className="text-2xl font-semibold text-gray-900" data-testid="stat-available">12</p>
                    <p className="text-xs text-gray-500">Members Ready</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="text-2xl text-red-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Conflicts</p>
                    <p className="text-2xl font-semibold text-gray-900" data-testid="stat-conflicts">0</p>
                    <p className="text-xs text-gray-500">Need Resolution</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Schedule Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Monthly Availability Submission */}
            <AvailabilityCalendar />

            {/* Current Schedule View */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CalendarCheck className="mr-2 text-primary" />
                  This Week's Schedule
                </h3>
                <p className="text-sm text-gray-600 mt-1">January 8-12, 2025</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {weekServices.length > 0 ? (
                    weekServices.map((service) => (
                      <ScheduleCard key={service.id} service={service} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No services scheduled for this week</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications Panel */}
            <NotificationsPanel />

            {/* Team Members */}
            <TeamMembersPanel />

            {/* Quick Actions */}
            <QuickActionsPanel />
          </div>
        </div>

        {/* Pastor Approval Section */}
        {user.role === 'pastor' && <PastorApprovalSection />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Music className="text-primary" />
              <span className="text-gray-600">Ministry Scheduler</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 text-sm">Serving with excellence</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>© 2025 Ministry Scheduler</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
