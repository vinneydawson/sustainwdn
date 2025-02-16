import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { FileText, Trash2, Upload, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  created_at: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export function FileUploadSection({ user }: { user: User }) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching files",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "File must be less than 10MB",
          variant: "destructive",
        });
        return;
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only PDF, DOC, DOCX, and TXT files are allowed",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          name: file.name,
          type: file.type,
          size: file.size,
          url: publicUrl,
        });

      if (dbError) throw dbError;

      toast({
        title: "File uploaded",
        description: "Your file has been successfully uploaded.",
      });

      fetchFiles();
    } catch (error: any) {
      toast({
        title: "Error uploading file",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      toast({
        title: "File deleted",
        description: "The file has been successfully deleted.",
      });

      fetchFiles();
    } catch (error: any) {
      toast({
        title: "Error deleting file",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePreview = (file: FileItem) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFilePreview = () => {
    if (!selectedFile) return null;

    if (selectedFile.type === 'application/pdf') {
      return (
        <iframe
          src={selectedFile.url}
          className="w-full h-[80vh]"
          title={selectedFile.name}
        />
      );
    }

    if (selectedFile.type === 'text/plain') {
      return (
        <iframe
          src={selectedFile.url}
          className="w-full h-[80vh]"
          title={selectedFile.name}
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-[80vh]">
        <p className="text-gray-500">
          Preview not available for this file type. Please download the file to view it.
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">My Files</h2>

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" className="w-full max-w-xs">
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload File"}
            </label>
          </Button>
          <span className="text-sm text-gray-500">
            Max size: 10MB. Supported formats: PDF, DOC, DOCX, TXT
          </span>
        </div>

        {isUploading && (
          <div className="mt-4">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-gray-500 mt-1">
              Uploading: {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary-600" />
              <div>
                <p className="font-semibold">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreview(file)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                asChild 
                className="bg-primary-600 hover:bg-primary-700 text-white"
                size="sm"
              >
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(file.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {files.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No files uploaded yet. Upload your first file!
          </p>
        )}
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>{selectedFile?.name}</DialogTitle>
          </DialogHeader>
          {renderFilePreview()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
