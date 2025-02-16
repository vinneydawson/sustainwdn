
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CareerPathway } from "@/types/job";

interface PathwaysTableProps {
  pathways: CareerPathway[];
  onEdit: (pathway: CareerPathway) => void;
  onDelete: (pathway: CareerPathway) => void;
}

export function PathwaysTable({ pathways, onEdit, onDelete }: PathwaysTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-left">Title</TableHead>
          <TableHead className="text-left">Skills</TableHead>
          <TableHead className="text-left">Salary Range</TableHead>
          <TableHead className="text-left">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pathways?.map((pathway) => (
          <TableRow key={pathway.id}>
            <TableCell className="font-medium text-left">{pathway.title}</TableCell>
            <TableCell className="text-left">{pathway.skills?.join(", ") || "No skills listed"}</TableCell>
            <TableCell className="text-left">{pathway.salary_range || "Not specified"}</TableCell>
            <TableCell className="text-left space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(pathway)}
              >
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete(pathway)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
