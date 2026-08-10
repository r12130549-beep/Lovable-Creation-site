import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploadProps {
  bucket: string;
  path: string;
  onUploadComplete: (url: string) => void;
  accept?: Record<string, string[]>;
  label: string;
}

export function FileUpload({ bucket, path, onUploadComplete, accept, label }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setFileUrl(publicUrl);
      onUploadComplete(publicUrl);

      toast.success(`${label} uploaded successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [bucket, path, onUploadComplete, label]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept as any,
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`
          relative border-2 border-dashed rounded-[2rem] p-8 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer
          ${isDragActive ? 'border-red-500 bg-red-500/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/5'}
          ${fileUrl ? 'border-green-500/50 bg-green-500/5' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-white">Uploading...</p>
              <p className="text-[10px] font-black text-white/40 mt-1 uppercase tracking-[0.2em]">{progress}% Complete</p>
            </div>
          </div>
        ) : fileUrl ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-widest">Success</p>
              <p className="text-[10px] font-black text-white/40 mt-1 uppercase tracking-[0.2em]">File ready to save</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-white/40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white uppercase tracking-widest">
                {isDragActive ? 'Drop it here' : `Upload ${label}`}
              </p>
              <p className="text-[10px] font-black text-white/40 mt-1 uppercase tracking-[0.2em]">
                Drag & drop or click to browse
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
