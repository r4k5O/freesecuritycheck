import { useState } from "react";
import { Bell, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export const SubscribeCTA = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsSubscribed(true);
    toast({
      title: "Subscribed!",
      description: "You'll receive alerts when new breaches are found.",
    });
  };

  if (isSubscribed) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent border-2 border-foreground shadow-sm mb-6">
              <CheckCircle className="h-8 w-8 text-accent-foreground" />
            </div>
            <h2 className="text-3xl font-bold mb-4">You're Protected!</h2>
            <p className="text-muted-foreground">
              We'll notify you immediately if your email appears in any new data breaches.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary border-2 border-foreground shadow-sm mb-6">
            <Bell className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Notified of New Breaches
          </h2>
          <p className="text-muted-foreground mb-8">
            Subscribe to receive instant alerts when your email appears in a new data breach.
            Stay one step ahead of hackers.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Input
              type="email"
              placeholder="Your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sm:w-80 h-12 text-base border-2 border-foreground shadow-xs"
            />
            <Button 
              type="submit"
              disabled={isLoading}
              className="h-12 px-6 font-bold uppercase tracking-wide border-2 border-foreground shadow-xs hover:shadow-sm transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};
