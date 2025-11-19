import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2, Trash2 } from "lucide-react";
import { cyclePhases, CyclePhase } from "@/lib/cycleData";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { ConversationList } from "@/components/ConversationList";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<CyclePhase | 'none'>('none');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadOrCreateConversation();
  }, []);

  const loadOrCreateConversation = async (conversationIdToLoad?: string) => {
    let currentConvId: string;

    if (conversationIdToLoad) {
      currentConvId = conversationIdToLoad;
    } else {
      // Try to load the most recent conversation
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (convError) {
        console.error('Error loading conversations:', convError);
        return;
      }

      if (conversations && conversations.length > 0) {
        currentConvId = conversations[0].id;
      } else {
        // Create a new conversation
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({ title: 'New Conversation' })
          .select()
          .single();

        if (createError || !newConv) {
          console.error('Error creating conversation:', createError);
          return;
        }

        currentConvId = newConv.id;
      }
    }

    setConversationId(currentConvId);

    // Load messages for this conversation
    const { data: chatMessages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', currentConvId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error loading messages:', messagesError);
      return;
    }

    if (chatMessages && chatMessages.length > 0) {
      setMessages(chatMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })));
    } else {
      setMessages([]);
    }
  };

  const handleCreateConversation = async () => {
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({ title: 'New Conversation' })
      .select()
      .single();

    if (error || !newConv) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error creating conversation",
        description: error?.message,
        variant: "destructive",
      });
      return;
    }

    await loadOrCreateConversation(newConv.id);
  };

  const handleSelectConversation = async (id: string) => {
    await loadOrCreateConversation(id);
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!conversationId) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        current_phase: currentPhase === 'none' ? null : currentPhase
      });

    if (error) {
      console.error('Error saving message:', error);
    }

    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  };

  const handleClearChat = async () => {
    if (!conversationId) return;

    // Delete all messages for this conversation
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (error) {
      toast({
        title: "Error clearing chat",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setMessages([]);
    toast({
      title: "Chat cleared",
      description: "Your conversation has been cleared.",
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    setIsLoading(true);
    
    try {
      // Load recent journal entries for context
      const { data: recentEntries } = await supabase
        .from('cycle_entries')
        .select('entry_date, phase, notes')
        .not('notes', 'is', null)
        .order('entry_date', { ascending: false })
        .limit(10);

      let journalContext = '';
      if (recentEntries && recentEntries.length > 0) {
        journalContext = '\n\nRECENT JOURNAL ENTRIES:\n' + 
          recentEntries.map(entry => 
            `${entry.entry_date} (${cyclePhases[entry.phase as CyclePhase].name}): ${entry.notes}`
          ).join('\n');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cycle-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          currentPhase: currentPhase === 'none' ? null : currentPhase,
          journalContext,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Rate limit exceeded",
            description: "Please try again later.",
            variant: "destructive",
          });
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Payment required",
            description: "Please add funds to continue using the AI assistant.",
            variant: "destructive",
          });
          return;
        }
        throw new Error('Failed to get response');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantMessage = '';
      let streamDone = false;

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantMessage += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: assistantMessage
                };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Save the complete assistant message
      if (assistantMessage) {
        await saveMessage('assistant', assistantMessage);
      }

    } catch (error) {
      console.error('Error streaming chat:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI assistant.",
        variant: "destructive",
      });
      // Remove the empty assistant message if error occurred
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Save user message
    await saveMessage('user', userMessage);

    await streamChat(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">AI Assistant</h2>
            <p className="text-muted-foreground">
              Ask questions and get personalized advice about cycle phases
            </p>
          </div>

          <div className="grid lg:grid-cols-[280px,1fr] gap-6">
            <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-8rem)]">
              <ConversationList
                currentConversationId={conversationId}
                onSelectConversation={handleSelectConversation}
                onCreateConversation={handleCreateConversation}
              />
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <Card className="p-4 flex-1">
                  <div className="space-y-2">
                    <Label>Current Phase (Optional)</Label>
                    <Select value={currentPhase} onValueChange={(value) => setCurrentPhase(value as CyclePhase | 'none')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select current phase..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No phase selected</SelectItem>
                        {Object.entries(cyclePhases).map(([key, phase]) => (
                          <SelectItem key={key} value={key}>
                            {phase.icon} {phase.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Card>

                <Card className="p-4 flex items-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={handleClearChat}
                    disabled={messages.length === 0}
                    title="Clear chat"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </Card>
              </div>

          <Card className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <p>Start a conversation by asking a question about any cycle phase!</p>
                  <p className="text-sm mt-2">
                    Example: "What should I do if she's feeling down during the luteal phase?"
                  </p>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question..."
                  className="min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-[60px] w-[60px]"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;