import { useState } from 'react';
import { BookOpen, MessageSquare, FileText, Code, Sparkles, Download, Loader2 } from 'lucide-react';

interface WorkHistoryItem {
  mode: string;
  input: string;
  output: string;
  settings: any;
  timestamp: Date;
}

function SimpleApp() {
  const [activeMode, setActiveMode] = useState<string>('summarize');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryType, setSummaryType] = useState<'short' | 'detailed'>('short');
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [formalTone, setFormalTone] = useState<'formal' | 'professional' | 'academic'>('formal');

  // Store all work done by user
  const [workHistory, setWorkHistory] = useState<Array<{
    mode: string;
    input: string;
    output: string;
    settings: any;
    timestamp: Date;
  }>>([]);

  // Store last processed content for re-summarization
  const [lastProcessedContent, setLastProcessedContent] = useState<string>('');

  const navigationItems = [
    { id: 'summarize', label: 'Summarization', icon: FileText },
    { id: 'quiz', label: 'Quiz Generator', icon: BookOpen },
    { id: 'qa', label: 'Q&A System', icon: MessageSquare },
    { id: 'code', label: 'Code Analyzer', icon: Code },
    { id: 'formal', label: 'Formal Fellow', icon: Sparkles },
  ];

  // Enhanced local NLP functions with improved intelligence
  const summarizeTextLocal = async (text: string, type: 'short' | 'detailed'): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordCount = words.length;
    
    // Extract keywords (simple version)
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'there', 'then', 'than', 'when', 'where', 'why', 'what', 'who', 'how']);
    const keywords = words
      .filter(word => word.length > 3 && !commonWords.has(word))
      .reduce((acc: { [key: string]: number }, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});
    
    const topKeywords = Object.entries(keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
    
    if (type === 'detailed') {
      const summary = [];
      summary.push(`**Comprehensive Analysis** (${wordCount} words, ${sentences.length} sentences):`);
      summary.push('');
      summary.push('**Main Content:**');
      
      // Get important sentences (first, last, and middle with keywords)
      const importantSentences = [];
      if (sentences.length > 0) importantSentences.push(sentences[0]);
      
      // Find sentences with most keywords
      sentences.slice(1, -1).forEach(sentence => {
        const sentenceWords = sentence.toLowerCase().split(/\s+/);
        const keywordCount = sentenceWords.filter(word => topKeywords.includes(word)).length;
        if (keywordCount >= 2) importantSentences.push(sentence);
      });
      
      if (sentences.length > 1) importantSentences.push(sentences[sentences.length - 1]);
      
      importantSentences.slice(0, 4).forEach((sentence, idx) => {
        summary.push(`${idx + 1}. ${sentence.trim()}`);
      });
      
      summary.push('');
      summary.push(`**Key Themes:** ${topKeywords.join(', ')}`);
      summary.push(`**Content Structure:** ${sentences.length > 5 ? 'Multi-faceted analysis' : 'Focused discussion'}`);
      
      return summary.join('\n');
    } else {
      // Short summary
      const mainSentence = sentences[0] || '';
      const supportSentence = sentences.length > 2 ? 
        sentences.find(s => topKeywords.some(kw => s.toLowerCase().includes(kw))) || sentences[1] : 
        sentences[1] || '';
      
      let summary = `This content examines ${topKeywords[0] || 'various topics'}`;
      if (mainSentence) {
        summary += `. ${mainSentence.trim()}`;
      }
      if (supportSentence && supportSentence !== mainSentence) {
        summary += ` ${supportSentence.trim()}`;
      }
      summary += ` Key focus areas include: ${topKeywords.slice(0, 3).join(', ')}.`;
      
      return summary;
    }
  };

  const generateQuizLocal = async (text: string, numQuestions: number, difficulty: 'easy' | 'medium' | 'hard'): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
    const keywords = words.filter(word => word.length > 3 && !commonWords.has(word));
    
    const questions = [];
    for (let i = 0; i < Math.min(numQuestions, sentences.length); i++) {
      const sentence = sentences[i];
      const relevantKeywords = keywords.filter(kw => sentence.toLowerCase().includes(kw));
      const keyword = relevantKeywords[0] || keywords[i % keywords.length] || 'topic';
      
      let question, options, answer;
      
      if (difficulty === 'easy') {
        question = `What is mentioned about ${keyword}?`;
        options = [
          `A) ${sentence.slice(0, 50)}...`,
          'B) Not discussed in the text',
          'C) Opposite of what is stated',
          'D) Partially mentioned'
        ];
        answer = 'A';
      } else if (difficulty === 'medium') {
        question = `Based on the text, which statement about ${keyword} is most accurate?`;
        options = [
          `A) ${sentence.slice(0, 60)}...`,
          'B) It contradicts the main theme',
          'C) It is briefly mentioned without detail',
          'D) It is presented as uncertain'
        ];
        answer = 'A';
      } else {
        question = `Analyze the relationship between ${keyword} and the overall theme. What can be inferred?`;
        options = [
          'A) Direct causal relationship',
          `B) ${sentence.slice(0, 70)}...`,
          'C) No clear relationship established',
          'D) Contradictory relationship'
        ];
        answer = 'B';
      }
      
      questions.push(`Question ${i + 1}: ${question}\n${options.join('\n')}\nCorrect Answer: ${answer}\n`);
    }
    
    return questions.join('\n');
  };

  const answerQuestionLocal = async (question: string, context: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerQuestion = question.toLowerCase();
    const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (lowerQuestion.includes('what') || lowerQuestion.includes('define')) {
      const relevantSentence = sentences.find(s => 
        lowerQuestion.split(' ').some(word => 
          s.toLowerCase().includes(word) && word.length > 3
        )
      ) || sentences[0];
      return `Based on the context: ${relevantSentence}. This relates to the key concepts discussed in the text.`;
    } else if (lowerQuestion.includes('how') || lowerQuestion.includes('explain')) {
      const explanatorySentences = sentences.filter(s => 
        s.toLowerCase().includes('because') || 
        s.toLowerCase().includes('due to') ||
        s.toLowerCase().includes('result') ||
        s.toLowerCase().includes('cause')
      );
      const sentence = explanatorySentences[0] || sentences[Math.floor(sentences.length / 2)] || sentences[0];
      return `Explanation based on the text: ${sentence}`;
    } else if (lowerQuestion.includes('why')) {
      const causalSentences = sentences.filter(s => 
        s.toLowerCase().includes('because') || 
        s.toLowerCase().includes('reason') ||
        s.toLowerCase().includes('purpose')
      );
      const sentence = causalSentences[0] || sentences[1] || sentences[0];
      return `The reason appears to be: ${sentence}`;
    } else {
      const relevantSentences = sentences.filter(s => 
        lowerQuestion.split(' ').some(word => 
          s.toLowerCase().includes(word) && word.length > 3
        )
      );
      const sentence = relevantSentences[0] || sentences[0];
      return `Based on the available information: ${sentence}`;
    }
  };

  // Code analysis
  const analyzeCode = (code: string, language: string) => {
    const lines = code.split('\n').length;
    const chars = code.length;
    const functions = (code.match(/function|def |class |const |let |var /g) || []).length;
    const comments = (code.match(/\/\/|\/\*|\#|"""|'''/g) || []).length;
    
    let analysis = `Code Analysis (${language}):\n\n`;
    analysis += `📊 Statistics:\n`;
    analysis += `- Lines: ${lines}\n`;
    analysis += `- Characters: ${chars}\n`;
    analysis += `- Functions/Variables: ${functions}\n`;
    analysis += `- Comments: ${comments}\n\n`;
    
    analysis += `🔍 Quality Assessment:\n`;
    if (comments > 0) analysis += `✅ Good: Code contains comments\n`;
    if (functions > 0) analysis += `✅ Good: Contains function definitions\n`;
    if (lines < 100) analysis += `✅ Good: Manageable code size\n`;
    
    analysis += `\n💡 Suggestions:\n`;
    if (comments === 0) analysis += `- Add comments for better documentation\n`;
    if (code.includes('console.log')) analysis += `- Consider removing debug statements\n`;
    if (!code.includes('const') && !code.includes('let')) analysis += `- Use proper variable declarations\n`;
    
    return analysis;
  };

  // Formal text conversion
  const convertToFormal = (text: string, tone: string) => {
    let formal = text;
    
    // Basic formalization rules
    const contractions: { [key: string]: string } = {
      "don't": "do not", "won't": "will not", "can't": "cannot", 
      "isn't": "is not", "aren't": "are not", "wasn't": "was not",
      "weren't": "were not", "hasn't": "has not", "haven't": "have not",
      "hadn't": "had not", "shouldn't": "should not", "couldn't": "could not",
      "wouldn't": "would not", "I'm": "I am", "you're": "you are",
      "he's": "he is", "she's": "she is", "it's": "it is", "we're": "we are",
      "they're": "they are", "I've": "I have", "you've": "you have"
    };
    
    // Replace contractions
    Object.entries(contractions).forEach(([informal, formal_word]) => {
      formal = formal.replace(new RegExp(informal, 'gi'), formal_word);
    });
    
    // Improve sentence structure
    formal = formal.replace(/\b(very|really|super|pretty)\s+/gi, 'quite ');
    formal = formal.replace(/\bokay\b/gi, 'acceptable');
    formal = formal.replace(/\bawesome\b/gi, 'excellent');
    formal = formal.replace(/\bstuff\b/gi, 'matters');
    formal = formal.replace(/\bthings\b/gi, 'items');
    
    if (tone === 'academic') {
      formal = formal.replace(/\bI think\b/gi, 'It is evident that');
      formal = formal.replace(/\bIn my opinion\b/gi, 'From this perspective');
      formal = formal.replace(/\bBasically\b/gi, 'Fundamentally');
    } else if (tone === 'professional') {
      formal = formal.replace(/\bI think\b/gi, 'I believe');
      formal = formal.replace(/\bHi\b/gi, 'Dear');
      formal = formal.replace(/\bThanks\b/gi, 'Thank you');
    }
    
    // Capitalize first letter and ensure proper punctuation
    formal = formal.charAt(0).toUpperCase() + formal.slice(1);
    if (!/[.!?]$/.test(formal.trim())) {
      formal = formal.trim() + '.';
    }
    
    return `${tone.charAt(0).toUpperCase() + tone.slice(1)} Version:\n\n${formal}`;
  };

  // Enhanced processing function with work history tracking
  const handleProcess = async () => {
    if (!inputText.trim()) {
      setOutputText('Please enter some text to process.');
      return;
    }

    setIsLoading(true);
    
    try {
      let result = '';
      let settings: any = {};
      
      switch (activeMode) {
        case 'summarize':
          settings = { summaryType, method: 'abstractive' };
          result = await summarizeTextLocal(inputText, summaryType);
          setLastProcessedContent(inputText); // Store for re-summarization
          break;
        case 'quiz':
          settings = { numQuestions, difficulty: quizDifficulty };
          result = await generateQuizLocal(inputText, numQuestions, quizDifficulty);
          break;
        case 'qa':
          const lines = inputText.split('\n\n');
          const question = lines[1] || 'What is this about?';
          const context = lines[0] || inputText;
          settings = { question, context };
          result = await answerQuestionLocal(question, context);
          break;
        case 'code':
          settings = { language: codeLanguage };
          result = await analyzeCodeAdvanced(inputText, codeLanguage);
          break;
        case 'formal':
          settings = { tone: formalTone };
          result = convertToFormal(inputText, formalTone);
          break;
        default:
          result = 'Processing completed.';
      }
      
      // Add to work history
      setWorkHistory(prev => [...prev, {
        mode: activeMode,
        input: inputText,
        output: result,
        settings,
        timestamp: new Date()
      }]);
      
      setOutputText(result);
    } catch (error) {
      console.error('Processing failed:', error);
      setOutputText('Processing failed. Please try again with different content.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-summarize with different settings
  const handleReSummarize = async () => {
    if (!lastProcessedContent) {
      setOutputText('No previous content to re-summarize. Please process some text first.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await summarizeTextLocal(lastProcessedContent, summaryType);
      
      // Add to work history
      setWorkHistory(prev => [...prev, {
        mode: 'summarize',
        input: lastProcessedContent,
        output: result,
        settings: { summaryType, method: 'abstractive' },
        timestamp: new Date()
      }]);
      
      setOutputText(result);
    } catch (error) {
      console.error('Re-summarization failed:', error);
      setOutputText('Re-summarization failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Advanced code analysis using NLP
  const analyzeCodeAdvanced = async (code: string, language: string): Promise<string> => {
    const lines = code.split('\n').length;
    const chars = code.length;
    const functions = (code.match(/function|def |class |const |let |var |func |public |private |protected /g) || []).length;
    const comments = (code.match(/\/\/|\/\*|\#|"""|'''|<!--/g) || []).length;
    
    // Use NLP to analyze code structure and patterns
    const codeAnalysis = await summarizeTextLocal(code, 'detailed');
    
    let analysis = `🔍 **Advanced Code Analysis** (${language.toUpperCase()})\n\n`;
    
    analysis += `📊 **Statistics**:\n`;
    analysis += `• Lines of Code: ${lines}\n`;
    analysis += `• Characters: ${chars.toLocaleString()}\n`;
    analysis += `• Functions/Variables: ${functions}\n`;
    analysis += `• Comments: ${comments}\n`;
    analysis += `• Comment Ratio: ${lines > 0 ? Math.round((comments / lines) * 100) : 0}%\n\n`;
    
    analysis += `🎯 **Code Quality Assessment**:\n`;
    const qualityScore = calculateCodeQuality(code, lines, functions, comments);
    analysis += `• Overall Quality Score: ${qualityScore}/100\n`;
    
    if (comments > 0) analysis += `✅ Well-documented code\n`;
    if (functions > 0) analysis += `✅ Contains function definitions\n`;
    if (lines < 100) analysis += `✅ Manageable code size\n`;
    if (comments / lines > 0.1) analysis += `✅ Good comment coverage\n`;
    
    analysis += `\n🧠 **NLP-Based Code Structure Analysis**:\n`;
    analysis += codeAnalysis + '\n\n';
    
    analysis += `💡 **Intelligent Suggestions**:\n`;
    const suggestions = generateCodeSuggestions(code, language, qualityScore);
    suggestions.forEach(suggestion => analysis += `• ${suggestion}\n`);
    
    analysis += `\n🔧 **Language-Specific Insights**:\n`;
    analysis += getLanguageSpecificInsights(code, language);
    
    return analysis;
  };

  const calculateCodeQuality = (code: string, lines: number, functions: number, comments: number): number => {
    let score = 50; // Base score
    
    // Comment quality
    if (comments / lines > 0.15) score += 20;
    else if (comments / lines > 0.05) score += 10;
    
    // Function organization
    if (functions > 0 && lines / functions < 50) score += 15;
    
    // Code patterns
    if (code.includes('try') && code.includes('catch')) score += 5;
    if (code.includes('const') || code.includes('let')) score += 5;
    if (!code.includes('console.log') || comments > 0) score += 5;
    
    return Math.min(100, Math.max(0, score));
  };

  const generateCodeSuggestions = (code: string, language: string, qualityScore: number): string[] => {
    const suggestions = [];
    
    if (qualityScore < 60) suggestions.push("Consider improving overall code structure and documentation");
    if (!code.includes('//') && !code.includes('/*') && !code.includes('#')) {
      suggestions.push("Add comments to explain complex logic and functions");
    }
    if (code.includes('console.log') && language === 'javascript') {
      suggestions.push("Remove debug console.log statements before production");
    }
    if (language === 'python' && !code.includes('def ') && code.length > 100) {
      suggestions.push("Consider organizing code into functions for better modularity");
    }
    if (language === 'javascript' && code.includes('var ')) {
      suggestions.push("Use 'const' or 'let' instead of 'var' for better scope control");
    }
    
    suggestions.push("Consider adding error handling for robustness");
    suggestions.push("Review variable naming for clarity and consistency");
    
    return suggestions;
  };

  const getLanguageSpecificInsights = (code: string, language: string): string => {
    let insights = '';
    
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        if (code.includes('async') || code.includes('await')) insights += "• Uses modern async/await patterns\n";
        if (code.includes('=>')) insights += "• Utilizes arrow functions\n";
        if (code.includes('import') || code.includes('require')) insights += "• Follows modular programming practices\n";
        break;
      case 'python':
        if (code.includes('import ')) insights += "• Uses Python imports for modularity\n";
        if (code.includes('class ')) insights += "• Implements object-oriented programming\n";
        if (code.includes('def ')) insights += "• Well-structured with function definitions\n";
        break;
      case 'java':
        if (code.includes('public class')) insights += "• Follows Java class structure\n";
        if (code.includes('public static void main')) insights += "• Contains main method entry point\n";
        break;
      default:
        insights += `• Code appears to be written in ${language}\n`;
    }
    
    return insights || "• General programming patterns detected\n";
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputText(content);
      };
      reader.readAsText(file);
    }
  };

  const downloadResult = () => {
    if (!outputText) return;
    
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeMode}-result.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
                  IntelliNLP - Enhanced
                </h1>
                <p className="text-sm text-gray-600">Intelligent Text & Code Processor</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Full-Featured Frontend
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
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {navigationItems.find(item => item.id === activeMode)?.label}
          </h2>
          
          {/* Options Panel */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3">Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {activeMode === 'summarize' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Summary Type</label>
                    <select 
                      value={summaryType} 
                      onChange={(e) => setSummaryType(e.target.value as 'short' | 'detailed')}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="short">Short Summary</option>
                      <option value="detailed">Detailed Summary</option>
                    </select>
                  </div>
                </>
              )}
              
              {activeMode === 'quiz' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Difficulty</label>
                    <select 
                      value={quizDifficulty} 
                      onChange={(e) => setQuizDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Number of Questions</label>
                    <select 
                      value={numQuestions} 
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value={3}>3 Questions</option>
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                    </select>
                  </div>
                </>
              )}
              
              {activeMode === 'code' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Language</label>
                  <select 
                    value={codeLanguage} 
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                  </select>
                </div>
              )}
              
              {activeMode === 'formal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Tone</label>
                  <select 
                    value={formalTone} 
                    onChange={(e) => setFormalTone(e.target.value as 'formal' | 'professional' | 'academic')}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="formal">Formal</option>
                    <option value="professional">Professional</option>
                    <option value="academic">Academic</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File (optional)
            </label>
            <input
              type="file"
              accept=".txt,.md,.js,.py,.html,.css,.json"
              onChange={handleFileUpload}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          {/* Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {activeMode === 'qa' ? 'Context (first part) and Question (second part - separate with double line break)' : 'Input Text'}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                activeMode === 'summarize' ? 'Enter text to summarize...' :
                activeMode === 'quiz' ? 'Enter text to generate quiz questions from...' :
                activeMode === 'qa' ? 'Enter context here...\n\nWhat is your question?' :
                activeMode === 'code' ? 'Paste your code here for analysis...' :
                'Enter text to make formal...'
              }
              className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Process Button */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={handleProcess}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isLoading ? 'Processing...' : `Process ${activeMode}`}
            </button>
            
            {outputText && (
              <button
                onClick={downloadResult}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Result
              </button>
            )}
          </div>

          {/* Output Section */}
          {outputText && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Result
              </label>
              <div className="w-full p-4 bg-gray-50 border border-gray-300 rounded-lg min-h-32 max-h-96 overflow-y-auto">
                <pre className="text-gray-800 whitespace-pre-wrap font-mono text-sm">{outputText}</pre>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Current Mode: {activeMode}</h3>
            <p className="text-sm text-blue-600">
              {activeMode === 'summarize' && 'Create intelligent summaries with keyword extraction and customizable length.'}
              {activeMode === 'quiz' && 'Generate comprehensive quiz questions with multiple difficulty levels.'}
              {activeMode === 'qa' && 'Advanced question-answering system with context analysis.'}
              {activeMode === 'code' && 'Detailed code analysis with quality assessment and suggestions.'}
              {activeMode === 'formal' && 'Professional text formatting with tone customization.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SimpleApp;
