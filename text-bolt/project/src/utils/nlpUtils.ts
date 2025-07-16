// Advanced AI-powered NLP utilities with semantic understanding

interface SummarizationOptions {
  type: 'short' | 'detailed';
  method: 'abstractive' | 'extractive';
}

interface QuizOptions {
  numQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface TextAnalysis {
  mainTopics: string[];
  keyEntities: string[];
  sentimentTone: string;
  textStructure: string[];
  importanceScores: { [sentence: string]: number };
  concepts: string[];
  definitions: { [term: string]: string };
  relationships: { [key: string]: string[] };
}

// Simulate AI processing delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Advanced text preprocessing with semantic preservation
function preprocessText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
    .replace(/\n+/g, ' ')
    .trim();
}

// Comprehensive text analysis like modern AI tools
function analyzeText(text: string): TextAnalysis {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  const mainTopics = extractSemanticTopics(text);
  const keyEntities = extractKeyEntities(text);
  const sentimentTone = analyzeSentiment(text);
  const textStructure = analyzeTextStructure(text);
  const importanceScores = calculateSentenceImportance(sentences, text);
  const concepts = extractConcepts(text);
  const definitions = extractDefinitions(text);
  const relationships = extractRelationships(text);
  
  return {
    mainTopics,
    keyEntities,
    sentimentTone,
    textStructure,
    importanceScores,
    concepts,
    definitions,
    relationships
  };
}

// Extract semantic topics using advanced analysis
function extractSemanticTopics(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  
  const topicClusters = {
    technology: ['technology', 'digital', 'software', 'computer', 'internet', 'data', 'algorithm', 'artificial', 'intelligence', 'machine', 'learning', 'programming', 'development', 'innovation', 'tech', 'nlp', 'processing', 'neural', 'deep', 'model', 'transformer'],
    business: ['business', 'company', 'market', 'economy', 'financial', 'profit', 'revenue', 'strategy', 'management', 'corporate', 'industry', 'commercial', 'enterprise', 'organization'],
    science: ['research', 'study', 'analysis', 'experiment', 'scientific', 'theory', 'hypothesis', 'evidence', 'discovery', 'investigation', 'methodology', 'findings', 'conclusion'],
    health: ['health', 'medical', 'treatment', 'patient', 'disease', 'therapy', 'clinical', 'healthcare', 'medicine', 'diagnosis', 'symptoms', 'prevention'],
    education: ['education', 'learning', 'student', 'teaching', 'school', 'university', 'academic', 'knowledge', 'curriculum', 'training', 'instruction'],
    environment: ['environment', 'climate', 'nature', 'ecological', 'sustainability', 'conservation', 'pollution', 'renewable', 'ecosystem', 'biodiversity'],
    social: ['social', 'society', 'community', 'cultural', 'people', 'human', 'relationship', 'interaction', 'behavior', 'demographic'],
    linguistics: ['language', 'linguistic', 'grammar', 'syntax', 'semantic', 'phonetic', 'morphology', 'pragmatic', 'discourse', 'communication']
  };
  
  const topicScores: { [topic: string]: number } = {};
  
  Object.entries(topicClusters).forEach(([topic, keywords]) => {
    topicScores[topic] = keywords.reduce((score, keyword) => {
      const matches = words.filter(word => word.includes(keyword) || keyword.includes(word)).length;
      return score + matches;
    }, 0);
  });
  
  const sortedTopics = Object.entries(topicScores)
    .filter(([_, score]) => score > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)
    .map(([topic, _]) => topic);
  
  return sortedTopics.length > 0 ? sortedTopics : ['general'];
}

// Extract key entities using pattern recognition
function extractKeyEntities(text: string): string[] {
  const entities = [];
  
  // Proper nouns (capitalized words)
  const properNouns = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  entities.push(...properNouns.slice(0, 8));
  
  // Technical terms and acronyms
  const acronyms = text.match(/\b[A-Z]{2,}\b/g) || [];
  entities.push(...acronyms.slice(0, 5));
  
  // Numbers and measurements
  const numbers = text.match(/\b\d+(?:[.,]\d+)*(?:\s*(?:percent|%|million|billion|thousand|years?|months?|days?))?/gi) || [];
  entities.push(...numbers.slice(0, 3));
  
  return [...new Set(entities)].slice(0, 10);
}

