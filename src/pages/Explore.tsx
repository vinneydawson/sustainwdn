
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Fish, Wind, Banknote, Cpu, Droplet, LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const iconMap: { [key: string]: LucideIcon } = {
  Fish,
  Wind,
  Banknote,
  Cpu,
  Droplet,
};

interface CareerPathway {
  id: string;
  title: string;
  description: string;
  level: string;
  icon: string;
}

const Explore = () => {
  const { data: pathways, isLoading: isLoadingPathways } = useQuery({
    queryKey: ["career-pathways"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_pathways")
        .select("*");
      if (error) throw error;
      return data as CareerPathway[];
    },
  });

  if (isLoadingPathways) {
    return (
      <div className="h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Loading...</h1>
        </div>
      </div>
    );
  }

  const hasOverflow = pathways && pathways.length > 6;

  return (
    <div className={`h-[calc(100vh-64px)] ${!hasOverflow ? 'overflow-hidden' : ''} bg-gradient-to-b from-primary-50 to-white`}>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Explore Sustainable Pathways
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Discover career opportunities in sustainability and clean energy
        </p>

        {/* Career Pathways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pathways?.map((pathway) => {
            const IconComponent = iconMap[pathway.icon];
            return (
              <Card key={pathway.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  {IconComponent && <IconComponent className="h-8 w-8 text-primary-600" />}
                  <h3 className="text-xl font-semibold">{pathway.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{pathway.description}</p>
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
