
import { useState, useRef, useEffect } from 'react';
import { Upload, Camera, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  className?: string;
}

const ImageUploader = ({ onImageSelected, className }: ImageUploaderProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Clear selected image on component unmount
  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // In a real app, you would use this stream to capture an image
      // For this example, we'll just open the file picker
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } catch (error) {
      console.error('Camera access denied or not available:', error);
      // Fallback to file picker
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const processImage = (file: File) => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }

    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = () => {
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      onImageSelected(file);
      setIsLoading(false);
    };
    
    reader.onerror = () => {
      setIsLoading(false);
      console.error('Error reading file');
    };
    
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <AnimatePresence mode="wait">
        {!selectedImage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out",
                isDragging 
                  ? "border-diagnosphere-primary bg-diagnosphere-primary/5" 
                  : "border-white/20 hover:border-white/40",
                "flex flex-col items-center justify-center text-center"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 bg-diagnosphere-primary/10 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-diagnosphere-primary" />
              </div>
              <h3 className="font-medium text-white text-lg mb-2">Upload your skin image</h3>
              <p className="text-gray-400 text-sm mb-6 max-w-md">
                Drag and drop an image, or select an option below to upload a photo of the affected skin area
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  disabled={isLoading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Gallery
                </Button>
                <Button
                  type="button"
                  onClick={openCamera}
                  className="flex-1 bg-diagnosphere-primary hover:bg-diagnosphere-primary/90"
                  disabled={isLoading}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Camera
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-xl overflow-hidden border border-white/20 bg-white/5"
          >
            <img
              src={selectedImage}
              alt="Selected skin"
              className="w-full object-cover max-h-[400px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            <Button
              type="button"
              onClick={removeImage}
              className="absolute top-3 right-3 p-2 h-auto bg-black/60 hover:bg-black/80 rounded-full"
              variant="ghost"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white font-medium">Image uploaded successfully</p>
              <p className="text-gray-300 text-sm">You can now proceed to the next step</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;
