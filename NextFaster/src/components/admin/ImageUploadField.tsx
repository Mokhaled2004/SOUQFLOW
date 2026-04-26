'use client';

import { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  uploading: boolean;
  onFileChange: (file: File) => void;
  onUrlChange: (url: string) => void;
  locale: string;
}

export default function ImageUploadField({
  label,
  value,
  uploading,
  onFileChange,
  onUrlChange,
  locale,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{label}</label>

      {value && (
        <div className="mb-2 relative h-24 w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
          <img src={value} alt={label} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onUrlChange('')}
            className="absolute right-1 top-1 rounded-full bg-white/80 p-1 text-neutral-600 hover:bg-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-sky-400 hover:text-sky-600 disabled:opacity-50"
        >
          {uploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {locale === 'ar' ? 'رفع صورة' : 'Upload'}
        </button>

        <input
          type="text"
          value={value}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://..."
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileChange(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
