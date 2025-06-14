// src/utils/formatters.ts

export const validateImageFormat = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      // Check the file signature (magic numbers)
      const arr = new Uint8Array(reader.result as ArrayBuffer);
      
      // JPEG starts with FF D8 FF
      const isJpeg = arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF;
      
      // PNG starts with 89 50 4E 47 (‰PNG)
      const isPng = arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47;
      
      // GIF starts with either "GIF87a" or "GIF89a"
      const isGif = 
        arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46 && 
        arr[3] === 0x38 && (arr[4] === 0x37 || arr[4] === 0x39) && 
        arr[5] === 0x61;
      
      // Check if the actual format matches the claimed extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'jpg' || extension === 'jpeg') {
        resolve(isJpeg);
      } else if (extension === 'png') {
        resolve(isPng);
      } else if (extension === 'gif') {
        resolve(isGif);
      } else {
        resolve(false);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    // Read the first few bytes of the file to check its signature
    reader.readAsArrayBuffer(file.slice(0, 10));
  });
};