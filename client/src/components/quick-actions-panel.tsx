import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bolt, UserPlus, CalendarX, Calendar, Mail, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QuickActionsPanel() {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `${action} functionality will be available soon!`,
    });
  };

  const actions = [
    {
      icon: <UserPlus className="text-primary" />,
      label: "Request Substitute",
      action: "Substitute request",
      testId: "action-substitute"
    },
    {
      icon: <CalendarX className="text-accent" />,
      label: "Report Absence",
      action: "Absence report",
      testId: "action-absence"
    },
    {
      icon: <Calendar className="text-secondary" />,
      label: "Next Month Schedule",
      action: "Next month view",
      testId: "action-next-month"
    },
    {
      icon: <Mail className="text-purple-500" />,
      label: "Contact Pastor",
      action: "Pastor contact",
      testId: "action-contact-pastor"
    }
  ];

  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Bolt className="mr-2 text-accent" />
          Quick Actions
        </h3>
      </div>
      
      <div className="p-6">
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 h-auto"
              onClick={() => handleAction(action.action)}
              data-testid={action.testId}
            >
              <div className="flex items-center space-x-3">
                {action.icon}
                <span className="text-sm font-medium">{action.label}</span>
              </div>
              <ChevronRight className="text-gray-400 w-4 h-4" />
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
