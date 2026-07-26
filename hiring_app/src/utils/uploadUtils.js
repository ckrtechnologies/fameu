import { Platform } from 'react-native';
import { API_URL_ANDROID, API_URL_IOS } from '@env';

export const BASE_URL = Platform.OS === 'android' ? API_URL_ANDROID : API_URL_IOS;

export const uploadFileWithProgress = (endpoint, formData, onProgress, token) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${BASE_URL}${endpoint}`;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (e) {
          resolve(xhr.responseText);
        }
      } else {
        try {
          const errorResp = JSON.parse(xhr.responseText);
          reject(new Error(errorResp.message || `Upload failed with status ${xhr.status}`));
        } catch (e) {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network request failed'));
    };

    xhr.open('POST', url, true);
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    // Note: Do not set Content-Type for FormData, XHR does it automatically with boundaries
    xhr.send(formData);
  });
};
