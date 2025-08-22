import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Info, AlertTriangle, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Notification } from "@shared/schema";

export default function NotificationsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    retry: false,
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest("PATCH", `/api/notifications/${notificationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-secondary mt-0.5" />;
      case 'warning': return <AlertTriangle className="text-accent mt-0.5" />;
      case 'error': return <X className="text-red-500 mt-0.5" />;
      default: return <Info className="text-primary mt-0.5" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const handleMarkRead = (notificationId: string) => {
    markReadMutation.mutate(notificationId);
  };

  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Bell className="mr-2 text-accent" />
          Notifications
        </h3>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.slice(0, 5).map((notification) => (
              <div 
                key={notification.id} 
                className={`flex items-start space-x-3 p-3 rounded-lg border ${getNotificationBg(notification.type)} ${!notification.isRead ? 'ring-1 ring-blue-200' : ''}`}
                data-testid={`notification-${notification.id}`}
              >
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.createdAt!)}</p>
                </div>
                {!notification.isRead && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleMarkRead(notification.id)}
                    data-testid={`button-mark-read-${notification.id}`}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications yet</p>
            </div>
          )}
        </div>
        
        {notifications.length > 5 && (
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-sm text-primary hover:text-church-600 font-medium"
            data-testid="button-view-all-notifications"
          >
            View All Notifications
          </Button>
        )}
      </div>
    </Card>
  );
}