// Extract concepts from text
function extractConcepts(text: string): string[] {
  const conceptPatterns = [
    /\b([a-z]+(?:\s+[a-z]+)*)\s+(?:is|are|refers?\s+to|means?|involves?|includes?)\s+/gi,
    /\b(?:concept|technique|method|approach|process|system|model|framework)\s+(?:of\s+)?([a-z\s]+)/gi,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:models?|systems?|techniques?|methods?)/g
  ];
  
  const concepts = [];
  conceptPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      const concept = match.replace(/\b(?:is|are|refers?\s+to|means?|involves?|includes?|concept|technique|method|approach|process|system|model|framework|of)\b/gi, '').trim();
      if (concept.length > 3 && concept.length < 50) {
        concepts.push(concept);
      }
    });
  });
  
  return [...new Set(concepts)].slice(0, 8);
}

// Extract definitions from text
function extractDefinitions(text: string): { [term: string]: string } {
  const definitions: { [term: string]: string } = {};
  
  // Pattern: "X is/are Y"
  const definitionPattern = /\b([A-Z][a-zA-Z\s]+?)\s+(?:is|are)\s+([^.!?]+)/g;
  let match;
  
  while ((match = definitionPattern.exec(text)) !== null) {
    const term = match[1].trim();
    const definition = match[2].trim();
    
    if (term.length > 2 && term.length < 50 && definition.length > 10) {
      definitions[term] = definition;
    }
  }
  
  return definitions;
}

// Extract relationships between concepts
function extractRelationships(text: string): { [key: string]: string[] } {
  const relationships: { [key: string]: string[] } = {};
  
  // Find cause-effect relationships
  const causalPatterns = [
    /\b([^.!?]+?)\s+(?:enables?|allows?|helps?|causes?|leads?\s+to|results?\s+in)\s+([^.!?]+)/gi,
    /\b([^.!?]+?)\s+(?:because|due\s+to|as\s+a\s+result\s+of)\s+([^.!?]+)/gi
  ];
  
  causalPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const cause = match[1].trim();
      const effect = match[2].trim();
      
      if (cause.length > 5 && effect.length > 5) {
        if (!relationships[cause]) relationships[cause] = [];
        relationships[cause].push(effect);
      }
    }
  });
  
  return relationships;
}

// Analyze sentiment and tone
function analyzeSentiment(text: string): string {
  const positiveWords = ['good', 'great', 'excellent', 'positive', 'beneficial', 'effective', 'successful', 'improved', 'better', 'advantage', 'progress', 'achievement', 'advanced', 'powerful', 'robust'];
  const negativeWords = ['bad', 'poor', 'negative', 'problem', 'issue', 'challenge', 'difficult', 'worse', 'decline', 'failure', 'risk', 'concern', 'limitation', 'weakness'];
  const neutralWords = ['analysis', 'study', 'research', 'examination', 'investigation', 'review', 'discussion', 'explanation', 'description', 'overview'];
  
  const words = text.toLowerCase().split(/\s+/);
  
  const positiveCount = words.filter(word => positiveWords.some(pw => word.includes(pw))).length;
  const negativeCount = words.filter(word => negativeWords.some(nw => word.includes(nw))).length;
  const neutralCount = words.filter(word => neutralWords.some(neu => word.includes(neu))).length;
  
  if (neutralCount > positiveCount && neutralCount > negativeCount) return 'analytical';
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'critical';
  return 'neutral';
}

// Analyze text structure
function analyzeTextStructure(text: string): string[] {
  const structure = [];
  
  if (text.includes('introduction') || text.includes('overview')) structure.push('introduction');
  if (text.includes('method') || text.includes('approach') || text.includes('technique')) structure.push('methodology');
  if (text.includes('result') || text.includes('finding') || text.includes('application')) structure.push('results');
  if (text.includes('conclusion') || text.includes('summary') || text.includes('ultimately')) structure.push('conclusion');
  if (text.includes('first') || text.includes('second') || text.includes('third') || text.includes('additionally')) structure.push('sequential');
  if (text.includes('however') || text.includes('although') || text.includes('despite') || text.includes('while')) structure.push('comparative');
  if (text.includes('because') || text.includes('therefore') || text.includes('consequently') || text.includes('enables')) structure.push('causal');
  
  return structure.length > 0 ? structure : ['descriptive'];
}

