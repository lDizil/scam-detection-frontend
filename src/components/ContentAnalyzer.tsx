import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { FileText, Image, Video, AlertTriangle, CheckCircle, Clock, Upload } from 'lucide-react';
import { toast } from "sonner";

interface ContentAnalyzerProps {
  userId: string;
}

interface AnalysisResult {
  id: string;
  type: 'text' | 'image' | 'video' | 'url';
  content: string;
  riskScore: number;
  status: 'safe' | 'suspicious' | 'dangerous';
  details: string[];
  timestamp: string;
  processingTime: number;
}

export function ContentAnalyzer({ userId }: ContentAnalyzerProps) {
  const [activeType, setActiveType] = useState<'text' | 'image' | 'video' | 'url'>('text');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);

  const contentTypes = [
    { type: 'text' as const, label: 'Текст', icon: FileText },
    { type: 'image' as const, label: 'Изображение', icon: Image },
    { type: 'video' as const, label: 'Видео', icon: Video },
    { type: 'url' as const, label: 'URL', icon: Upload },
  ];

  const mockAnalyze = async (): Promise<AnalysisResult> => {
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const riskScores = [15, 25, 45, 75, 85, 95];
    const riskScore = riskScores[Math.floor(Math.random() * riskScores.length)];
    
    let status: 'safe' | 'suspicious' | 'dangerous';
    let details: string[] = [];

    if (riskScore < 30) {
      status = 'safe';
      details = [
        'Контент не содержит признаков мошенничества',
        'Отсутствуют подозрительные ключевые слова',
        'Нормальные лингвистические паттерны'
      ];
    } else if (riskScore < 70) {
      status = 'suspicious';
      details = [
        'Обнаружены потенциально подозрительные элементы',
        'Рекомендуется дополнительная проверка',
        'Возможные признаки социальной инженерии'
      ];
    } else {
      status = 'dangerous';
      details = [
        'Высокая вероятность мошеннического контента',
        'Обнаружены типичные паттерны обмана',
        'Содержит призывы к финансовым операциям'
      ];
    }

    const result: AnalysisResult = {
      id: Date.now().toString(),
      type: activeType,
      content: activeType === 'text' ? content : (file?.name || content),
      riskScore,
      status,
      details,
      timestamp: new Date().toISOString(),
      processingTime: 2000 + Math.random() * 1000
    };

    const history = JSON.parse(localStorage.getItem(`fraudAnalysis_${userId}`) || '[]');
    history.unshift(result);
    localStorage.setItem(`fraudAnalysis_${userId}`, JSON.stringify(history.slice(0, 50))); // Храним последние 50

    return result;
  };

  const handleAnalyze = async () => {
    if (!content.trim() && !file) {
      toast.error('Введите контент для анализа');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setProgress(0);

    try {
      const analysisResult = await mockAnalyze();
      setResult(analysisResult);
      
      const statusMessages = {
        safe: 'Контент безопасен',
        suspicious: 'Контент подозрителен',
        dangerous: 'Контент опасен!'
      };

      toast.success(statusMessages[analysisResult.status]);
    } catch (error) {
      toast.error('Ошибка при анализе контента');
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setContent('');
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600 bg-green-50 border-green-200';
    if (score < 70) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      safe: 'bg-green-100 text-green-800',
      suspicious: 'bg-orange-100 text-orange-800',
      dangerous: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || variants.safe;
  };

  return (
    <div className="space-y-6">
      {/* Content Type Selection */}
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

      {/* Content Input */}
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

      {/* Analyze Button */}
      <Button 
        onClick={handleAnalyze} 
        disabled={isAnalyzing || (!content.trim() && !file)}
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

      {/* Progress */}
      {isAnalyzing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Прогресс анализа</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {/* Results */}
      {result && (
        <Card className={`border-2 ${getRiskColor(result.riskScore)}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Результат анализа</span>
              <Badge className={getStatusBadge(result.status)}>
                {result.status === 'safe' && <CheckCircle className="h-3 w-3 mr-1" />}
                {result.status === 'suspicious' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {result.status === 'dangerous' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {result.status === 'safe' ? 'Безопасно' : 
                 result.status === 'suspicious' ? 'Подозрительно' : 'Опасно'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span>Оценка риска</span>
                <span className="font-medium">{result.riskScore}/100</span>
              </div>
              <Progress value={result.riskScore} className="h-2" />
            </div>

            <div>
              <Label className="text-base mb-2 block">Детали анализа:</Label>
              <ul className="space-y-1">
                {result.details.map((detail, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t text-sm text-gray-500">
              <p>Время обработки: {(result.processingTime / 1000).toFixed(1)}с</p>
              <p>Анализ завершен: {new Date(result.timestamp).toLocaleString('ru-RU')}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

