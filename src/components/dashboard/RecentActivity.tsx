
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ActivitySquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

type Activity = {
  id: string;
  type: 'profile_update' | 'file_upload' | 'file_delete' | 'pathway_started' | 'resource_completed';
  description: string;
  created_at: string;
};

const getActivityIcon = (type: Activity['type']) => {
  return <ActivitySquare className="h-4 w-4" />;
};

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'profile_update':
      return 'text-blue-500';
    case 'file_upload':
      return 'text-green-500';
    case 'file_delete':
      return 'text-red-500';
    case 'pathway_started':
      return 'text-purple-500';
    case 'resource_completed':
      return 'text-yellow-500';
    default:
      return 'text-gray-500';
  }
};

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Activity[];
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
          <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
          <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
      {activities && activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`mt-1 ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No recent activity</p>
      )}
    </Card>
  );
}
