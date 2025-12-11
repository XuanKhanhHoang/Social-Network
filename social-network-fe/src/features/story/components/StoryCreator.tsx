import React, { useState, useRef, ChangeEvent } from 'react';
import { X, Image, Video, Plus, Type } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createPortal } from 'react-dom';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MediaType = 'image' | 'video' | null;
type Privacy = 'public' | 'friends';

const StoryCreator: React.FC<CreateStoryModalProps> = ({ isOpen, onClose }) => {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>(null);
  const [caption, setCaption] = useState<string>('');
  const [privacy, setPrivacy] = useState<Privacy>('public');
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showCaptionInput, setShowCaptionInput] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_VIDEO_SIZE = 20 * 1024 * 1024;
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
  const MAX_CAPTION_LENGTH = 200;

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Vui lòng chọn file ảnh hoặc video');
      return;
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      setError('Video không được vượt quá 20MB');
      return;
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      setError('Ảnh không được vượt quá 10MB');
      return;
    }

    setMediaFile(file);
    setMediaType(isImage ? 'image' : 'video');

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setError('');
    setCaption('');
    setShowCaptionInput(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCaptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CAPTION_LENGTH) {
      setCaption(value);
    }
  };

  const handleCreateStory = async () => {
    if (!mediaFile) {
      setError('Vui lòng chọn ảnh hoặc video');
      return;
    }

    setIsUploading(true);

    setTimeout(() => {
      console.log('Creating story:', {
        media: mediaFile,
        mediaType,
        caption: caption.trim(),
        privacy,
      });
      setIsUploading(false);
      onClose();
      handleRemoveMedia();
      setPrivacy('public');
    }, 1500);
  };

  return (
    <>
      {createPortal(
        <button className="w-8 h-8 rounded-full flex items-center justify-center transition-colors fixed top-3 right-3 p-0 z-[99999] pointer-events-auto cursor-pointer">
          <X size={24} strokeWidth={2.3} color="white" />
        </button>,
        document.body
      )}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-lg h-[95vh] max-h-[800px] p-0 bg-black border-0 overflow-hidden"
          showCloseButton={false}
        >
          <div className="h-full flex items-center justify-center overflow-hidden">
            {!mediaPreview ? (
              <div className="text-center px-8 py-20">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="mx-auto mb-6 w-24 h-24 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full border-2 border-dashed border-white/30"
                >
                  <Plus className="w-12 h-12 text-white" />
                </Button>

                <DialogTitle className="text-white text-xl font-semibold mb-2">
                  Thêm vào story
                </DialogTitle>
                <p className="text-white/70 text-sm mb-6">
                  Chia sẻ ảnh hoặc video
                </p>

                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                  >
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image className="w-5 h-5 mr-2" />
                    Ảnh
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Video
                  </Button>
                </div>

                {error && (
                  <Alert
                    variant="destructive"
                    className="mt-4 bg-red-500/20 border-red-500/50"
                  >
                    <AlertDescription className="text-red-200">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <p className="text-white/50 text-xs mt-4">
                  Ảnh tối đa 10MB • Video tối đa 20MB
                </p>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <div className="w-full h-full flex items-center justify-center bg-black">
                  {mediaType === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaPreview}
                      alt="Story preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <video
                      src={mediaPreview}
                      controls
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>

                {showCaptionInput && (
                  <div className="absolute bottom-28 left-0 right-0 px-4">
                    <div className="relative bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 rounded-2xl">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowCaptionInput(false)}
                        className="absolute top-2 right-2 h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full border border-white/30 text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Textarea
                        value={caption}
                        onChange={handleCaptionChange}
                        placeholder="Viết caption..."
                        autoFocus
                        rows={3}
                        className="bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 resize-none focus-visible:ring-white/50"
                      />
                      <div className="text-right mt-1 text-xs text-white/60 pr-2">
                        {caption.length}/{MAX_CAPTION_LENGTH}
                      </div>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-20 left-0 right-0 px-4 flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCaptionInput(!showCaptionInput)}
                    className={`backdrop-blur-sm hover:bg-white/30 rounded-full border border-white/30 text-white ${
                      showCaptionInput ? 'bg-white/30' : 'bg-white/20'
                    }`}
                  >
                    <Type className="w-5 h-5" />
                  </Button>

                  <Select
                    value={privacy}
                    onValueChange={(v) => setPrivacy(v as Privacy)}
                  >
                    <SelectTrigger className="w-auto h-auto p-3 bg-white/20 backdrop-blur-sm text-white border-white/30 rounded-full hover:bg-white/30">
                      <SelectValue placeholder="🌐" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">🌐 Công khai</SelectItem>
                      <SelectItem value="friends">👥 Bạn bè</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveMedia}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full border border-white/30 text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {mediaPreview && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              <Button
                onClick={handleCreateStory}
                disabled={isUploading}
                className="w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-full shadow-lg"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Đang chia sẻ...
                  </>
                ) : (
                  'Chia sẻ lên story'
                )}
              </Button>
            </div>
          )}
        </DialogContent>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </Dialog>
    </>
  );
};

export default StoryCreator;
