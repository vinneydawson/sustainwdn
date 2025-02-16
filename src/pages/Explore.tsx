
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Fish, Wind, Banknote, Cpu, Droplet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import type { CareerPathway } from "@/types/job";

const iconMap = {
  Fish,
  Wind,
  Banknote,
  Cpu,
  Droplet,
};

const Explore = () => {
  const { data: pathways, isLoading: isLoadingPathways } = useQuery({
    queryKey: ["career-pathways"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_pathways")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      
      return data.map(pathway => ({
        ...pathway,
        description: typeof pathway.description === 'string' 
          ? { content: pathway.description }
          : pathway.description as { content: string },
        requirements: pathway.requirements?.map(req => 
          typeof req === 'string' ? { content: req } : req
        ) as { content: string }[] | null
      })) as CareerPathway[];
    },
  });

  if (isLoadingPathways) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Explore Sustainable Pathways
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Discover career opportunities in sustainability and clean energy
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pathways?.map((pathway) => {
            const IconComponent = iconMap[pathway.icon as keyof typeof iconMap];
            return (
              <Card key={pathway.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  {IconComponent && <IconComponent className="h-8 w-8 text-primary-600" />}
                  <h3 className="text-xl font-semibold">{pathway.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{pathway.description.content}</p>
                <div className="flex justify-start">
                  <Link to={`/explore/pathway/${pathway.id}`}>
                    <Button variant="secondary" size="sm">
                      View Careers
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Explore;
