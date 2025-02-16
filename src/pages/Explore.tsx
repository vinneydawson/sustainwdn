
import { Card } from "@/components/ui/card";
import { Leaf, Wind, Sun, Cpu } from "lucide-react";

const careerPaths = [
  {
    icon: <Leaf className="h-8 w-8" />,
    title: "Environmental Science",
    level: "Entry to Advanced",
    description: "Study and protect natural resources and ecosystems",
  },
  {
    icon: <Wind className="h-8 w-8" />,
    title: "Renewable Energy",
    level: "Mid to Advanced",
    description: "Design and implement clean energy solutions",
  },
  {
    icon: <Sun className="h-8 w-8" />,
    title: "Sustainable Agriculture",
    level: "Entry to Mid",
    description: "Develop eco-friendly farming practices",
  },
  {
    icon: <Cpu className="h-8 w-8" />,
    title: "Green Technology",
    level: "Mid to Advanced",
    description: "Innovate for environmental sustainability",
  },
];

const Explore = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Explore Sustainable Careers
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {careerPaths.map((path) => (
            <Card key={path.title} className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-primary-600 mb-4">{path.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{path.title}</h3>
              <p className="text-sm text-primary-600 mb-2">{path.level}</p>
              <p className="text-gray-600">{path.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
