export type UploadTempMediaResponseDto = {
  id: string;
  url: string;
  mediaType: string;
  expiresAt: Date;
  message: string;
};

export type MediaItem = {
  id: string;
  mediaType: string;
  url: string;
};
