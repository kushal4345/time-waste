// Cloudinary image and video upload module
const CLOUD_NAME = 'e62m7ab4';
const UPLOAD_PRESET = 'goluuu';

export async function uploadMedia(file, onProgress) {
  const isVideo = file.type.startsWith('video/');
  const endpoint = isVideo ? 'video/upload' : 'image/upload';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'chatttt');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}`);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          url: response.secure_url,
          thumbnail: isVideo ? response.secure_url : response.secure_url.replace('/upload/', '/upload/w_400,q_auto,f_auto/'),
          isVideo: isVideo,
          width: response.width,
          height: response.height
        });
      } else {
        reject(new Error('Upload failed'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.send(formData);
  });
}

export const uploadImage = uploadMedia;

// Compress image before upload for faster uploads on mobile
export function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    // If file is small enough, don't compress
    if (file.size < 500 * 1024) {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', quality);
    };

    img.src = URL.createObjectURL(file);
  });
}
