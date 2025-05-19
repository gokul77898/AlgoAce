'use client';

import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Problem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BotMessageSquare, Send, User, Loader2, Info } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatbotProps {
  currentProblem: Problem | null;
  currentCode: string;
  onSendMessage: (message: string, problem: Problem | null, code: string, chatHistory: ChatMessage[]) => Promise<string | null>;
  chatHistory: ChatMessage[];
  isLoadingBotResponse: boolean;
  disabled?: boolean;
}

export const Chatbot: FC<ChatbotProps> = ({
  currentProblem,
  currentCode,
  onSendMessage,
  chatHistory,
  isLoadingBotResponse,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleSend = async () => {
    if (inputValue.trim() === '' || isLoadingBotResponse) return;
    const messageToSend = inputValue;
    setInputValue('');
    await onSendMessage(messageToSend, currentProblem, currentCode, chatHistory);
  };
  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="shadow-lg flex flex-col h-full max-h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BotMessageSquare className="h-6 w-6 text-primary" />
          AlgoAce Assistant
        </CardTitle>
        <CardDescription>
          Stuck? Ask for hints, concept clarifications, or discuss your approach to the current problem. I'm here to guide you!
        </CardDescription>
      </CardHeader>
      <ScrollArea className="flex-grow p-0" ref={scrollAreaRef}>
        <CardContent className="space-y-4 p-4">
          {chatHistory.length === 0 && !disabled && (
            <div className="text-center text-muted-foreground p-4 rounded-md bg-muted/50">
              <Info className="mx-auto h-8 w-8 mb-2" />
              <p>No messages yet. Ask me anything about the current problem!</p>
            </div>
          )}
          {disabled && (
             <div className="text-center text-muted-foreground p-4 rounded-md bg-muted/50">
              <Info className="mx-auto h-8 w-8 mb-2" />
              <p>Please generate a problem first to activate the chatbot.</p>
            </div>
          )}
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex items-start gap-3',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'bot' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <BotMessageSquare size={18} />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[75%] rounded-lg p-3 text-sm whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {msg.text}
                {msg.isLoading && <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin" />}
              </div>
              {msg.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    <User size={18} />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </CardContent>
      </ScrollArea>
      <CardFooter className="pt-4 border-t">
        <div className="flex w-full items-center gap-2">
          <Input
            type="text"
            placeholder={disabled ? "Generate a problem to chat..." : "Type your message..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoadingBotResponse || disabled}
            className="flex-grow"
          />
          <Button onClick={handleSend} disabled={isLoadingBotResponse || disabled || inputValue.trim() === ''} size="icon">
            {isLoadingBotResponse ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
