'use client';
import { useState, useRef } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  bucket?: string;
  storagePath?: string;
  label?: string;
  currentImage?: string;
}

export function ImageUploader({
  onUpload,
  bucket = 'cms-uploads',
  storagePath = 'uploads',
  label = 'Upload Image',
  currentImage,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10MB'); return; }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { setError('Only JPG, PNG, or WebP allowed'); return; }
    setError('');
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setProgress(30);
    try {
      const { createClientClient } = await import('@/lib/supabase/client');
      const supabase = createClientClient();
      const ext = file.name.split('.').pop();
      const path = `${storagePath}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      setProgress(60);
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      setProgress(90);
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      setProgress(100);
      onUpload(data.publicUrl);
    } catch (e) {
      setError('Upload failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
      setPreview(currentImage || '');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-[#C9A84C] transition text-center min-h-[100px] flex flex-col items-center justify-center gap-2"
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="max-h-32 rounded-lg object-cover" />
            <button
              onClick={e => { e.stopPropagation(); setPreview(''); }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              {uploading
                ? <div className="w-5 h-5 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                : <ImageIcon className="w-5 h-5 text-gray-400" />}
            </div>
            <p className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Drag & drop or click to browse'}</p>
            <p className="text-xs text-gray-400">JPG, PNG, WebP · Max 10MB</p>
          </>
        )}
        {uploading && (
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="h-1.5 bg-[#C9A84C] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
