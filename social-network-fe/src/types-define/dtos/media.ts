export type UploadTempMediaResponseDto = {
  id: string;
  url: string;
  mediaType: string;
  expiresAt: Date;
  message: string;
};
