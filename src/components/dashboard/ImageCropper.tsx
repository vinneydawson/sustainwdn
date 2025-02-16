
import React, { useState } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
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

export function ImageCropper({
  imageUrl,
  aspect = 1,
  onCropComplete,
  isOpen,
  onClose
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  const onImageLoad = (image: HTMLImageElement) => {
    setImageRef(image);
    
    // Set initial centered crop
    const width = Math.min(90, (image.width / image.height) * 90);
    const height = Math.min(90, (image.height / image.width) * 90);
    const x = (100 - width) / 2;
    const y = (100 - height) / 2;
    
    setCrop({
      unit: '%',
      width,
      height,
      x,
      y
    });
  };

  const getCroppedImg = () => {
    if (!imageRef) return;

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.naturalWidth / imageRef.width;
    const scaleY = imageRef.naturalHeight / imageRef.height;
    canvas.width = crop.width! * scaleX;
    canvas.height = crop.height! * scaleY;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      imageRef,
      crop.x! * scaleX,
      crop.y! * scaleY,
      crop.width! * scaleX,
      crop.height! * scaleY,
      0,
      0,
      crop.width! * scaleX,
      crop.height! * scaleY
    );

    canvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
        onClose();
      }
    }, 'image/jpeg', 0.95);
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
            onChange={(c) => setCrop(c)}
            aspect={aspect}
            circularCrop
          >
            <img
              ref={setImageRef}
              src={imageUrl}
              alt="Crop me"
              className="max-h-[60vh] object-contain"
              onLoad={(e) => onImageLoad(e.currentTarget)}
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
