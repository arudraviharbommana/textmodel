import React, { useState, useEffect } from 'react';
import { BookOpen, MessageSquare, FileText, Upload, Download, Loader2, Code, Sparkles } from 'lucide-react';
import { Summarizer } from './components/Summarizer';
import { QuizGenerator } from './components/QuizGenerator';
import { QASystem } from './components/QASystem';
import { CodeAnalyzer } from './components/CodeAnalyzer';
import { FormalFellow } from './components/FormalFellow';

type Mode = 'summarize' | 'quiz' | 'qa' | 'code' | 'formal';

// State management for preserving work across mode switches
interface AppState {
  summarizer: {
    text: string;
    summary: string;
    summaryType: 'short' | 'detailed';
    method: 'abstractive' | 'extractive';
  };
  quiz: {
    text: string;
    questions: any[];
    numQuestions: number;
    difficulty: 'easy' | 'medium' | 'hard';
    userAnswers: { [key: number]: string };
    showResults: boolean;
  };
  qa: {
    context: string;
    question: string;
    answer: string;
    history: any[];
  };
  codeAnalyzer: {
    code: string;
    language: string;
    analysis: any;
    correctedCode: string;
    fileName: string;
  };
  formalFellow: {
    inputText: string;
    outputText: string;
    conversionType: 'formal' | 'simplified' | 'detailed' | 'speech' | 'academic' | 'professional';
    tone: 'neutral' | 'persuasive' | 'informative' | 'conversational';
    targetAudience: 'general' | 'academic' | 'business' | 'technical';
  };
}

function App() {
  const [activeMode, setActiveMode] = useState<Mode>('summarize');
  const [appState, setAppState] = useState<AppState>({
    summarizer: {
      text: '',
      summary: '',
      summaryType: 'short',
      method: 'abstractive'
    },
    quiz: {
      text: '',
      questions: [],
      numQuestions: 5,
      difficulty: 'medium',
      userAnswers: {},
      showResults: false
    },
    qa: {
      context: '',
      question: '',
      answer: '',
      history: []
    },
    codeAnalyzer: {
      code: '',
      language: 'javascript',
      analysis: null,
      correctedCode: '',
      fileName: ''
    },
    formalFellow: {
      inputText: '',
      outputText: '',
      conversionType: 'formal',
      tone: 'neutral',
      targetAudience: 'general'
    }
  });

  // Load state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('intellinlp-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setAppState(parsedState);
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever appState changes
  useEffect(() => {
    localStorage.setItem('intellinlp-state', JSON.stringify(appState));
  }, [appState]);

  const updateSummarizerState = (updates: Partial<AppState['summarizer']>) => {
    setAppState(prev => ({
      ...prev,
      summarizer: { ...prev.summarizer, ...updates }
    }));
  };

  const updateQuizState = (updates: Partial<AppState['quiz']>) => {
    setAppState(prev => ({
      ...prev,
      quiz: { ...prev.quiz, ...updates }
    }));
  };

  const updateQAState = (updates: Partial<AppState['qa']>) => {
    setAppState(prev => ({
      ...prev,
      qa: { ...prev.qa, ...updates }
    }));
  };

  const updateCodeAnalyzerState = (updates: Partial<AppState['codeAnalyzer']>) => {
    setAppState(prev => ({
      ...prev,
      codeAnalyzer: { ...prev.codeAnalyzer, ...updates }
    }));
  };

  const updateFormalFellowState = (updates: Partial<AppState['formalFellow']>) => {
    setAppState(prev => ({
      ...prev,
      formalFellow: { ...prev.formalFellow, ...updates }
    }));
  };

  const navigationItems = [
    { id: 'summarize' as Mode, label: 'Summarization', icon: FileText },
    { id: 'quiz' as Mode, label: 'Quiz Generator', icon: BookOpen },
    { id: 'qa' as Mode, label: 'Q&A System', icon: MessageSquare },
    { id: 'code' as Mode, label: 'Code Analyzer', icon: Code },
    { id: 'formal' as Mode, label: 'Formal Fellow', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  IntelliNLP
                </h1>
                <p className="text-sm text-gray-600">Intelligent Text & Code Processor</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Work is automatically saved across modes
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMode(item.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeMode === item.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105'
                    : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-md hover:scale-105'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        <div className="transition-all duration-500 ease-in-out">
          {activeMode === 'summarize' && (
            <Summarizer 
              state={appState.summarizer}
              updateState={updateSummarizerState}
            />
          )}
          {activeMode === 'quiz' && (
            <QuizGenerator 
              state={appState.quiz}
              updateState={updateQuizState}
            />
          )}
          {activeMode === 'qa' && (
            <QASystem 
              state={appState.qa}
              updateState={updateQAState}
            />
          )}
          {activeMode === 'code' && (
            <CodeAnalyzer 
              state={appState.codeAnalyzer}
              updateState={updateCodeAnalyzerState}
            />
          )}
          {activeMode === 'formal' && (
            <FormalFellow 
              state={appState.formalFellow}
              updateState={updateFormalFellowState}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;