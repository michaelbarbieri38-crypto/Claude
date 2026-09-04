export function isImageType(mime: string): boolean {
  return mime.startsWith('image/');
}

export function isPdfType(mime: string): boolean {
  return mime === 'application/pdf';
}

export function isAcceptedFile(file: File): boolean {
  return isImageType(file.type) || isPdfType(file.type);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Object URLs created for attachment previews. We keep a small cache keyed by
// attachment id so the same blob doesn't get re-encoded into a new URL (and a
// new memory allocation) on every render.
const urlCache = new Map<string, string>();

export function getObjectURL(id: string, blob: Blob): string {
  let url = urlCache.get(id);
  if (!url) {
    url = URL.createObjectURL(blob);
    urlCache.set(id, url);
  }
  return url;
}

export function revokeObjectURL(id: string): void {
  const url = urlCache.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(id);
  }
}

export function extractFilesFromDataTransfer(dt: DataTransfer): File[] {
  const files: File[] = [];
  if (dt.items && dt.items.length) {
    for (let i = 0; i < dt.items.length; i++) {
      const item = dt.items[i];
      if (item.kind === 'file') {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }
  } else if (dt.files) {
    for (let i = 0; i < dt.files.length; i++) files.push(dt.files[i]);
  }
  return files.filter(isAcceptedFile);
}
