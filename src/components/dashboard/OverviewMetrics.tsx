
import { useQuery } from "@tanstack/react-query";
import { Target, BookOpen, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

type UserProgress = {
  resources_completed: number;
  achievements_count: number;
  pathway_progress: number;
};

export function OverviewMetrics() {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['user-progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_progress')
        .select('resources_completed, achievements_count, pathway_progress')
        .single();

      if (error) throw error;
      return data as UserProgress;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-8 bg-primary-100 rounded"></div>
              <div className="h-6 w-24 bg-primary-100 rounded"></div>
              <div className="h-8 w-16 bg-primary-100 rounded"></div>
              <div className="h-4 w-32 bg-primary-100 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!progress) return null;

  const metrics = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "Progress",
      value: `${progress.pathway_progress}%`,
      description: "Career path completion"
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Resources",
      value: progress.resources_completed,
      description: "Materials completed"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Achievements",
      value: progress.achievements_count,
      description: "Milestones reached"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="p-6">
          <div className="text-primary-600 mb-4">
            {metric.icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{metric.title}</h3>
          <p className="text-2xl font-bold text-primary-600">
            {metric.value}
          </p>
          <p className="text-gray-600">{metric.description}</p>
        </Card>
      ))}
    </div>
  );
}
