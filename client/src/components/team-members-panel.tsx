import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { User } from "@shared/schema";

export default function TeamMembersPanel() {
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    retry: false,
  });

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "singer": return "bg-primary";
      case "guitarist": return "bg-secondary";
      case "bassist": return "bg-accent";
      case "keyboard": return "bg-purple-500";
      case "drums": return "bg-green-500";
      case "pa": return "bg-indigo-500";
      case "melody": return "bg-pink-500";
      default: return "bg-gray-500";
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return first + last || '??';
  };

  const getDisplayRole = (role?: string) => {
    if (!role) return 'Member';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Filter out pastors from general team members list
  const teamMembers = users.filter(user => user.role !== 'pastor');

  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="mr-2 text-primary" />
          Ministry Team
        </h3>
      </div>
      
      <div className="p-6">
        <div className="space-y-3">
          {teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between" data-testid={`team-member-${member.id}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${getRoleColor(member.instrumentRole)} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                    <span data-testid="member-initials">
                      {getInitials(member.firstName, member.lastName)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900" data-testid="member-name">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-gray-500" data-testid="member-role">
                      {getDisplayRole(member.instrumentRole)}
                    </p>
                  </div>
                </div>
                <div 
                  className="w-3 h-3 bg-secondary rounded-full" 
                  title="Available this month"
                  data-testid="availability-indicator"
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No team members yet</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Limited</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
