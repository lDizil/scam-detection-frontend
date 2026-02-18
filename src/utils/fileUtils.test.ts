import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getFileUrl } from './fileUtils';

describe('fileUtils', () => {
  beforeEach(() => {
    // Сбрасываем переменные окружения перед каждым тестом
    vi.stubGlobal('import', {
      meta: {
        env: {
          VITE_API_URL: 'http://localhost:8080/api/v1',
        },
      },
    });
  });

  describe('getFileUrl', () => {
    it('должен возвращать undefined для undefined путей', () => {
      expect(getFileUrl(undefined)).toBe(undefined);
    });

    it('должен возвращать полный URL для относительных путей', () => {
      const result = getFileUrl('images/test.jpg');
      expect(result).toBe('http://localhost:8080/api/v1/files/images/test.jpg');
    });

    it('должен возвращать URL без изменений для абсолютных HTTP URL', () => {
      const url = 'http://example.com/image.jpg';
      expect(getFileUrl(url)).toBe(url);
    });

    it('должен возвращать URL без изменений для абсолютных HTTPS URL', () => {
      const url = 'https://example.com/image.jpg';
      expect(getFileUrl(url)).toBe(url);
    });

    it('должен правильно формировать URL для различных путей к файлам', () => {
      expect(getFileUrl('documents/doc.pdf')).toBe(
        'http://localhost:8080/api/v1/files/documents/doc.pdf'
      );
      expect(getFileUrl('videos/video.mp4')).toBe(
        'http://localhost:8080/api/v1/files/videos/video.mp4'
      );
    });

    it('должен обрабатывать пустую строку', () => {
      expect(getFileUrl('')).toBe(undefined);
    });

    it('должен использовать правильный базовый URL из переменной окружения', () => {
      const result = getFileUrl('test.jpg');
      expect(result).toContain('/api/v1/files/test.jpg');
    });
  });
});
