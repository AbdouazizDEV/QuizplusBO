import { useMutation } from '@tanstack/react-query';
import { mediaRepository } from '@infrastructure/repositories/media.repository';

export function useUploadImage() {
  return useMutation({
    mutationFn: async (vars: { file: File; ownerId: string }) => {
      const base64 = await fileToBase64(vars.file);
      return mediaRepository.uploadImage({
        image_base64: base64,
        owner_id: vars.ownerId,
      });
    },
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const idx = result.indexOf(',');
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
