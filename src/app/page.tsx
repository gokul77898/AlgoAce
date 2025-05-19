'use client';

import { useState, type FC } from 'react';
import type { Problem, AnalysisResult, CodingLanguage, ProblemDifficulty } from '@/lib/types';
import { generateProblem, type GenerateProblemInput } from '@/ai/flows/generate-problem';
import { analyzeCode, type AnalyzeCodeInput } from '@/ai/flows/analyze-code';
import { AppHeader } from '@/components/algoace/AppHeader';
import { ProblemGeneratorForm } from '@/components/algoace/ProblemGeneratorForm';
import { ProblemDisplay } from '@/components/algoace/ProblemDisplay';
import { CodeEditor } from '@/components/algoace/CodeEditor';
import { AnalysisDisplay } from '@/components/algoace/AnalysisDisplay';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

const AlgoAcePage: FC = () => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [code, setCode] = useState<string>('');
  const [currentLanguage, setCurrentLanguage] = useState<CodingLanguage>('javascript');
  
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const { toast } = useToast();

  const handleGenerateProblem = async (values: { difficulty: ProblemDifficulty; topics: string; language: CodingLanguage }) => {
    setIsLoadingProblem(true);
    setProblem(null); 
    setAnalysis(null); 
    setCode(''); 
    setCurrentLanguage(values.language); // Set language based on form selection for upcoming problem
    try {
      const problemInput: GenerateProblemInput = {
        difficulty: values.difficulty,
        topics: values.topics,
        language: values.language,
      };
      const generatedProblem = await generateProblem(problemInput);
      setProblem(generatedProblem);
      setCurrentLanguage(generatedProblem.language); // Confirm language from generated problem
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
      setProblem(null); // Ensure problem is null on error
      setCurrentLanguage('javascript'); // Reset language to default on error
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
        language: problem.language, // Use the language from the generated problem
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
      <CardContent className="flex flex-col items-center justify-center p-6 text-center min-h-[200px]">
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
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Pane */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <ProblemGeneratorForm
              onGenerateProblem={handleGenerateProblem}
              isLoading={isLoadingProblem}
            />
            {isLoadingProblem && <LoadingSkeleton section="problem" />}
            {!isLoadingProblem && problem && <ProblemDisplay problem={problem} />}
            {!isLoadingProblem && !problem && <ProblemDisplayPlaceholder />}
          </div>

          {/* Right Pane */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <CodeEditor
              language={problem?.language || currentLanguage} // Use problem's language or fallback to selected
              problemDescription={problem?.description || ''}
              code={code}
              setCode={setCode}
              onAnalyzeCode={handleAnalyzeCode}
              isLoading={isLoadingAnalysis}
              disabled={!problem || isLoadingProblem}
            />
            {isLoadingAnalysis && <LoadingSkeleton section="analysis" />}
            {!isLoadingAnalysis && analysis && <AnalysisDisplay analysis={analysis} />}
            {!isLoadingAnalysis && !analysis && <AnalysisDisplayPlaceholder />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlgoAcePage;