// Calculate sentence importance using multiple factors
function calculateSentenceImportance(sentences: string[], fullText: string): { [sentence: string]: number } {
  const scores: { [sentence: string]: number } = {};
  const allWords = fullText.toLowerCase().split(/\s+/);
  const wordFreq: { [word: string]: number } = {};
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'there', 'then', 'than', 'when', 'where', 'why', 'what', 'who', 'how']);
  
  // Calculate word frequency excluding stop words
  allWords.forEach(word => {
    if (word.length > 3 && !stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  // Find high-value terms (words that appear frequently but not too frequently)
  const totalWords = allWords.length;
  const importantTerms = Object.entries(wordFreq)
    .filter(([_, freq]) => freq > 1 && freq < totalWords * 0.1) // Not too rare, not too common
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 20)
    .map(([word, _]) => word);
  
  sentences.forEach((sentence, index) => {
    let score = 0;
    const words = sentence.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const sentenceLength = sentence.trim().length;
    
    // Position scoring - more nuanced
    const relativePosition = index / (sentences.length - 1 || 1);
    if (index === 0) score += 4; // First sentence often introduces main ideas
    else if (index === sentences.length - 1) score += 3; // Last sentence often concludes
    else if (relativePosition < 0.15) score += 2.5; // Early sentences introduce concepts
    else if (relativePosition > 0.85) score += 2; // Late sentences summarize or conclude
    else if (relativePosition > 0.4 && relativePosition < 0.7) score += 1; // Middle sentences develop ideas
    
    // Length scoring - optimal length for information density
    const wordCount = words.length;
    if (wordCount >= 10 && wordCount <= 25) score += 3; // Optimal length for comprehensive info
    else if (wordCount >= 6 && wordCount <= 35) score += 2; // Good length
    else if (wordCount >= 4 && wordCount <= 45) score += 1; // Acceptable length
    else if (wordCount < 4) score -= 1; // Too short, likely incomplete
    else if (wordCount > 50) score -= 1; // Too long, likely complex
    
    // Important terms frequency
    const importantTermsInSentence = words.filter(word => importantTerms.includes(word));
    score += importantTermsInSentence.length * 1.5; // Boost for important terms
    
    // Unique important terms (diversity bonus)
    const uniqueImportantTerms = new Set(importantTermsInSentence);
    score += uniqueImportantTerms.size * 0.5;
    
    // Content type indicators - strong signals
    if (/\b(therefore|consequently|as a result|this means|this indicates|this shows|this demonstrates)\b/i.test(sentence)) score += 3;
    if (/\b(important|significant|key|main|primary|essential|crucial|major|critical|fundamental|central)\b/i.test(sentence)) score += 2.5;
    if (/\b(enables?|allows?|provides?|offers?|creates?|establishes?|determines?|influences?)\b/i.test(sentence)) score += 2;
    if (/\b(focuses?|emphasizes?|highlights?|addresses?|examines?|explores?|investigates?)\b/i.test(sentence)) score += 1.8;
    
    // Structural and logical indicators
    if (/\b(first|second|third|next|then|finally|lastly|in conclusion|to summarize)\b/i.test(sentence)) score += 2;
    if (/\b(however|nevertheless|nonetheless|although|despite|while|whereas|in contrast)\b/i.test(sentence)) score += 1.5;
    if (/\b(furthermore|moreover|additionally|also|besides|in addition|similarly)\b/i.test(sentence)) score += 1.3;
    
    // Definition and explanation patterns
    if (/\b(?:is|are)\s+(?:a|an|the)?\s*[^.!?]*?(?:that|which|who)\b/i.test(sentence)) score += 2.5; // Definition pattern
    if (/\b(?:refers to|means|defined as|known as|characterized by)\b/i.test(sentence)) score += 2.5;
    if (/\b(?:such as|for example|including|like|especially|particularly)\b/i.test(sentence)) score += 1.5;
    
    // Factual and analytical content
    if (/\b(?:research|study|analysis|data|evidence|findings|results|shows?|indicates?|suggests?)\b/i.test(sentence)) score += 2;
    if (/\b(?:according to|based on|studies show|research indicates)\b/i.test(sentence)) score += 1.8;
    
    // Question patterns (often important for understanding)
    if (/\?/.test(sentence)) score += 1.5;
    
    // Avoid sentences that are just connective or transitional
    if (/^(?:however|moreover|furthermore|additionally|also|besides|in addition|similarly|therefore|consequently|as a result),?\s*$/i.test(sentence.trim())) {
      score -= 2;
    }
    
    // Boost for sentences with numbers or specific data
    if (/\b\d+(?:\.\d+)?(?:%|percent|percentage|million|billion|thousand)?\b/i.test(sentence)) score += 1;
    
    // Penalize very repetitive sentences
    const wordsSet = new Set(words);
    const uniquenessRatio = wordsSet.size / words.length;
    if (uniquenessRatio < 0.6) score -= 1; // Penalize repetitive sentences
    
    // Character-based penalties and bonuses
    if (sentenceLength < 30) score -= 0.5; // Too short sentences often lack context
    if (sentenceLength > 300) score -= 0.5; // Too long sentences can be hard to process
    
    scores[sentence] = Math.max(0, score); // Ensure no negative scores
  });
  
  return scores;
}

// Generate AI-style abstractive summary
function generateAISummary(text: string, analysis: TextAnalysis, detailed: boolean): string {
  const { mainTopics, keyEntities, sentimentTone, textStructure, importanceScores, concepts, definitions } = analysis;
  
  // Get sentences ordered by importance, not just first few
  const rankedSentences = Object.entries(importanceScores)
    .sort(([_, a], [__, b]) => b - a)
    .map(([sentence, score]) => ({ sentence: sentence.trim(), score }))
    .filter(item => item.sentence.length > 20); // Filter out very short sentences
  
  // Analyze text structure for better summarization
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
  const totalSentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15).length;
  
  if (detailed) {
    const summary = [];
    
    // Create intelligent overview
    const primaryTopic = mainTopics[0] || 'various subjects';
    const secondaryTopics = mainTopics.slice(1, 3);
    
    let overview = `**Comprehensive Analysis**: This ${totalSentences > 10 ? 'comprehensive' : 'focused'} content`;
    
    if (paragraphs.length > 1) {
      overview += ` is structured across ${paragraphs.length} main sections and`;
    }
    
    overview += ` examines ${primaryTopic}`;
    
    if (secondaryTopics.length > 0) {
      overview += `, with additional focus on ${secondaryTopics.join(' and ')}`;
    }
    
    overview += `. The content maintains a ${sentimentTone} tone throughout.`;
    summary.push(overview);
    
    // Extract key insights from highest-scoring sentences
    summary.push('\n**Core Insights**:');
    const keyInsights = rankedSentences.slice(0, Math.min(5, Math.ceil(totalSentences / 4)));
    
    keyInsights.forEach((item, index) => {
      const insight = synthesizeInsight(item.sentence, analysis);
      if (insight && insight.length > 20) {
        summary.push(`${index + 1}. ${insight}`);
      }
    });
    
    // Add conceptual definitions if available
    if (Object.keys(definitions).length > 0) {
      summary.push('\n**Key Concepts**:');
      Object.entries(definitions).slice(0, 2).forEach(([term, definition]) => {
        summary.push(`• **${term}**: ${definition}`);
      });
    }
    
    // Add important entities and their context
    if (keyEntities.length > 0) {
      const contextualEntities = keyEntities.slice(0, 4).map(entity => {
        const context = findEntityContext(entity, text);
        return context ? `${entity} (${context})` : entity;
      });
      summary.push(`\n**Key Elements**: ${contextualEntities.join(', ')}`);
    }
    
    // Add structural insights for longer texts
    if (paragraphs.length > 2) {
      const structuralInsight = analyzeContentFlow(paragraphs, analysis);
      if (structuralInsight) {
        summary.push(`\n**Content Structure**: ${structuralInsight}`);
      }
    }
    
    return summary.join('\n');
    
  } else {
    // Create concise but intelligent summary
    const primaryTopic = mainTopics[0] || 'the subject matter';
    const topInsights = rankedSentences.slice(0, 2);
    
    let summary = `This content focuses on ${primaryTopic}`;
    
    if (topInsights.length > 0) {
      const mainInsight = synthesizeInsight(topInsights[0].sentence, analysis);
      if (mainInsight) {
        summary += `. ${mainInsight}`;
      }
      
      if (topInsights.length > 1) {
        const secondaryInsight = synthesizeInsight(topInsights[1].sentence, analysis);
        if (secondaryInsight && secondaryInsight !== mainInsight) {
          summary += ` Additionally, ${secondaryInsight.toLowerCase()}`;
        }
      }
    }
    
    // Add most important entity if relevant
    if (keyEntities.length > 0) {
      const primaryEntity = keyEntities[0];
      const entityContext = findEntityContext(primaryEntity, text);
      if (entityContext && !summary.toLowerCase().includes(primaryEntity.toLowerCase())) {
        summary += ` The discussion emphasizes ${primaryEntity}`;
        if (entityContext.length < 100) {
          summary += ` as ${entityContext}`;
        }
      }
    }
    
    summary += '.';
    return summary;
  }
}

