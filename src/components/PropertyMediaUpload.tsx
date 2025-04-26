
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Files, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PropertyMediaUploadProps {
  onUploadComplete: (urls: { photos: string[], video: string | null }) => void;
}

export const PropertyMediaUpload = ({ onUploadComplete }: PropertyMediaUploadProps) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    setIsUploading(true);
    setError(null);

    try {
      const files = Array.from(e.target.files);
      if (photos.length + files.length > 10) {
        throw new Error("Maximum 10 photos allowed");
      }

      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const fileName = `${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('property_media')
            .upload(`photos/${fileName}`, file);

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('property_media')
            .getPublicUrl(`photos/${fileName}`);

          return publicUrl;
        })
      );

      const newPhotos = [...photos, ...uploadedUrls];
      setPhotos(newPhotos);
      onUploadComplete({ photos: newPhotos, video });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error uploading photos");
    } finally {
      setIsUploading(false);
    }
  }, [photos, video, onUploadComplete]);

  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    setIsUploading(true);
    setError(null);

    try {
      const file = e.target.files[0];
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('property_media')
        .upload(`videos/${fileName}`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('property_media')
        .getPublicUrl(`videos/${fileName}`);

      setVideo(publicUrl);
      onUploadComplete({ photos, video: publicUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error uploading video");
    } finally {
      setIsUploading(false);
    }
  }, [photos, onUploadComplete]);

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Photos ({photos.length}/10)</h3>
          <Button
            type="button"
            variant="outline"
            disabled={isUploading || photos.length >= 10}
            className="relative"
          >
            <Files className="mr-2" />
            Add Photos
            <Input
              type="file"
              accept="image/*"
              multiple
              disabled={isUploading || photos.length >= 10}
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handlePhotoUpload}
            />
          </Button>
        </div>
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((url, index) => (
              <img
                key={url}
                src={url}
                alt={`Property photo ${index + 1}`}
                className="w-full h-24 object-cover rounded-md"
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Video {video ? "(1/1)" : "(0/1)"}</h3>
          <Button
            type="button"
            variant="outline"
            disabled={isUploading || !!video}
            className="relative"
          >
            <Upload className="mr-2" />
            Add Video
            <Input
              type="file"
              accept="video/*"
              disabled={isUploading || !!video}
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleVideoUpload}
            />
          </Button>
        </div>
        {video && (
          <video
            src={video}
            controls
            className="w-full max-h-48 object-contain rounded-md"
          />
        )}
      </div>
    </div>
  );
};
