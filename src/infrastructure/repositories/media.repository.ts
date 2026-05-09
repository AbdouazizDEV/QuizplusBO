import type { UploadImageInput, UploadImageResult } from '@domain/entities/media';
import type { MediaRepository } from '@domain/ports/repositories';
import { apiClient } from '../http/api-client';
import { Endpoints } from '../http/endpoints';

interface UploadResp {
  ok: boolean;
  secure_url: string;
}

export class HttpMediaRepository implements MediaRepository {
  async uploadImage(input: UploadImageInput): Promise<UploadImageResult> {
    const res = await apiClient.post<UploadResp>(Endpoints.media.uploadImage, input);
    return { secure_url: res.secure_url };
  }
}

export const mediaRepository: MediaRepository = new HttpMediaRepository();