// New function to synthesize insights from sentences
function synthesizeInsight(sentence: string, analysis: TextAnalysis): string {
  if (!sentence || sentence.length < 20) return '';
  
  // Clean and enhance the sentence for summary
  let insight = sentence
    .replace(/^(However|Moreover|Furthermore|Additionally|Consequently|Therefore|Thus|Hence),?\s*/i, '')
    .replace(/\b(it is important to note that|it should be mentioned that|it is worth noting that|one should consider that)\b/gi, '')
    .replace(/\b(this means that|this implies that|this suggests that)\b/gi, 'this indicates')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Ensure insight starts with capital letter
  if (insight.length > 0) {
    insight = insight.charAt(0).toUpperCase() + insight.slice(1);
  }
  
  // Remove redundant phrases and make more concise
  insight = insight
    .replace(/\b(in this context|in this regard|with respect to this)\b/gi, '')
    .replace(/\b(it can be seen that|it can be observed that)\b/gi, '')
    .trim();
  
  return insight;
}

// New function to analyze content flow
function analyzeContentFlow(paragraphs: string[], analysis: TextAnalysis): string {
  if (paragraphs.length < 2) return '';
  
  const { mainTopics } = analysis;
  
  if (paragraphs.length === 2) {
    return 'The content is organized into two complementary sections that build upon each other';
  } else if (paragraphs.length === 3) {
    return 'The content follows a three-part structure: introduction of concepts, detailed analysis, and implications';
  } else if (paragraphs.length > 3) {
    return `The content is systematically organized across ${paragraphs.length} sections, providing comprehensive coverage of ${mainTopics[0] || 'the topic'}`;
  }
  
  return '';
}

