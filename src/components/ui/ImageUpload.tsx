'use client';

import { useRef, useState } from 'react';
import { clsx } from 'clsx';
import { uploadImage } from '@/lib/api-uploads';
import { errorMessage } from '@/lib/error-message';

interface ImageUploadProps {
  /** Current image URL (controlled). */
  value?: string;
  /** Called with the new URL after a successful upload or when cleared (''). */
  onChange: (url: string) => void;
  /** Optional label for the drop area. */
  hint?: string;
  /** Preview box height class, e.g. 'h-28'. */
  previewClassName?: string;
  /** Show the preview image on a white pad (useful for logos/signatures). */
  whitePad?: boolean;
}

/**
 * Reusable image picker with click-to-browse, drag-and-drop, live preview,
 * upload progress and a clear button. Uploads to the backend /uploads endpoint
 * and returns a public URL via onChange.
 */
export function ImageUpload({
  value,
  onChange,
  hint = 'PNG, JPG, WEBP or SVG · up to 5MB',
  previewClassName = 'h-28',
  whitePad = true,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setError(null);
    setProgress(0);
    try {
      const res = await uploadImage(file, setProgress);
      onChange(res.url);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setProgress(null);
    }
  }

  const uploading = progress !== null;

  return (
    <div>
      {value ? (
        <div className="flex items-start gap-4">
          <div
            className={clsx(
              'flex w-40 items-center justify-center overflow-hidden rounded-xl border border-surface-borderlt',
              whitePad ? 'bg-white p-2' : 'bg-surface-card2',
              previewClassName,
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="preview" className="max-h-full max-w-full object-contain" />
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-surface-borderlt bg-surface-card2 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-surface-border"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="block rounded-lg px-3 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={clsx(
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition',
            dragOver
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-surface-borderlt bg-surface-card2 hover:border-brand-500/50 hover:bg-surface-border/40',
          )}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-2 text-brand-400"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="text-sm font-medium text-slate-200">
            {uploading ? 'Uploading…' : 'Click to upload or drag & drop'}
          </p>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>
      )}

      {uploading && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-border">
          <div
            className="h-full bg-brand-gradient transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
