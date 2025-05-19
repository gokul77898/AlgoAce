'use client';

import type { CodingLanguage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Code, Wand2, Loader2 } from 'lucide-react';

interface CodeEditorProps {
  language: CodingLanguage;
  problemDescription: string;
  code: string;
  setCode: (code: string) => void;
  onAnalyzeCode: () => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

export function CodeEditor({
  language,
  problemDescription,
  code,
  setCode,
  onAnalyzeCode,
  isLoading,
  disabled = false,
}: CodeEditorProps) {
  const handleAnalyze = async () => {
    if (problemDescription) {
      await onAnalyzeCode();
    }
  };

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Code className="h-6 w-6 text-primary" />
          Code Editor ({language})
        </CardTitle>
        <CardDescription>Write your {language} solution below. Ensure the problem is generated first to enable analysis.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`Enter your ${language} code here...`}
          className="flex-grow min-h-[200px] font-mono text-sm resize-none"
          disabled={disabled || isLoading}
        />
        <Button onClick={handleAnalyze} disabled={disabled || isLoading || !code.trim() || !problemDescription.trim()} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Analyze Code
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
