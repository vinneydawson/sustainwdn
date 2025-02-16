
interface JobSectionProps {
  title: string;
  children: React.ReactNode;
}

export const JobSection = ({ title, children }: JobSectionProps) => {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
  );
};
