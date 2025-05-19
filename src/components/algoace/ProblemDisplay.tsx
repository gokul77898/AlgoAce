'use client';

import type { Problem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { BookOpenText, ListChecks, AlertTriangle } from 'lucide-react';

interface ProblemDisplayProps {
  problem: Problem;
}

export function ProblemDisplay({ problem }: ProblemDisplayProps) {
  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <BookOpenText className="h-6 w-6 text-primary"/>
          {problem.title || 'Coding Problem'}
        </CardTitle>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{problem.description}</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Constraints
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{problem.constraints}</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-green-600" />
              Examples
            </h3>
            <pre className="bg-muted p-3 rounded-md text-sm font-mono overflow-x-auto whitespace-pre-wrap">
              {problem.examples}
            </pre>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
