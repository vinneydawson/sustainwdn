
import { JobSection } from "./JobSection";

interface JobListSectionProps {
  title: string;
  items: string[];
}

export const JobListSection = ({ title, items }: JobListSectionProps) => {
  if (!items || items.length === 0) return null;

  return (
    <JobSection title={title}>
      <ul className="list-disc pl-6 space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-gray-600">{item}</li>
        ))}
      </ul>
    </JobSection>
  );
};
