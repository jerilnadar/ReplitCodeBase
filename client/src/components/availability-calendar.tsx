import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface AvailabilityCalendarProps {
  className?: string;
}

export default function AvailabilityCalendar({ className }: AvailabilityCalendarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentMonth = "2025-01";
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  // Get current availability
  const { data: availability } = useQuery({
    queryKey: ["/api/availability", currentMonth],
    retry: false,
  });

  // Initialize selected dates when availability is loaded
  useState(() => {
    if (availability?.availableDates) {
      setSelectedDates(availability.availableDates);
    }
  });

  const submitAvailabilityMutation = useMutation({
    mutationFn: async (data: { month: string; availableDates: string[] }) => {
      await apiRequest("POST", "/api/availability", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      toast({
        title: "Success",
        description: "Your availability has been saved successfully!",
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

  const toggleDate = (dateStr: string) => {
    setSelectedDates(prev => 
      prev.includes(dateStr) 
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const handleSubmit = () => {
    submitAvailabilityMutation.mutate({
      month: currentMonth,
      availableDates: selectedDates,
    });
  };

  // Generate calendar days for January 2025
  const generateCalendarDays = () => {
    const days = [];
    const startDate = new Date(2025, 0, 1); // January 1, 2025
    const endDate = new Date(2025, 0, 31); // January 31, 2025
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const isServiceDay = dayOfWeek === 0 || dayOfWeek === 3 || dayOfWeek === 6; // Sunday, Wednesday, Saturday
      
      days.push({
        date: new Date(d),
        dateStr,
        day: d.getDate(),
        isServiceDay,
        serviceType: dayOfWeek === 0 ? 'sunday' : dayOfWeek === 3 ? 'wednesday' : dayOfWeek === 6 ? 'saturday' : null,
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const getServiceColor = (serviceType: string | null) => {
    switch (serviceType) {
      case 'sunday': return 'bg-primary';
      case 'wednesday': return 'bg-accent';
      case 'saturday': return 'bg-purple-500';
      default: return '';
    }
  };

  return (
    <Card className={className}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CalendarPlus className="mr-2 text-primary" />
              My Availability - January 2025
            </h3>
            <p className="text-sm text-gray-600 mt-1">Mark your available dates for this month</p>
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={submitAvailabilityMutation.isPending}
            data-testid="button-save-availability"
          >
            <Save className="mr-2 w-4 h-4" />
            Save Availability
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Mini Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          
          {/* Add empty cells for days before January 1st */}
          {Array.from({ length: calendarDays[0]?.date.getDay() || 0 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          
          {calendarDays.map(({ dateStr, day, isServiceDay, serviceType }) => {
            const isSelected = selectedDates.includes(dateStr);
            
            return (
              <button
                key={dateStr}
                className={cn(
                  "aspect-square p-2 text-sm rounded-md hover:bg-gray-50 relative group transition-colors",
                  isSelected && "border-2 border-secondary bg-secondary/10"
                )}
                onClick={() => toggleDate(dateStr)}
                data-testid={`calendar-day-${dateStr}`}
              >
                <span className={cn(
                  "text-gray-900",
                  isSelected && "font-semibold"
                )}>
                  {day}
                </span>
                
                {isServiceDay && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                    <div 
                      className={cn("w-1.5 h-1.5 rounded-full", getServiceColor(serviceType))}
                      title={`${serviceType?.charAt(0).toUpperCase()}${serviceType?.slice(1)} Service`}
                    />
                  </div>
                )}
                
                {!isSelected && (
                  <div className="absolute inset-0 border-2 border-secondary rounded-md opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-6">
          <div className="flex items-center justify-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-gray-600">Sunday Service</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="text-gray-600">Wednesday Meeting</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Saturday Practice</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-secondary rounded-full"></div>
              <span className="text-gray-600">Available</span>
            </div>
          </div>
        </div>
        
        {/* Availability Status */}
        {availability && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-secondary rounded-full mr-2" />
              <span className="text-sm text-green-800">
                Availability submitted for January 2025
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
