import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { FileText, Image, Video, Upload, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { toast } from "sonner";
import { contentApi, type TextAnalysisResponse } from '../api/content';

interface ContentAnalyzerProps {
  userId: string;
}

interface AnalysisResult {
  checkId: number;
  content: string;
  confidence: number;
  isScam: boolean;
  label: string;
  timestamp: string;
  processingTime: number;
}

export function ContentAnalyzer({ }: ContentAnalyzerProps) {
  const [activeType, setActiveType] = useState<'text' | 'image' | 'video' | 'url'>('text');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const contentTypes = [
    { type: 'text' as const, label: 'Текст', icon: FileText },
    { type: 'image' as const, label: 'Изображение', icon: Image },
    { type: 'video' as const, label: 'Видео', icon: Video },
    { type: 'url' as const, label: 'URL', icon: Upload },
  ];

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast.error('Введите текст для анализа');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
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
    } catch (error: any) {
      console.error('Analysis error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Необходима авторизация');
      } else if (error.request) {
        toast.error('Не удалось подключиться к серверу');
      } else {
        toast.error(error.response?.data?.error || 'Ошибка при анализе контента');
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
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (label: string) => {
    if (label === 'legitimate') return 'Легитимный контент';
    if (label === 'phishing') return 'Фишинг';
    return label;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setContent('');
    }
  };

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
              placeholder="https://example.com"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        )}

        {(activeType === 'image' || activeType === 'video') && (
          <div className="space-y-2">
            <Label htmlFor="file-upload" className="text-base">
              Загрузить {activeType === 'image' ? 'изображение' : 'видео'}
            </Label>
            <Input
              id="file-upload"
              type="file"
              accept={activeType === 'image' ? 'image/*' : 'video/*'}
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && (
              <p className="text-sm text-gray-600 mt-2">
                Выбран файл: {file.name}
              </p>
            )}
          </div>
        )}
      </div>

      <Button 
        onClick={handleAnalyze} 
        disabled={isAnalyzing || !content.trim()}
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
        <Card className={`border-2 ${getRiskColor(result.label, result.confidence)}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl">Результат анализа</span>
              <Badge className={getStatusBadge(result.label)} style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}>
                {result.label === 'legitimate' && <CheckCircle className="h-4 w-4 mr-1.5" />}
                {result.label === 'phishing' && <AlertTriangle className="h-4 w-4 mr-1.5" />}
                {getStatusText(result.label)}
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
                <span className="text-base font-semibold text-gray-700">Уверенность модели</span>
                <span className="text-2xl font-bold text-gray-900">{getRiskScore(result.confidence)}%</span>
              </div>
              <Progress value={getRiskScore(result.confidence)} className="h-3" />
              
              {getRiskScore(result.confidence) < 70 && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    <strong>Внимание:</strong> Модель не полностью уверена в результате. 
                    Рекомендуется дополнительная проверка и осторожность при принятии решений.
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label className="text-base mb-2 block font-semibold text-gray-700">Проверенный текст:</Label>
              <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto border border-gray-200">
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