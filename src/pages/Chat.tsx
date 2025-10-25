import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Copy, LogOut, Users } from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

const Chat = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [userId] = useState(() => `user-${Math.random().toString(36).substring(2, 9)}`);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!roomCode) return;

    // Create channel for this room
    const channel = supabase.channel(`room:${roomCode}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    // Track presence
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state);
        setConnectedUsers(users);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        toast({
          title: "User joined",
          description: `${key} joined the chat`,
        });
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        toast({
          title: "User left",
          description: `${key} left the chat`,
        });
      })
      .on("broadcast", { event: "message" }, ({ payload }) => {
        setMessages((prev) => [...prev, payload as Message]);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ userId, online_at: new Date().toISOString() });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [roomCode, userId, toast]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !channelRef.current) return;

    const message: Message = {
      id: `${Date.now()}-${Math.random()}`,
      text: inputMessage,
      sender: userId,
      timestamp: Date.now(),
    };

    await channelRef.current.send({
      type: "broadcast",
      event: "message",
      payload: message,
    });

    setMessages((prev) => [...prev, message]);
    setInputMessage("");
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode || "");
    toast({
      title: "Code Copied",
      description: "Room code copied to clipboard",
    });
  };

  const leaveRoom = () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SecureChat
            </h1>
            <Card className="px-4 py-2 bg-muted border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Room:</span>
                <span className="font-mono font-bold text-foreground">{roomCode}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={copyRoomCode}
                  className="h-6 w-6"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">{connectedUsers.length} online</span>
            </div>
            <Button onClick={leaveRoom} variant="destructive" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 container mx-auto px-4 py-6 overflow-y-auto">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
          {messages.map((msg) => {
            const isOwn = msg.sender === userId;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <Card
                  className={`max-w-[70%] p-4 ${
                    isOwn
                      ? "bg-gradient-to-r from-primary to-accent text-white border-none"
                      : "bg-card border-border"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs opacity-70">
                      {isOwn ? "You" : msg.sender}
                    </span>
                    <p className={isOwn ? "text-white" : "text-foreground"}>
                      {msg.text}
                    </p>
                    <span className="text-xs opacity-60">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </Card>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm sticky bottom-0">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Input
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 bg-background border-border"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              variant="hero"
              size="icon"
              className="h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
