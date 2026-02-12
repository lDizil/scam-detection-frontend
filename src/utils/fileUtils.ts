/**
 * Формирует полный URL для файла из MinIO через бэкенд-прокси
 * @param filePath - относительный путь к файлу (например, "images/1739367808_photo.jpg")
 * @returns полный URL для доступа к файлу через бэкенд
 */
export const getFileUrl = (filePath: string | undefined): string | undefined => {
  if (!filePath) return undefined;
  
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
  
  const baseUrl = API_BASE_URL.replace(/\/api\/v1$/, '');
  
  return `${baseUrl}/api/v1/files/${filePath}`;
};
