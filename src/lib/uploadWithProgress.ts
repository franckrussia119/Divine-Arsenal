import { getToken } from './api';

interface UploadOptions {
  onProgress?: (percent: number) => void;
}

/** Uploads a file with real progress events (fetch() can't do this — XHR can). */
export function uploadFile<T = any>(
  url: string,
  fieldName: string,
  file: File,
  options: UploadOptions = {}
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    const token = getToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options.onProgress) {
        options.onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let data: any = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // non-JSON response
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as T);
      } else {
        reject(new Error(data?.error || `Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));

    const formData = new FormData();
    formData.append(fieldName, file);
    xhr.send(formData);
  });
}
