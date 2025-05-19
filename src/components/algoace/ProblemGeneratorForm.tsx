'use client';

import type { ProblemDifficulty, CodingLanguage, DsaTopic } from '@/lib/types';
import { CODING_LANGUAGES, DSA_TOPICS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import * as React from 'react';

const codingLanguagesEnum = z.enum(CODING_LANGUAGES);
const dsaTopicsEnum = z.enum(DSA_TOPICS);

const formSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard'] as [ProblemDifficulty, ...ProblemDifficulty[]], {
    required_error: "Difficulty is required.",
  }),
  topics: z.array(dsaTopicsEnum).min(1, "At least one topic is required."),
  language: codingLanguagesEnum,
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
      topics: [DSA_TOPICS[0], DSA_TOPICS[1]], // Default to first two topics
      language: CODING_LANGUAGES[0], // Default to first language in the list
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await onGenerateProblem(data);
  };

  const selectedTopics = form.watch('topics') || [];

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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={isLoading}>
                      <Button variant="outline" className="w-full justify-between">
                        {selectedTopics.length > 0
                          ? selectedTopics.join(', ').length > 40 ? `${selectedTopics.slice(0,3).join(', ')}...` : selectedTopics.join(', ')
                          : "Select topics"}
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                      <DropdownMenuLabel>Select Topics</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {DSA_TOPICS.map((topic) => (
                        <DropdownMenuCheckboxItem
                          key={topic}
                          checked={field.value?.includes(topic)}
                          onCheckedChange={(checked) => {
                            const currentTopics = field.value || [];
                            if (checked) {
                              field.onChange([...currentTopics, topic]);
                            } else {
                              field.onChange(currentTopics.filter((t) => t !== topic));
                            }
                          }}
                        >
                          {topic}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {CODING_LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
