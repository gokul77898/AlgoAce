'use client';

import { useState, type FC, useEffect } from 'react';
import type { Problem, AnalysisResult, CodingLanguage, ProblemDifficulty, DsaTopic, ChatMessage } from '@/lib/types';
import { generateProblem, type GenerateProblemInput } from '@/ai/flows/generate-problem';
import { analyzeCode, type AnalyzeCodeInput } from '@/ai/flows/analyze-code';
import { chatbotProcessMessage, type ChatbotInput } from '@/ai/flows/chatbot-flow';
import { AppHeader } from '@/components/algoace/AppHeader';
import { ProblemGeneratorForm } from '@/components/algoace/ProblemGeneratorForm';
import { ProblemDisplay } from '@/components/algoace/ProblemDisplay';
import { CodeEditor } from '@/components/algoace/CodeEditor';
import { AnalysisDisplay } from '@/components/algoace/AnalysisDisplay';
import { Chatbot } from '@/components/algoace/Chatbot';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { CODING_LANGUAGES } from '@/lib/types';
import type { ContentPart } from 'genkit/model';

const AlgoAcePage: FC = () => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [code, setCode] = useState<string>('');
  const [currentLanguage, setCurrentLanguage] = useState<CodingLanguage>(CODING_LANGUAGES[0]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingBotResponse, setIsLoadingBotResponse] = useState(false);
  const { toast } = useToast();

  const handleGenerateProblem = async (values: { difficulty: ProblemDifficulty; topics: DsaTopic[]; language: CodingLanguage }) => {
    setIsLoadingProblem(true);
    setProblem(null); 
    setAnalysis(null); 
    setCode(''); 
    setCurrentLanguage(values.language); 
    setChatHistory([]); // Reset chat history when a new problem is generated
    try {
      const problemInput: GenerateProblemInput = {
        difficulty: values.difficulty,
        topics: values.topics,
        language: values.language,
      };
      const generatedProblem = await generateProblem(problemInput);
      setProblem(generatedProblem);
      setCurrentLanguage(generatedProblem.language);
      toast({
        title: "Problem Generated!",
        description: `A new ${generatedProblem.language} challenge is ready for you.`,
      });
    } catch (error) {
      console.error("Failed to generate problem:", error);
      toast({
        title: "Error Generating Problem",
        description: "Could not generate a new problem. Please try again.",
        variant: "destructive",
      });
      setProblem(null); 
      setCurrentLanguage(CODING_LANGUAGES[0]); 
    } finally {
      setIsLoadingProblem(false);
    }
  };

  const handleAnalyzeCode = async () => {
    if (!problem) {
      toast({
        title: "No Problem Loaded",
        description: "Please generate a problem first before analyzing code.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingAnalysis(true);
    setAnalysis(null);
    try {
      const analysisInput: AnalyzeCodeInput = {
        code,
        language: problem.language, 
        problemDescription: problem.description,
      };
      const analysisResult = await analyzeCode(analysisInput);
      setAnalysis(analysisResult);
      toast({
        title: "Code Analysis Complete",
        description: "Check the suggestions for your solution.",
      });
    } catch (error) {
      console.error("Failed to analyze code:", error);
      toast({
        title: "Error Analyzing Code",
        description: "Could not analyze your code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleSendChatMessage = async (
    message: string,
    currentProblemContext: Problem | null,
    currentCodeContext: string,
    currentChatHistory: ChatMessage[]
  ): Promise<string | null> => {
    setIsLoadingBotResponse(true);
    const userMessageId = Date.now().toString();
    const userMessageEntry: ChatMessage = { id: userMessageId, role: 'user', text: message };
    
    // Add user message and a temporary bot loading message
    setChatHistory(prev => [...prev, userMessageEntry, {id: `${userMessageId}-botload`, role: 'bot', text: '', isLoading: true}]);

    try {
      const chatbotInput: ChatbotInput = {
        userMessage: message,
        problemTitle: currentProblemContext?.title,
        problemDescription: currentProblemContext?.description,
        currentCode: currentCodeContext,
        chatHistory: currentChatHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model', // Map to Genkit's expected roles
          parts: [{text: msg.text}] as ContentPart[],
        })),
      };
      const response = await chatbotProcessMessage(chatbotInput);
      
      setChatHistory(prev => {
        const updatedHistory = [...prev];
        const loadingBotMsgIndex = updatedHistory.findIndex(msg => msg.isLoading);
        if (loadingBotMsgIndex !== -1) {
          updatedHistory[loadingBotMsgIndex] = { id: `${userMessageId}-bot`, role: 'bot', text: response.botResponse };
        } else {
           // Should not happen if loading message was added, but as a fallback
          updatedHistory.push({ id: `${userMessageId}-bot`, role: 'bot', text: response.botResponse });
        }
        return updatedHistory;
      });
      return response.botResponse;
    } catch (error) {
      console.error("Failed to get chatbot response:", error);
      const errorText = "Sorry, I encountered an error. Please try again.";
      setChatHistory(prev => {
         const updatedHistory = [...prev];
        const loadingBotMsgIndex = updatedHistory.findIndex(msg => msg.isLoading);
        if (loadingBotMsgIndex !== -1) {
          updatedHistory[loadingBotMsgIndex] = { id: `${userMessageId}-bot-error`, role: 'bot', text: errorText };
        } else {
          updatedHistory.push({ id: `${userMessageId}-bot-error`, role: 'bot', text: errorText });
        }
        return updatedHistory;
      });
      toast({
        title: "Chatbot Error",
        description: "Could not get a response from the assistant.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoadingBotResponse(false);
    }
  };
  
  const ProblemDisplayPlaceholder: FC = () => (
    <Card className="shadow-lg h-full">
      <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Image 
          src="https://placehold.co/300x200.png" 
          alt="Placeholder for problem" 
          width={300} 
          height={200} 
          className="rounded-lg mb-4 opacity-50"
          data-ai-hint="coding algorithm puzzle"
        />
        <h3 className="text-lg font-semibold text-muted-foreground">No Problem Loaded</h3>
        <p className="text-sm text-muted-foreground">Generate a new problem to get started!</p>
      </CardContent>
    </Card>
  );

  const AnalysisDisplayPlaceholder: FC = () => (
     <Card className="shadow-lg">
      <CardContent className="flex flex-col items-center justify-center p-6 text-center min-h-[150px]">
        <Image 
            src="https://placehold.co/200x150.png" 
            alt="Placeholder for analysis" 
            width={200} 
            height={150} 
            className="rounded-lg mb-4 opacity-30"
            data-ai-hint="code review feedback"
          />
        <h3 className="text-lg font-semibold text-muted-foreground">No Analysis Yet</h3>
        <p className="text-sm text-muted-foreground">Write some code and click "Analyze Code" to get feedback.</p>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton: FC<{ section: 'problem' | 'analysis' }> = ({ section }) => (
    <Card className="shadow-lg">
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-20 w-full" />
        {section === 'problem' && (
          <>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </>
        )}
      </CardContent>
    </Card>
  );


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Pane */}
          <div className="flex flex-col gap-6">
            <ProblemGeneratorForm
              onGenerateProblem={handleGenerateProblem}
              isLoading={isLoadingProblem}
            />
            {isLoadingProblem && <LoadingSkeleton section="problem" />}
            {!isLoadingProblem && problem && <ProblemDisplay problem={problem} />}
            {!isLoadingProblem && !problem && <ProblemDisplayPlaceholder />}
          </div>

          {/* Right Pane */}
          <div className="flex flex-col gap-6">
            <CodeEditor
              language={problem?.language || currentLanguage} 
              problemDescription={problem?.description || ''}
              code={code}
              setCode={setCode}
              onAnalyzeCode={handleAnalyzeCode}
              isLoading={isLoadingAnalysis}
              disabled={!problem || isLoadingProblem}
            />
            
            <div className="grid grid-rows-[auto_minmax(0,1fr)] gap-6 lg:grid-rows-1 lg:grid-cols-2">
                <div className="lg:col-span-1">
                    {isLoadingAnalysis && <LoadingSkeleton section="analysis" />}
                    {!isLoadingAnalysis && analysis && <AnalysisDisplay analysis={analysis} />}
                    {!isLoadingAnalysis && !analysis && <AnalysisDisplayPlaceholder />}
                </div>
                <div className="lg:col-span-1 h-full">
                    <Chatbot 
                        currentProblem={problem}
                        currentCode={code}
                        onSendMessage={handleSendChatMessage}
                        chatHistory={chatHistory}
                        isLoadingBotResponse={isLoadingBotResponse}
                        disabled={!problem || isLoadingProblem}
                    />
                </div>
            </div>


          </div>
        </div>
      </main>
    </div>
  );
};

export default AlgoAcePage;
