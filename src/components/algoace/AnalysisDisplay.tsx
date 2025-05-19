'use client';

import type { AnalysisResult } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, CheckCircle2 } from 'lucide-react';

interface AnalysisDisplayProps {
  analysis: AnalysisResult;
}

export function AnalysisDisplay({ analysis }: AnalysisDisplayProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Lightbulb className="h-6 w-6 text-primary" />
          Code Analysis
        </CardTitle>
        <CardDescription>Review the AI-powered suggestions to improve your code.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Overall Quality
            </h3>
            <p className="text-sm text-muted-foreground">{analysis.overallQuality}</p>
          </div>
          
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Suggestions</h3>
              <ScrollArea className="h-[200px] rounded-md border p-2 bg-muted/50">
                <Accordion type="single" collapsible className="w-full">
                  {analysis.suggestions.map((suggestion, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-sm text-left hover:no-underline">
                        Suggestion #{index + 1}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm whitespace-pre-wrap p-2">
                        {suggestion}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </div>
          )}
          {(!analysis.suggestions || analysis.suggestions.length === 0) && (
             <p className="text-sm text-muted-foreground">No specific suggestions provided, or your code is looking great!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