// Simplify sentence for summary inclusion
function simplifyForSummary(sentence: string): string {
  return sentence
    .replace(/^(However|Moreover|Furthermore|Additionally|Consequently|Therefore),?\s*/i, '')
    .replace(/\b(it is important to note that|it should be mentioned that|it is worth noting that)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Enhanced extractive summarization
function generateExtractiveSummary(text: string, analysis: TextAnalysis, detailed: boolean): string {
  const { importanceScores } = analysis;
  
  const topSentences = Object.entries(importanceScores)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, detailed ? 5 : 3)
    .map(([sentence, _]) => sentence.trim());
  
  if (detailed) {
    return topSentences.map(sentence => `• ${sentence}`).join('\n');
  } else {
    return topSentences.join('. ') + '.';
  }
}

export async function summarizeText(text: string, options: SummarizationOptions): Promise<string> {
  await delay(1500);
  
  if (text.length < 50) {
    return "Text is too short to generate a meaningful summary. Please provide more content.";
  }
  
  const preprocessedText = preprocessText(text);
  const analysis = analyzeText(preprocessedText);
  
  if (options.method === 'extractive') {
    return generateExtractiveSummary(preprocessedText, analysis, options.type === 'detailed');
  } else {
    return generateAISummary(preprocessedText, analysis, options.type === 'detailed');
  }
}

// Generate natural, contextual questions without text references
function generateNaturalQuestions(text: string, analysis: TextAnalysis, numQuestions: number, difficulty: string): QuizQuestion[] {
  const { mainTopics, keyEntities, concepts, definitions, relationships } = analysis;
  const questions: QuizQuestion[] = [];
  
  // Question templates for natural language
  const questionTemplates = {
    definition: [
      "What is {concept}?",
      "How would you define {concept}?",
      "Which best describes {concept}?",
      "{concept} refers to:"
    ],
    function: [
      "What is the primary purpose of {concept}?",
      "What does {concept} enable?",
      "How does {concept} work?",
      "What is {concept} used for?"
    ],
    comparison: [
      "Which of the following is a key characteristic of {concept}?",
      "What distinguishes {concept} from other approaches?",
      "Which statement about {concept} is most accurate?",
      "How does {concept} differ in its approach?"
    ],
    application: [
      "In which area is {concept} most commonly applied?",
      "What type of problems does {concept} solve?",
      "Which industry benefits most from {concept}?",
      "Where would you typically encounter {concept}?"
    ],
    technical: [
      "Which technique is essential for {concept}?",
      "What component is crucial in {concept}?",
      "Which method is commonly used in {concept}?",
      "What tool is typically associated with {concept}?"
    ]
  };
  
  // Extract key information for question generation
  const questionCandidates = [];
  
  // From definitions
  Object.entries(definitions).forEach(([term, definition]) => {
    questionCandidates.push({
      type: 'definition',
      concept: term,
      correctAnswer: definition,
      context: `${term} is ${definition}`
    });
  });
  
  // From concepts
  concepts.forEach(concept => {
    const relatedInfo = findRelatedInformation(concept, text);
    if (relatedInfo) {
      questionCandidates.push({
        type: 'function',
        concept: concept,
        correctAnswer: relatedInfo,
        context: relatedInfo
      });
    }
  });
  
  // From key entities and their context
  keyEntities.forEach(entity => {
    const entityContext = findEntityContext(entity, text);
    if (entityContext) {
      questionCandidates.push({
        type: 'technical',
        concept: entity,
        correctAnswer: entityContext,
        context: entityContext
      });
    }
  });
  
  // Generate questions from candidates
  const selectedCandidates = questionCandidates.slice(0, numQuestions);
  
  selectedCandidates.forEach((candidate, index) => {
    const templates = questionTemplates[candidate.type] || questionTemplates.definition;
    const template = templates[index % templates.length];
    const question = template.replace('{concept}', candidate.concept);
    
    // Generate intelligent options
    const options = generateIntelligentOptions(candidate.correctAnswer, candidate.concept, text, difficulty);
    
    questions.push({
      question,
      options,
      answer: options.find(opt => opt.includes(candidate.correctAnswer.split(' ').slice(0, 3).join(' '))) || options[0],
      explanation: `This relates to the core concept of ${candidate.concept} and its role in the domain.`
    });
  });
  
  // Fill remaining slots with general questions if needed
  while (questions.length < numQuestions) {
    const generalQuestion = generateGeneralQuestion(text, analysis, questions.length);
    if (generalQuestion) {
      questions.push(generalQuestion);
    } else {
      break;
    }
  }
  
  return questions;
}

// Find related information for a concept
function findRelatedInformation(concept: string, text: string): string | null {
  const sentences = text.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(concept.toLowerCase())) {
      // Extract the key information about this concept
      const info = sentence.trim();
      if (info.length > 20 && info.length < 200) {
        return info;
      }
    }
  }
  
  return null;
}

