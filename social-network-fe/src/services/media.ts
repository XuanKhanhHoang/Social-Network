import { UploadTempMediaResponseDto } from '@/lib/dtos';
import { ApiClient } from './api';

export const mediaService = {
  async uploadTempMedia(file: File): Promise<UploadTempMediaResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    return ApiClient.post<UploadTempMediaResponseDto>(
      '/media/upload-temp',
      formData
    );
  },
  async confirmMedia(tempId: string) {
    return ApiClient.post('/media/confirm', { tempId });
  },

  async cancelTempMedia(tempId: string) {
    return ApiClient.delete(`/media/temp/${tempId}`);
  },
};
