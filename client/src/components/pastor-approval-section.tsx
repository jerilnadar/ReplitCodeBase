import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Edit, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Service } from "@shared/schema";

export default function PastorApprovalSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingServices = [] } = useQuery<Service[]>({
    queryKey: ["/api/services/pending"],
    retry: false,
  });

  const approveServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      await apiRequest("PATCH", `/api/services/${serviceId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Success",
        description: "Service approved successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ serviceId, status }: { serviceId: string; status: string }) => {
      await apiRequest("PATCH", `/api/services/${serviceId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Success",
        description: "Service status updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (serviceId: string) => {
    approveServiceMutation.mutate(serviceId);
  };

  const handleRequestChanges = (serviceId: string) => {
    updateStatusMutation.mutate({ serviceId, status: 'needs_changes' });
  };

  const formatServiceDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="mt-8 border-purple-200 shadow-lg">
      <div className="px-6 py-4 border-b border-purple-200 bg-purple-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Crown className="mr-2 text-purple-600" />
          Pastor Approval Dashboard
        </h3>
        <p className="text-sm text-purple-600 mt-1">Review and approve ministry schedules</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {pendingServices.length > 0 ? (
            pendingServices.map((service) => (
              <div key={service.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4" data-testid={`pending-service-${service.id}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900" data-testid="service-title">
                    {service.title} - {formatServiceDate(service.serviceDate)}
                  </h4>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-secondary hover:bg-green-700 text-white"
                      onClick={() => handleApprove(service.id)}
                      disabled={approveServiceMutation.isPending}
                      data-testid={`button-approve-${service.id}`}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequestChanges(service.id)}
                      disabled={updateStatusMutation.isPending}
                      data-testid={`button-request-changes-${service.id}`}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Request Changes
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p data-testid="service-details">Service Time: {service.serviceTime}</p>
                  <div className="flex items-center mt-1 text-red-600">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    <span>Review required before approval</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Crown className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No services pending approval</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
