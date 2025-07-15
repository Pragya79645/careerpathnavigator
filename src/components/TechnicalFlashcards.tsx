'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Brain, 
  CheckCircle,
  XCircle,
  RotateCw
} from 'lucide-react';

interface QuestionWithAnswer {
  question: string;
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  importance: 'High' | 'Medium' | 'Low';
}

interface FlashcardData {
  questions: QuestionWithAnswer[];
  company: string;
  role: string;
  difficulty: string;
  tip: string;
}

interface TechnicalFlashcardsProps {
  data: FlashcardData;
}

const TechnicalFlashcards: React.FC<TechnicalFlashcardsProps> = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());
  const [strugglingCards, setStrugglingCards] = useState<Set<number>>(new Set());
  const [studyMode, setStudyMode] = useState<'all' | 'struggling' | 'mastered'>('all');
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const questions = data.questions || [];
  const filteredQuestions = questions.filter((_, index) => {
    if (studyMode === 'struggling') return strugglingCards.has(index);
    if (studyMode === 'mastered') return masteredCards.has(index);
    return true;
  });

  const currentQuestion = filteredQuestions[currentIndex];
  const progress = ((currentIndex + 1) / filteredQuestions.length) * 100;

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlay && filteredQuestions.length > 0) {
      const interval = setInterval(() => {
        if (isFlipped) {
          handleNext();
        } else {
          setIsFlipped(true);
        }
      }, 4000); // 4 seconds

      return () => clearInterval(interval);
    }
  }, [isAutoPlay, isFlipped, currentIndex, filteredQuestions.length]);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredQuestions.length);
    }, 100); // Small delay to ensure smooth transition
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + filteredQuestions.length) % filteredQuestions.length);
    }, 100); // Small delay to ensure smooth transition
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const markAsMastered = () => {
    const originalIndex = questions.indexOf(currentQuestion);
    setMasteredCards(prev => new Set([...prev, originalIndex]));
    setStrugglingCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(originalIndex);
      return newSet;
    });
    setTimeout(handleNext, 500);
  };

  const markAsStruggling = () => {
    const originalIndex = questions.indexOf(currentQuestion);
    setStrugglingCards(prev => new Set([...prev, originalIndex]));
    setMasteredCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(originalIndex);
      return newSet;
    });
    setTimeout(handleNext, 500);
  };

  const resetProgress = () => {
    setMasteredCards(new Set());
    setStrugglingCards(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'High': return 'bg-purple-100 text-purple-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No flashcards available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-6 h-6 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Technical Flashcards</h1>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <span>
            {data.company && data.company.trim() !== '' ? (
              <>
                <span className="font-medium text-blue-600">{data.company}</span> • {data.role}
              </>
            ) : (
              <>
                <span className="font-medium text-green-600">General</span> • {data.role}
              </>
            )}
          </span>
          <Badge variant="outline">{data.difficulty}</Badge>
          <span>{filteredQuestions.length} Cards</span>
        </div>
        {data.company && data.company.trim() !== '' ? (
          <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
            📍 Company-specific questions for {data.company}
          </div>
        ) : (
          <div className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block">
            🌍 General technical questions across top companies
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Study Mode Selector */}
      <div className="flex justify-center gap-2">
        <Button
          variant={studyMode === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setStudyMode('all'); setCurrentIndex(0); setIsFlipped(false); }}
        >
          All ({questions.length})
        </Button>
        <Button
          variant={studyMode === 'struggling' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setStudyMode('struggling'); setCurrentIndex(0); setIsFlipped(false); }}
        >
          Struggling ({strugglingCards.size})
        </Button>
        <Button
          variant={studyMode === 'mastered' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setStudyMode('mastered'); setCurrentIndex(0); setIsFlipped(false); }}
        >
          Mastered ({masteredCards.size})
        </Button>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAutoPlay(!isAutoPlay)}
        >
          {isAutoPlay ? 'Pause' : 'Auto Play'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={resetProgress}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Progress
        </Button>
      </div>

      {/* Flashcard */}
      <div className="relative w-full h-[500px] perspective-1000">
        <div className="flashcard-container">
          <motion.div
            key={currentIndex}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full h-full preserve-3d"
          >
            {/* Front Face - Question */}
            <Card className="flashcard-face flashcard-front shadow-lg">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                      {currentQuestion.difficulty}
                    </Badge>
                    <Badge className={getImportanceColor(currentQuestion.importance)}>
                      {currentQuestion.importance}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {currentIndex + 1} of {filteredQuestions.length}
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="max-h-60 overflow-y-auto mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 leading-tight">
                      {currentQuestion.question}
                    </h2>
                  </div>
                  <div className="text-gray-500 text-sm mb-6">
                    Click to reveal answer
                  </div>
                  <Button 
                    onClick={handleFlip}
                    className="mx-auto"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Flip Card
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Back Face - Answer */}
            <Card className="flashcard-face flashcard-back shadow-lg">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                      {currentQuestion.difficulty}
                    </Badge>
                    <Badge className={getImportanceColor(currentQuestion.importance)}>
                      {currentQuestion.importance}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {currentIndex + 1} of {filteredQuestions.length}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 font-medium p-2 bg-gray-50 rounded mb-4">
                  <strong>Q:</strong> <span className="break-words">{currentQuestion.question}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto mb-4">
                  <div className="text-gray-800 leading-relaxed">
                    <strong className="text-blue-600">Answer:</strong>
                    <div className="mt-2 whitespace-pre-wrap break-words text-sm">
                      {currentQuestion.answer}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-4 border-t border-gray-100">
                  <Button
                    onClick={markAsStruggling}
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    size="sm"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Review
                  </Button>
                  <Button 
                    onClick={handleFlip}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCw className="w-4 h-4 mr-1" />
                    Flip
                  </Button>
                  <Button
                    onClick={markAsMastered}
                    variant="outline"
                    className="text-green-600 hover:bg-green-50"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Got It
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handlePrevious}
          variant="outline"
          disabled={filteredQuestions.length <= 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          variant="outline"
          disabled={filteredQuestions.length <= 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 text-sm text-gray-600">
        <div className="text-center">
          <div className="font-semibold text-green-600">{masteredCards.size}</div>
          <div>Mastered</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-red-600">{strugglingCards.size}</div>
          <div>Struggling</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-blue-600">{questions.length - masteredCards.size - strugglingCards.size}</div>
          <div>Not Reviewed</div>
        </div>
      </div>

      {/* Tip */}
      {data.tip && (
        <div className={`border rounded-lg p-4 ${
          data.company && data.company.trim() !== '' 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <p className={`text-sm ${
            data.company && data.company.trim() !== ''
              ? 'text-blue-800'
              : 'text-green-800'
          }`}>
            <strong>💡 {data.company && data.company.trim() !== '' ? `${data.company} ` : 'General '}Tip:</strong> {data.tip}
          </p>
          {data.company && data.company.trim() !== '' && (
            <p className="text-xs text-blue-600 mt-2">
              This advice is tailored specifically for {data.company} technical interviews.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TechnicalFlashcards;
