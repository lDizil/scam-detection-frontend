import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { FileText, Image, Video, Upload, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import { toast } from "sonner";
import { contentApi, type TextAnalysisResponse, type UrlAnalysisResponse, type ImageAnalysisResponse, type VideoAnalysisResponse } from '../api/content';
import { getFileUrl } from '../utils/fileUtils';

interface AnalysisResult {
  checkId: number;
  content: string;
  confidence: number;
  isScam: boolean;
  label: string;
  timestamp: string;
  processingTime: number;
  reasons?: string[];
  verdict?: string;
  extractedText?: string;
  transcription?: string;
  filePath?: string;
}

export function ContentAnalyzer() {
  const [activeType, setActiveType] = useState<'text' | 'image' | 'video' | 'url'>('text');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentTypes = [
    { type: 'text' as const, label: 'Текст', icon: FileText },
    { type: 'image' as const, label: 'Изображение', icon: Image },
    { type: 'video' as const, label: 'Видео', icon: Video },
    { type: 'url' as const, label: 'URL', icon: Upload },
  ];

  const handleAnalyze = async () => {
    if (activeType === 'image') {
      if (!file) {
        toast.error('Загрузите изображение для анализа');
        return;
      }
    } else if (activeType === 'video') {
      if (!file) {
        toast.error('Загрузите видео для анализа');
        return;
      }
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Файл слишком большой', {
          description: 'Максимальный размер видео: 50MB'
        });
        return;
      }
    } else if (!content.trim()) {
      toast.error(activeType === 'url' ? 'Введите URL для проверки' : 'Введите текст для анализа');
      return;
    }

    if (activeType === 'url') {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
      const isValidUrl = urlPattern.test(content.trim());
      
      if (!isValidUrl) {
        try {
          new URL(content.trim().startsWith('http') ? content.trim() : `https://${content.trim()}`);
        } catch {
          toast.error('Пожалуйста, введите корректный URL адрес', {
            description: 'Например: https://example.com или example.com'
          });
          return;
        }
      }
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      if (activeType === 'video' && file) {
        const response: VideoAnalysisResponse = await contentApi.analyzeVideo(file);
        
        if (!response.transcription) {
          toast.warning('Речь не обнаружена в видео');
          setIsAnalyzing(false);
          return;
        }
        
        const isScamContent = response.prediction.is_scam || response.prediction.label === 'phishing';
        
        let filePath: string | undefined;
        try {
          const checkDetails = await contentApi.getCheckDetails(response.check_id);
          filePath = checkDetails.file_path;
        } catch (error) {
          console.warn('Failed to fetch file_path from MinIO:', error);
        }
        
        const analysisResult: AnalysisResult = {
          checkId: response.check_id,
          content: file.name,
          transcription: response.transcription,
          confidence: response.prediction.confidence,
          isScam: isScamContent,
          label: response.prediction.label,
          timestamp: new Date().toISOString(),
          processingTime: response.processing_time,
          filePath
        };

        setResult(analysisResult);
        
        if (isScamContent) {
          toast.error('Обнаружен мошеннический контент в видео!');
        } else {
          toast.success('Видео безопасно');
        }
      } else if (activeType === 'image' && file) {
        const response: ImageAnalysisResponse = await contentApi.analyzeImage(file);
        
        if (!response.extracted_text) {
          toast.warning('Текст не обнаружен на изображении');
          setIsAnalyzing(false);
          return;
        }
        
        const isScamContent = response.prediction.is_scam || response.prediction.label === 'phishing';
        
        let filePath: string | undefined;
        try {
          const checkDetails = await contentApi.getCheckDetails(response.check_id);
          filePath = checkDetails.file_path;
        } catch (error) {
          console.warn('Failed to fetch file_path from MinIO:', error);
        }
        
        const analysisResult: AnalysisResult = {
          checkId: response.check_id,
          content: file.name,
          extractedText: response.extracted_text,
          confidence: response.prediction.confidence,
          isScam: isScamContent,
          label: response.prediction.label,
          timestamp: new Date().toISOString(),
          processingTime: response.processing_time,
          filePath
        };

        setResult(analysisResult);
        
        if (isScamContent) {
          toast.error('Обнаружен мошеннический контент на изображении!');
        } else {
          toast.success('Изображение безопасно');
        }
      } else if (activeType === 'url') {
        const response: UrlAnalysisResponse = await contentApi.analyzeUrl(content);
        
        const isScamContent = response.verdict === 'malicious' || response.verdict === 'phishing';
        
        const analysisResult: AnalysisResult = {
          checkId: response.check_id,
          content: response.url,
          confidence: response.confidence,
          isScam: isScamContent,
          label: response.verdict,
          verdict: response.verdict,
          reasons: response.reasons,
          timestamp: response.checked_at,
          processingTime: 0
        };

        setResult(analysisResult);
        
        if (isScamContent) {
          toast.error('Обнаружена опасная ссылка!');
        } else {
          toast.success('Ссылка безопасна');
        }
      } else {
        const response: TextAnalysisResponse = await contentApi.analyzeText(content);

        if (response.success) {
          const isScamContent = response.prediction.is_scam || response.prediction.label === 'phishing';
          
          const analysisResult: AnalysisResult = {
            checkId: response.check_id,
            content: content,
            confidence: response.prediction.confidence,
            isScam: isScamContent,
            label: response.prediction.label,
            timestamp: new Date().toISOString(),
            processingTime: response.processing_time
          };

          setResult(analysisResult);
          
          if (isScamContent) {
            toast.error('Обнаружен мошеннический контент!');
          } else {
            toast.success('Контент безопасен');
          }
        }
      }
    } catch (error) {
      const err = error as { response?: { status?: number; data?: { error?: string } } };
      console.error('Analysis error:', error);
      
      if (err.response?.status === 401) {
        toast.error('Необходима авторизация');
      } else if (err.response?.status === 400) {
        toast.error('Ошибка валидации', {
          description: err.response?.data?.error || 'Неподдерживаемый формат или превышен лимит размера'
        });
      } else if (err.response?.status === 500 && activeType === 'video') {
        toast.error('Ошибка обработки видео', {
          description: 'Не удалось обработать видео. Попробуйте другой файл.'
        });
      } else if ((err as { request?: unknown }).request) {
        toast.error('Не удалось подключиться к серверу');
      } else {
        toast.error(err.response?.data?.error || 'Ошибка при анализе контента');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskScore = (confidence: number) => {
    return Math.round(confidence * 100);
  };

  const getDangerLevel = (isScam: boolean, confidence: number) => {
    const score = confidence * 100;
    
    if (isScam) {
      if (score >= 90) return { level: 'critical', text: 'Критическая неудача', color: 'bg-red-600 text-white border-2 border-red-700 font-bold shadow-md' };
      if (score >= 70) return { level: 'high', text: 'Высокая опасность', color: 'bg-red-500 text-white' };
      if (score >= 50) return { level: 'medium', text: 'Средняя опасность', color: 'bg-orange-500 text-white' };
      return { level: 'low', text: 'Низкая опасность', color: 'bg-yellow-500 text-white' };
    } else {
      if (score >= 99) return { level: 'perfect', text: 'Критическая удача', color: 'bg-green-600 text-white border-2 border-green-700 font-bold shadow-md' };
      if (score >= 90) return { level: 'safe', text: 'Безопасно', color: 'bg-green-600 text-white' };
      if (score >= 70) return { level: 'likely-safe', text: 'Вероятно безопасно', color: 'bg-green-500 text-white' };
      return { level: 'uncertain', text: 'Требует проверки', color: 'bg-yellow-500 text-white' };
    }
  };

  const getRiskColor = (label: string, confidence: number) => {
    const score = confidence * 100;
    if (label === 'legitimate') {
      if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
      if (score >= 70) return 'text-green-600 bg-green-50 border-green-200';
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    if (score >= 90) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getStatusBadge = (label: string) => {
    if (label === 'legitimate') return 'bg-green-100 text-green-800';
    if (label === 'malicious') return 'bg-red-100 text-red-800';
    if (label === 'phishing') return 'bg-red-100 text-red-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (label: string) => {
    if (label === 'legitimate') return 'Легитимный контент';
    if (label === 'phishing') return 'Фишинг';
    if (label === 'malicious') return 'Вредоносный контент';
    return label;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (activeType === 'image') {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
        if (!allowedTypes.includes(selectedFile.type)) {
          toast.error('Неподдерживаемый формат', {
            description: 'Поддерживаются: JPG, PNG, BMP, TIFF'
          });
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
        setVideoPreview(null);
      } else if (activeType === 'video') {
        const allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska', 'video/webm'];
        const allowedExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm'];
        const fileName = selectedFile.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
        
        if (!allowedTypes.includes(selectedFile.type) && !hasValidExtension) {
          toast.error('Неподдерживаемый формат', {
            description: 'Поддерживаются: MP4, AVI, MOV, MKV, WEBM'
          });
          return;
        }
        
        const maxSize = 50 * 1024 * 1024;
        if (selectedFile.size > maxSize) {
          toast.error('Файл слишком большой', {
            description: 'Максимальный размер видео: 50MB'
          });
          return;
        }
        
        const videoUrl = URL.createObjectURL(selectedFile);
        setVideoPreview(videoUrl);
        setImagePreview(null);
      }
      
      setFile(selectedFile);
      setContent('');
    }
  };

  useEffect(() => {
    if (activeType === 'image') {
      const handleGlobalPaste = (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: blob.type });
              setFile(file);
              
              const reader = new FileReader();
              reader.onloadend = () => {
                setImagePreview(reader.result as string);
              };
              reader.readAsDataURL(file);
              
              toast.success('Изображение вставлено из буфера обмена');
            }
            break;
          }
        }
      };
      
      window.addEventListener('paste', handleGlobalPaste);
      return () => window.removeEventListener('paste', handleGlobalPaste);
    }
  }, [activeType]);

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg mb-4 block font-semibold">Тип контента для анализа</Label>
        <div className="grid grid-cols-4 gap-3">
          {contentTypes.map(({ type, label, icon: Icon }) => (
            <Button
              key={type}
              variant={activeType === type ? 'default' : 'outline'}
              onClick={() => {
                setActiveType(type);
                setContent('');
                setFile(null);
                setImagePreview(null);
                setVideoPreview(null);
                setResult(null);
              }}
              className={`h-auto py-4 flex-col space-y-2 transition-all ${
                activeType === type 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500' 
                  : 'bg-white hover:bg-blue-50 border-2 hover:border-blue-300'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-sm font-medium">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {activeType === 'text' && (
          <div className="space-y-2">
            <Label htmlFor="text-content" className="text-base">Текст для анализа</Label>
            <Textarea
              id="text-content"
              placeholder="Вставьте текст, который нужно проверить на мошенничество..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32"
            />
          </div>
        )}

        {activeType === 'url' && (
          <div className="space-y-2">
            <Label htmlFor="url-content" className="text-base">URL адрес</Label>
            <Input
              id="url-content"
              type="url"
              placeholder="https://example.com или example.com"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              Введите корректный URL адрес для проверки (например: https://example.com)
            </p>
          </div>
        )}

        {(activeType === 'image' || activeType === 'video') && (
          <div className="space-y-3">
            <Label htmlFor="file-upload" className="text-base">
              Загрузить {activeType === 'image' ? 'изображение' : 'видео'}
            </Label>
            <Input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept={activeType === 'image' ? 'image/jpeg,image/jpg,image/png,image/bmp,image/tiff' : 'video/*'}
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {activeType === 'image' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Совет:</strong> Нажмите <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs">Ctrl+V</kbd> чтобы вставить изображение из буфера обмена (например, скриншот)
                  </span>
                </p>
              </div>
            )}
            {activeType === 'video' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800 flex items-start gap-2">
                  <Video className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Ограничения:</strong> Макс. размер 50MB, длительность до 5 минут. Форматы: MP4, AVI, MOV, MKV, WEBM. Обработка может занять 5-15 секунд.
                  </span>
                </p>
              </div>
            )}
            {imagePreview && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Предпросмотр:</p>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-w-full max-h-64 rounded-lg border-2 border-gray-200 object-contain"
                />
              </div>
            )}
            {videoPreview && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Предпросмотр видео:</p>
                <video 
                  src={videoPreview} 
                  controls
                  className="max-w-full max-h-64 rounded-lg border-2 border-gray-200"
                />
              </div>
            )}
            {file && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Выбран файл: <strong>{file.name}</strong></span>
              </p>
            )}
          </div>
        )}
      </div>

      <Button 
        onClick={handleAnalyze} 
        disabled={isAnalyzing || ((activeType === 'image' || activeType === 'video') ? !file : !content.trim())}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            Анализ в процессе...
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Анализировать контент
          </>
        )}
      </Button>

      {result && (
        <Card className={`border-2 ${getRiskColor(result.verdict || result.label, result.confidence)}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl">Результат анализа</span>
              <Badge className={getStatusBadge(result.verdict || result.label)} style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}>
                {((result.verdict === 'legitimate' || result.label === 'legitimate') && <CheckCircle className="h-4 w-4 mr-1.5" />)}
                {((result.verdict === 'phishing' || result.verdict === 'malicious' || result.label === 'phishing') && <AlertTriangle className="h-4 w-4 mr-1.5" />)}
                {getStatusText(result.verdict || result.label)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-700">Оценка угрозы</span>
                <Badge className={`${getDangerLevel(result.isScam, result.confidence).color} text-base px-4 py-2`}>
                  {getDangerLevel(result.isScam, result.confidence).text}
                </Badge>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-base font-semibold text-gray-700">Уверенность {result.verdict ? 'проверки' : 'модели'}</span>
                <span className="text-2xl font-bold text-gray-900">{getRiskScore(result.confidence)}%</span>
              </div>
              <Progress value={getRiskScore(result.confidence)} className="h-3" />
              
              {getRiskScore(result.confidence) < 70 && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    <strong>Внимание:</strong> {result.verdict ? 'Проверка' : 'Модель'} не полностью уверена в результате. 
                    Рекомендуется дополнительная проверка и осторожность при принятии решений.
                  </p>
                </div>
              )}
            </div>

            {result.reasons && result.reasons.length > 0 && (
              <div>
                <Label className="text-base mb-3 block font-semibold text-gray-700">Детали проверки:</Label>
                <div className="space-y-2">
                  {result.reasons.map((reason, index) => {
                    const isClean = reason.includes('clean') || reason.includes('not_found');
                    return (
                      <div 
                        key={index} 
                        className={`${
                          isClean 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        } border rounded-lg p-3 flex items-start`}
                      >
                        <Shield className={`h-5 w-5 ${isClean ? 'text-green-600' : 'text-red-600'} mr-2 mt-0.5 flex-shrink-0`} />
                        <p className={`text-sm ${isClean ? 'text-green-900' : 'text-red-900'}`}>
                          {reason === 'not_found_in_blacklists' ? '✓ URL не найден в базах вредоносных сайтов' :
                           reason === 'urlhaus_database' ? '⚠ URL найден в базе URLhaus (вредоносный)' :
                           reason === 'domain_heuristics' ? '⚠ Обнаружены подозрительные признаки домена' :
                           reason === 'all_checks_failed' ? '⚠ Не удалось выполнить проверку' :
                           reason === 'invalid_url_format' ? '⚠ Некорректный формат URL' :
                           reason}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>Проверено через: URLhaus API, эвристический анализ домена</span>
                </div>
              </div>
            )}

            {result.extractedText && (
              <div>
                <Label className="text-base mb-2 block font-semibold text-gray-700">Извлеченный текст из изображения:</Label>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {result.extractedText}
                  </p>
                </div>
                {result.filePath && (
                  <div className="mt-4">
                    <Label className="text-base mb-2 block font-semibold text-gray-700">Загруженное изображение:</Label>
                    <img 
                      src={getFileUrl(result.filePath)} 
                      alt="Проанализированное изображение" 
                      className="max-w-full max-h-96 rounded-lg border-2 border-gray-300 object-contain shadow-md"
                      onError={(e) => {
                        console.error('Failed to load image:', getFileUrl(result.filePath));
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {result.transcription && (
              <div>
                <Label className="text-base mb-2 block font-semibold text-gray-700">Распознанная речь из видео:</Label>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {result.transcription}
                  </p>
                </div>
                {result.filePath && (
                  <div className="mt-4">
                    <Label className="text-base mb-2 block font-semibold text-gray-700">Загруженное видео:</Label>
                    <video 
                      src={getFileUrl(result.filePath)} 
                      controls
                      className="max-w-full max-h-96 rounded-lg border-2 border-gray-300 shadow-md"
                      onError={(e) => {
                        console.error('Failed to load video:', getFileUrl(result.filePath));
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <div>
              <Label className="text-base mb-2 block font-semibold text-gray-700">
                {(result.extractedText || result.transcription) ? 'Имя файла:' : result.verdict ? 'Проверенный URL:' : 'Проверенный текст:'}
              </Label>
              <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto border border-gray-200 break-all">
                {result.content}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Время обработки:</span>
                <span className="font-medium text-gray-900">{result.processingTime.toFixed(3)}с</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ID проверки:</span>
                <span className="font-medium text-gray-900">#{result.checkId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Проверено:</span>
                <span className="font-medium text-gray-900">{new Date(result.timestamp).toLocaleString('ru-RU')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}