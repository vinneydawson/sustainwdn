
import type { JobRole } from "@/types/job";
import type { JobFormData } from "@/hooks/use-jobs";

export interface JobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: JobFormData) => void;
  initialData?: JobRole;
}

export interface ResourceLink {
  url: string;
  text: string;
}
