import { DeleteMediaResponseDto, UploadMediaResponseDto } from './media.dto';
import { ApiClient } from '@/services/api';

const MEDIA_PREFIX = '/medias';

export const mediaService = {
  async uploadMedia(file: File): Promise<UploadMediaResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    return ApiClient.post<UploadMediaResponseDto>(MEDIA_PREFIX, formData);
  },

  async deleteMedia(id: string): Promise<DeleteMediaResponseDto> {
    return ApiClient.delete<DeleteMediaResponseDto>(`${MEDIA_PREFIX}/${id}`);
  },
};
