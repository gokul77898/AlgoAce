'use client';

import type { ProblemDifficulty, CodingLanguage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

const codingLanguages: [CodingLanguage, ...CodingLanguage[]] = ['javascript', 'python', 'java', 'cpp', 'go'];

const formSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard'] as [ProblemDifficulty, ...ProblemDifficulty[]], {
    required_error: "Difficulty is required.",
  }),
  topics: z.string().min(1, "Topics are required (e.g., arrays, strings, trees, graphs, dynamic programming, sorting, searching)."),
  language: z.enum(codingLanguages, {
    required_error: "Language is required.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ProblemGeneratorFormProps {
  onGenerateProblem: (values: FormValues) => Promise<void>;
  isLoading: boolean;
}

export function ProblemGeneratorForm({ onGenerateProblem, isLoading }: ProblemGeneratorFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      difficulty: 'easy',
      topics: 'arrays, strings, basic algorithms',
      language: 'javascript',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await onGenerateProblem(data);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-6 w-6 text-primary" />
          Generate Coding Problem
        </CardTitle>
        <CardDescription>Select difficulty, topics (e.g., Data Structures & Algorithms), and language to generate a new coding challenge.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="topics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topics / Keywords</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., linked lists, trees, graphs, dynamic programming, sorting" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Preferred Language</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-x-4 gap-y-2"
                      disabled={isLoading}
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="javascript" />
                        </FormControl>
                        <FormLabel className="font-normal">JavaScript</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="python" />
                        </FormControl>
                        <FormLabel className="font-normal">Python</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="java" />
                        </FormControl>
                        <FormLabel className="font-normal">Java</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cpp" />
                        </FormControl>
                        <FormLabel className="font-normal">C++</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="go" />
                        </FormControl>
                        <FormLabel className="font-normal">Go</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Problem
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
