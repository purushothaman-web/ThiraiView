import React, { useState, useRef, useCallback } from 'react';

const ImageCropper = ({ 
  onCrop, 
  onCancel, 
  aspectRatio = 1, 
  minWidth = 100, 
  minHeight = 100,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8,
  type = 'image/jpeg'
}) => {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImage(e.target.result);
          
          // Initialize crop area
          const containerWidth = 400;
          const containerHeight = 400;
          const imageAspectRatio = img.width / img.height;
          const containerAspectRatio = containerWidth / containerHeight;
          
          let cropWidth, cropHeight;
          if (imageAspectRatio > containerAspectRatio) {
            cropHeight = containerHeight;
            cropWidth = cropHeight * aspectRatio;
          } else {
            cropWidth = containerWidth;
            cropHeight = cropWidth / aspectRatio;
          }
          
          setCrop({
            x: (containerWidth - cropWidth) / 2,
            y: (containerHeight - cropHeight) / 2,
            width: cropWidth,
            height: cropHeight
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }, [aspectRatio]);

  const handleMouseDown = useCallback((event) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if clicking on resize handle
    const handleSize = 8;
    const handles = [
      { name: 'nw', x: crop.x - handleSize/2, y: crop.y - handleSize/2 },
      { name: 'ne', x: crop.x + crop.width - handleSize/2, y: crop.y - handleSize/2 },
      { name: 'sw', x: crop.x - handleSize/2, y: crop.y + crop.height - handleSize/2 },
      { name: 'se', x: crop.x + crop.width - handleSize/2, y: crop.y + crop.height - handleSize/2 },
    ];
    
    const clickedHandle = handles.find(handle => 
      x >= handle.x && x <= handle.x + handleSize &&
      y >= handle.y && y <= handle.y + handleSize
    );
    
    if (clickedHandle) {
      setIsResizing(true);
      setResizeHandle(clickedHandle.name);
    } else if (x >= crop.x && x <= crop.x + crop.width && y >= crop.y && y <= crop.y + crop.height) {
      setIsDragging(true);
    }
    
    setDragStart({ x, y });
  }, [crop]);

  const handleMouseMove = useCallback((event) => {
    if (!isDragging && !isResizing) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    
    if (isDragging) {
      setCrop(prev => ({
        ...prev,
        x: Math.max(0, Math.min(400 - prev.width, prev.x + deltaX)),
        y: Math.max(0, Math.min(400 - prev.height, prev.y + deltaY))
      }));
    } else if (isResizing) {
      setCrop(prev => {
        let newCrop = { ...prev };
        
        switch (resizeHandle) {
          case 'nw':
            newCrop.x = Math.max(0, prev.x + deltaX);
            newCrop.y = Math.max(0, prev.y + deltaY);
            newCrop.width = Math.max(minWidth, prev.width - deltaX);
            newCrop.height = Math.max(minHeight, prev.height - deltaY);
            break;
          case 'ne':
            newCrop.y = Math.max(0, prev.y + deltaY);
            newCrop.width = Math.max(minWidth, prev.width + deltaX);
            newCrop.height = Math.max(minHeight, prev.height - deltaY);
            break;
          case 'sw':
            newCrop.x = Math.max(0, prev.x + deltaX);
            newCrop.width = Math.max(minWidth, prev.width - deltaX);
            newCrop.height = Math.max(minHeight, prev.height + deltaY);
            break;
          case 'se':
            newCrop.width = Math.max(minWidth, prev.width + deltaX);
            newCrop.height = Math.max(minHeight, prev.height + deltaY);
            break;
        }
        
        // Maintain aspect ratio
        if (aspectRatio) {
          const newAspectRatio = newCrop.width / newCrop.height;
          if (Math.abs(newAspectRatio - aspectRatio) > 0.01) {
            if (resizeHandle === 'se' || resizeHandle === 'nw') {
              newCrop.height = newCrop.width / aspectRatio;
            } else {
              newCrop.width = newCrop.height * aspectRatio;
            }
          }
        }
        
        return newCrop;
      });
    }
    
    setDragStart({ x, y });
  }, [isDragging, isResizing, dragStart, resizeHandle, minWidth, minHeight, aspectRatio]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  const handleCrop = useCallback(() => {
    if (!image || !crop.width || !crop.height) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Calculate scale factors
      const scaleX = img.width / 400;
      const scaleY = img.height / 400;
      
      // Set canvas size to crop size
      canvas.width = crop.width * scaleX;
      canvas.height = crop.height * scaleY;
      
      // Draw cropped image
      ctx.drawImage(
        img,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          onCrop(blob);
        }
      }, type, quality);
    };
    img.src = image;
  }, [image, crop, onCrop, type, quality]);

  const handleReset = useCallback(() => {
    setImage(null);
    setCrop({ x: 0, y: 0, width: 0, height: 0 });
  }, []);

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };
    
    const handleGlobalMouseMove = (event) => {
      if (isDragging || isResizing) {
        handleMouseMove(event);
      }
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove]);

  if (!image) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">📷</div>
          <p className="text-gray-600 mb-4">Select an image to crop</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
          >
            Choose Image
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          ref={containerRef}
          className="relative w-96 h-96 mx-auto border border-gray-300 overflow-hidden"
          onMouseDown={handleMouseDown}
        >
          <img
            ref={imageRef}
            src={image}
            alt="Crop preview"
            className="w-full h-full object-contain"
            draggable={false}
          />
          
          {/* Crop overlay */}
          <div
            className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 cursor-move"
            style={{
              left: crop.x,
              top: crop.y,
              width: crop.width,
              height: crop.height,
            }}
          >
            {/* Resize handles */}
            {['nw', 'ne', 'sw', 'se'].map((handle) => (
              <div
                key={handle}
                className={`absolute w-2 h-2 bg-blue-500 border border-white ${
                  handle === 'nw' ? '-top-1 -left-1 cursor-nw-resize' :
                  handle === 'ne' ? '-top-1 -right-1 cursor-ne-resize' :
                  handle === 'sw' ? '-bottom-1 -left-1 cursor-sw-resize' :
                  '-bottom-1 -right-1 cursor-se-resize'
                }`}
              />
            ))}
          </div>
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none">
            <div
              className="absolute bg-transparent"
              style={{
                left: crop.x,
                top: crop.y,
                width: crop.width,
                height: crop.height,
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCrop}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Crop & Save
        </button>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCropper;
