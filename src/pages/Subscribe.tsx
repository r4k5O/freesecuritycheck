import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Bell, Shield, Mail, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
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
    
    try {
      const { data, error } = await supabase.functions.invoke('subscribe', {
        body: { email }
      });

      if (error) throw error;

      if (data.success) {
        setIsSubscribed(true);
        toast({
          title: data.alreadySubscribed ? "Already Subscribed!" : "Successfully Subscribed!",
          description: data.alreadySubscribed 
            ? "You're already signed up for breach alerts."
            : "You'll receive alerts when new breaches are found.",
        });
      } else {
        throw new Error(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <Layout>
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-accent border-2 border-foreground shadow-md mb-8">
                <CheckCircle className="h-10 w-10 text-accent-foreground" />
              </div>
              <h1 className="text-4xl font-bold mb-4">You're All Set!</h1>
              <p className="text-lg text-muted-foreground mb-8">
                We'll notify you immediately if your email appears in any new data breaches.
                Stay vigilant and keep your accounts secure.
              </p>
              <div className="p-6 border-2 border-foreground bg-card">
                <h3 className="font-bold mb-4">What happens next?</h3>
                <ul className="text-left space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    We continuously monitor breach databases
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    When your email is found, we alert you instantly
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    You receive actionable steps to secure your accounts
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary border-2 border-foreground shadow-md mb-8">
                <Bell className="h-10 w-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Stay Protected
              </h1>
              <p className="text-lg text-muted-foreground">
                Get instant notifications when your email appears in a new data breach.
                Be the first to know and take action.
              </p>
            </div>

            <div className="border-2 border-foreground bg-card p-8 shadow-md mb-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block font-bold mb-2">
                    Your Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 text-lg border-2 border-foreground"
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-bold uppercase tracking-wide border-2 border-foreground shadow-sm hover:shadow-md transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    "Enable Breach Alerts"
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  We respect your privacy. Unsubscribe anytime with one click.
                </p>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-2 border-foreground p-6 bg-card">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary border-2 border-foreground mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-bold mb-2">Proactive Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Know about breaches before they become news headlines.
                </p>
              </div>

              <div className="border-2 border-foreground p-6 bg-card">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary border-2 border-foreground mb-4">
                  <Bell className="h-6 w-6" />
                </div>
                <h3 className="font-bold mb-2">Instant Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Receive notifications within minutes of new breach discoveries.
                </p>
              </div>

              <div className="border-2 border-foreground p-6 bg-card">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary border-2 border-foreground mb-4">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="font-bold mb-2">Actionable Steps</h3>
                <p className="text-sm text-muted-foreground">
                  Get clear guidance on how to secure your compromised accounts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Subscribe;
