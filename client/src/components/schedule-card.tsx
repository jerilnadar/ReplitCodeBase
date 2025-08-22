import { Badge } from "@/components/ui/badge";
import { Music, Guitar, Piano, Volume2, Drum, Mic } from "lucide-react";
import { Service, ServiceAssignment, User } from "@shared/schema";

interface ScheduleCardProps {
  service: Service & { assignments?: (ServiceAssignment & { user: User })[] };
}

export default function ScheduleCard({ service }: ScheduleCardProps) {
  const getServiceColor = (serviceType: string) => {
    switch (serviceType) {
      case 'sunday': return 'bg-primary';
      case 'wednesday': return 'bg-accent';
      case 'saturday': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getApprovalColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-secondary text-white';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs_changes': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'singer': return <Mic className="text-gray-400" />;
      case 'guitarist': return <Guitar className="text-gray-400" />;
      case 'bassist': return <Music className="text-gray-400" />;
      case 'keyboard': return <Piano className="text-gray-400" />;
      case 'drums': return <Drum className="text-gray-400" />;
      case 'pa': return <Volume2 className="text-gray-400" />;
      default: return <Music className="text-gray-400" />;
    }
  };

  const formatServiceTime = (date: string, time: string) => {
    const serviceDate = new Date(date);
    return `${serviceDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })}, ${time}`;
  };

  // Group assignments by role
  const groupedAssignments = service.assignments?.reduce((acc, assignment) => {
    if (!acc[assignment.role]) {
      acc[assignment.role] = [];
    }
    acc[assignment.role].push(assignment);
    return acc;
  }, {} as Record<string, (ServiceAssignment & { user: User })[]>) || {};

  const allRoles = ['singer', 'guitarist', 'bassist', 'keyboard', 'drums', 'pa'];

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors" data-testid={`schedule-card-${service.id}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 ${getServiceColor(service.serviceType)} rounded-full`} />
          <h4 className="font-semibold text-gray-900">{service.title}</h4>
          <Badge className={getApprovalColor(service.approvalStatus)} data-testid={`status-${service.approvalStatus}`}>
            {service.approvalStatus === 'approved' && <span>✓</span>}
            {service.approvalStatus === 'pending' && <span>⏱️</span>}
            {service.approvalStatus === 'needs_changes' && <span>⚠️</span>}
            {service.approvalStatus === 'rejected' && <span>✗</span>}
            <span className="ml-1 capitalize">{service.approvalStatus.replace('_', ' ')}</span>
          </Badge>
        </div>
        <span className="text-sm text-gray-500" data-testid="service-time">
          {formatServiceTime(service.serviceDate, service.serviceTime)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {allRoles.map(role => {
          const roleAssignments = groupedAssignments[role] || [];
          
          return (
            <div key={role} className="flex items-center space-x-2">
              {getRoleIcon(role)}
              <div>
                <p className="text-xs text-gray-500 capitalize">
                  {role === 'pa' ? 'PA/Sound' : role}
                </p>
                <p className="text-sm font-medium" data-testid={`role-${role}`}>
                  {roleAssignments.length > 0 
                    ? roleAssignments.map(a => `${a.user.firstName} ${a.user.lastName}`).join(', ')
                    : <span className="text-gray-400">TBD</span>
                  }
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
