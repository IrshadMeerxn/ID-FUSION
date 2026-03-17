import { Button } from "@/components/ui/button";
import { Eye, Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface Props {
  label: string;
  currentPhotoUrl?: string;
  onFileReady: (file: File | null, previewUrl: string | null) => void;
  disabled?: boolean;
}

export default function CardPhotoUpload({ label, currentPhotoUrl, onFileReady, disabled }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setIsProcessing(true);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    onFileReady(file, preview);
    setIsProcessing(false);
  }, [onFileReady]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  }, [processFile]);

  const handleRemove = () => {
    setPreviewUrl(null);
    onFileReady(null, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      {previewUrl ? (
        <div className="relative rounded border border-border overflow-hidden group">
          <img src={previewUrl} alt={label} className="w-full h-32 object-cover" />
          <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => window.open(previewUrl, "_blank")} className="h-8 w-8 p-0">
              <Eye className="w-4 h-4" />
            </Button>
            {!disabled && (
              <Button type="button" size="sm" variant="ghost" onClick={handleRemove} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button type="button" onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} onClick={() => !disabled && inputRef.current?.click()} disabled={disabled}
          className={`w-full border-2 border-dashed rounded h-28 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-primary/5"} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}>
          {isProcessing ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : (
            <>
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground text-center px-2">{isDragging ? "Drop to upload" : "Click or drag photo"}</span>
            </>
          )}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={disabled} />
    </div>
  );
}
