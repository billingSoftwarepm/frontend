import { api } from './api';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Uploads an image file to the backend and returns its public URL.
 * Optionally reports upload progress (0–100).
 */
export async function uploadImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<UploadResult>('/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return data;
}