// Find context for an entity
function findEntityContext(entity: string, text: string): string | null {
  const sentences = text.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    if (sentence.includes(entity)) {
      // Extract what this entity does or represents
      const contextMatch = sentence.match(new RegExp(`${entity}[^.!?]*(?:is|are|enables?|provides?|helps?|allows?)[^.!?]*`, 'i'));
      if (contextMatch) {
        return contextMatch[0].trim();
      }
    }
  }
  
  return null;
}

// Generate intelligent options for multiple choice
function generateIntelligentOptions(correctAnswer: string, concept: string, text: string, difficulty: string): string[] {
  const options = [];
  
  // Add the correct answer (simplified)
  const simplifiedCorrect = simplifyAnswer(correctAnswer);
  options.push(simplifiedCorrect);
  
  // Generate plausible wrong answers
  const wrongAnswers = generatePlausibleWrongAnswers(simplifiedCorrect, concept, text, difficulty);
  options.push(...wrongAnswers);
  
  // Ensure we have exactly 4 options
  while (options.length < 4) {
    options.push(generateGenericWrongAnswer(concept));
  }
  
  // Shuffle options
  return options.slice(0, 4).sort(() => Math.random() - 0.5);
}

// Simplify answer for multiple choice format
function simplifyAnswer(answer: string): string {
  return answer
    .replace(/^(a|an|the)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

// Generate plausible wrong answers
function generatePlausibleWrongAnswers(correctAnswer: string, concept: string, text: string, difficulty: string): string[] {
  const wrongAnswers = [];
  
  // Strategy 1: Modify correct answer with negation or opposite
  const modified1 = correctAnswer
    .replace(/\b(enables?|allows?|helps?)\b/gi, 'prevents')
    .replace(/\b(understanding|interpretation)\b/gi, 'confusion')
    .replace(/\b(advanced|modern|sophisticated)\b/gi, 'basic');
  
  if (modified1 !== correctAnswer && modified1.length > 10) {
    wrongAnswers.push(modified1);
  }
  
  // Strategy 2: Create domain-related but incorrect statements
  const domainTerms = extractDomainTerms(text);
  if (domainTerms.length > 0) {
    const randomTerm = domainTerms[Math.floor(Math.random() * domainTerms.length)];
    wrongAnswers.push(`A specialized approach focused primarily on ${randomTerm}`);
  }
  
  // Strategy 3: Create plausible but incorrect technical statements
  wrongAnswers.push(`A traditional method that predates modern computational approaches`);
  
  return wrongAnswers.slice(0, 3);
}

// Extract domain-specific terms
function extractDomainTerms(text: string): string[] {
  const technicalTerms = text.match(/\b[a-z]+(?:-[a-z]+)+\b/gi) || [];
  const capitalizedTerms = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  
  return [...new Set([...technicalTerms, ...capitalizedTerms])].slice(0, 10);
}

// Generate generic wrong answer
function generateGenericWrongAnswer(concept: string): string {
  const genericAnswers = [
    `An outdated approach that has been largely replaced`,
    `A hardware-based solution requiring specialized equipment`,
    `A manual process that doesn't involve computational methods`,
    `A theoretical framework with limited practical applications`
  ];
  
  return genericAnswers[Math.floor(Math.random() * genericAnswers.length)];
}

// Generate general question when specific concepts are exhausted
function generateGeneralQuestion(text: string, analysis: TextAnalysis, questionIndex: number): QuizQuestion | null {
  const { mainTopics, keyEntities } = analysis;
  
  if (mainTopics.length === 0) return null;
  
  const topic = mainTopics[0];
  const questions = [
    {
      question: `What is a key characteristic of ${topic}?`,
      options: [
        `It involves computational processing and analysis`,
        `It requires only manual intervention`,
        `It works exclusively with numerical data`,
        `It operates without any algorithmic components`
      ],
      answer: `It involves computational processing and analysis`
    },
    {
      question: `Which field does ${topic} primarily relate to?`,
      options: [
        `Computer science and artificial intelligence`,
        `Traditional manufacturing processes`,
        `Agricultural development`,
        `Mechanical engineering`
      ],
      answer: `Computer science and artificial intelligence`
    }
  ];
  
  return questions[questionIndex % questions.length] || null;
}

export async function generateQuiz(text: string, options: QuizOptions): Promise<QuizQuestion[]> {
  await delay(2000);
  
  if (text.length < 100) {
    return [{
      question: "The provided text is too short to generate meaningful questions. Please provide more content.",
      options: ["Understood", "I'll provide more text", "Generate anyway", "Cancel"],
      answer: "Understood",
      explanation: "Meaningful quiz generation requires substantial text content for analysis."
    }];
  }
  
  const preprocessedText = preprocessText(text);
  const analysis = analyzeText(preprocessedText);
  
  return generateNaturalQuestions(preprocessedText, analysis, options.numQuestions, options.difficulty);
}

export async function answerQuestion(question: string, context: string): Promise<string> {
  await delay(1000);
  
  if (context.length < 20) {
    return "The provided context is too short to answer questions meaningfully. Please provide more detailed context.";
  }
  
  const analysis = analyzeText(context);
  const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const questionLower = question.toLowerCase();
  
  const questionType = analyzeQuestionType(question);
  const questionKeywords = extractQuestionKeywords(question);
  
  const scoredSentences = sentences.map(sentence => {
    const sentenceLower = sentence.toLowerCase();
    let score = 0;
    
    questionKeywords.forEach(keyword => {
      if (sentenceLower.includes(keyword)) {
        score += keyword.length > 4 ? 3 : 2;
      }
    });
    
    switch (questionType) {
      case 'what':
        if (/\b(is|are|means|refers|definition|describes)\b/.test(sentenceLower)) score += 2;
        break;
      case 'how':
        if (/\b(by|through|via|method|process|way|manner)\b/.test(sentenceLower)) score += 2;
        break;
      case 'why':
        if (/\b(because|due|reason|cause|since|as|result)\b/.test(sentenceLower)) score += 2;
        break;
      case 'when':
        if (/\b(time|date|period|during|when|while|after|before)\b/.test(sentenceLower)) score += 2;
        break;
      case 'where':
        if (/\b(location|place|area|region|where|in|at|on)\b/.test(sentenceLower)) score += 2;
        break;
    }
    
    analysis.keyEntities.forEach(entity => {
      if (questionLower.includes(entity.toLowerCase()) && sentenceLower.includes(entity.toLowerCase())) {
        score += 2;
      }
    });
    
    return { sentence: sentence.trim(), score };
  });
  
  const relevantSentences = scoredSentences
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  
  if (relevantSentences.length === 0) {
    return `I couldn't find information directly related to "${question}" in the provided context. The context appears to focus on ${analysis.mainTopics.join(', ')}. Please ensure your question relates to the content provided.`;
  }
  
  const primaryAnswer = relevantSentences[0].sentence;
  const supportingInfo = relevantSentences.slice(1, 2).map(item => item.sentence);
  
  let response = '';
  
  switch (questionType) {
    case 'what':
      response = `${primaryAnswer}`;
      break;
    case 'how':
      response = `${primaryAnswer}`;
      break;
    case 'why':
      response = `${primaryAnswer}`;
      break;
    case 'when':
    case 'where':
      response = `${primaryAnswer}`;
      break;
    default:
      response = primaryAnswer;
  }
  
  if (supportingInfo.length > 0 && supportingInfo[0].length > 20) {
    response += ` Additionally, ${supportingInfo[0]}`;
  }
  
  return response;
}

// Analyze question type
function analyzeQuestionType(question: string): string {
  const questionLower = question.toLowerCase();
  
  if (questionLower.startsWith('what')) return 'what';
  if (questionLower.startsWith('how')) return 'how';
  if (questionLower.startsWith('why')) return 'why';
  if (questionLower.startsWith('when')) return 'when';
  if (questionLower.startsWith('where')) return 'where';
  if (questionLower.startsWith('who')) return 'who';
  if (questionLower.startsWith('which')) return 'which';
  
  return 'general';
}

// Extract keywords from question
function extractQuestionKeywords(question: string): string[] {
  const stopWords = new Set(['what', 'how', 'why', 'when', 'where', 'who', 'which', 'is', 'are', 'was', 'were', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'by', 'from', 'with', 'about']);
  
  return question
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}