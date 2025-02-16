
import { Button } from "@/components/ui/button";

type JobLevel = "entry" | "mid" | "advanced";

interface PathwayJobsFilterProps {
  selectedLevel: JobLevel | null;
  onLevelChange: (level: JobLevel | null) => void;
}

export const PathwayJobsFilter = ({ selectedLevel, onLevelChange }: PathwayJobsFilterProps) => {
  const levels: Array<{ id: JobLevel; label: string }> = [
    { id: 'entry', label: 'Entry Level' },
    { id: 'mid', label: 'Mid Level' },
    { id: 'advanced', label: 'Advanced' }
  ];

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <Button
        variant={selectedLevel === null ? "outline" : "outline"}
        onClick={() => onLevelChange(null)}
        className={selectedLevel === null ? "bg-gray-200 font-medium border-gray-300 hover:bg-gray-300" : ""}
      >
        All Levels
      </Button>
      {levels.map((level) => (
        <Button
          key={level.id}
          variant={selectedLevel === level.id ? "outline" : "outline"}
          onClick={() => onLevelChange(level.id)}
          className={selectedLevel === level.id ? "bg-gray-200 font-medium border-gray-300 hover:bg-gray-300" : ""}
        >
          {level.label}
        </Button>
      ))}
    </div>
  );
};
