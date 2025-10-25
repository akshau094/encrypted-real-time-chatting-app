import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageSquare, Lock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/chat/${code}`);
  };

  const joinRoom = () => {
    if (!joinCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter a room code to join",
        variant: "destructive",
      });
      return;
    }
    navigate(`/chat/${joinCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-4xl space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary to-accent shadow-[var(--shadow-glow)] mb-4">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SecureChat
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Private, encrypted, ephemeral messaging. Connect with a secret code, chat securely, and let your messages disappear when you logout.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card border-border hover:shadow-[var(--shadow-card)] transition-all duration-300">
            <Lock className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">End-to-End Privacy</h3>
            <p className="text-sm text-muted-foreground">
              Your messages are encrypted and only visible to connected users
            </p>
          </Card>
          <Card className="p-6 bg-card border-border hover:shadow-[var(--shadow-card)] transition-all duration-300">
            <Shield className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Registration</h3>
            <p className="text-sm text-muted-foreground">
              Just generate a code and share it. No accounts, no tracking
            </p>
          </Card>
          <Card className="p-6 bg-card border-border hover:shadow-[var(--shadow-card)] transition-all duration-300">
            <MessageSquare className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Self-Destructing</h3>
            <p className="text-sm text-muted-foreground">
              All messages vanish when you logout. Zero trace left behind
            </p>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 bg-gradient-to-br from-card to-muted border-border">
            <h2 className="text-2xl font-bold mb-4">Create a Room</h2>
            <p className="text-muted-foreground mb-6">
              Generate a unique code and share it with someone to start chatting
            </p>
            <Button 
              onClick={generateCode}
              variant="hero"
              size="lg"
              className="w-full"
            >
              Generate Secret Code
            </Button>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-card to-muted border-border">
            <h2 className="text-2xl font-bold mb-4">Join a Room</h2>
            <p className="text-muted-foreground mb-6">
              Enter the secret code shared with you to connect
            </p>
            <div className="space-y-4">
              <Input
                placeholder="Enter secret code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && joinRoom()}
                className="text-center text-lg font-mono uppercase bg-background border-border"
              />
              <Button 
                onClick={joinRoom}
                variant="hero"
                size="lg"
                className="w-full"
              >
                Join Chat Room
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
