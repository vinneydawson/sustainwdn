
import React, { useState } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ImageCropperProps {
  imageUrl: string;
  aspect?: number;
  onCropComplete: (croppedImageBlob: Blob) => void;
  isOpen: boolean;
  onClose: () => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export function ImageCropper({
  imageUrl,
  aspect = 1,
  onCropComplete,
  isOpen,
  onClose
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setImageRef(e.currentTarget);
    setCrop(centerAspectCrop(width, height, aspect));
  };

  const getCroppedImg = () => {
    if (!imageRef || !crop) return;

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.naturalWidth / imageRef.width;
    const scaleY = imageRef.naturalHeight / imageRef.height;

    // Calculate the actual crop dimensions
    const cropWidth = (crop.width * imageRef.width * scaleX) / 100;
    const cropHeight = (crop.height * imageRef.height * scaleY) / 100;
    const cropX = (crop.x * imageRef.width * scaleX) / 100;
    const cropY = (crop.y * imageRef.height * scaleY) / 100;

    // Set canvas dimensions to match the cropped area
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set the background to white (this prevents transparency becoming black)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the cropped image
    ctx.drawImage(
      imageRef,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // Convert to blob with JPEG format
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
          onClose();
        }
      },
      'image/jpeg',
      1 // Maximum quality
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Crop your photo</DialogTitle>
          <DialogDescription>
            Drag the crop area to adjust your profile photo, or leave it as is to use the default crop.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            aspect={aspect}
            circularCrop
            minWidth={100}
          >
            <img
              ref={setImageRef}
              src={imageUrl}
              alt="Crop me"
              className="max-h-[60vh] object-contain"
              onLoad={onImageLoad}
            />
          </ReactCrop>
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={getCroppedImg}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
