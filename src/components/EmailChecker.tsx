import { useState } from "react";
import { Search, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BreachResult } from "@/components/BreachResult";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Breach {
  id: string;
  name: string;
  domain: string;
  breachDate: string;
  exposedData: string[];
  description: string;
  affectedCount?: string;
  severity?: string;
  blogSlug?: string | null;
}

export const EmailChecker = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [breaches, setBreaches] = useState<Breach[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleCheck = async (e: React.FormEvent) => {
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
    setHasSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke('check-email', {
        body: { email }
      });

      if (error) throw error;

      if (data.success) {
        setBreaches(data.breaches || []);
        
        if (data.breaches && data.breaches.length > 0) {
          toast({
            title: "Breaches Found",
            description: `Your email was found in ${data.breaches.length} data ${data.breaches.length === 1 ? 'breach' : 'breaches'}.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Good News!",
            description: "Your email was not found in any known breaches.",
          });
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error checking email:', error);
      toast({
        title: "Error",
        description: "Failed to check email. Please try again.",
        variant: "destructive",
      });
      setBreaches([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-primary text-primary-foreground border-2 border-foreground shadow-xs mb-6">
              <span className="text-sm font-bold uppercase tracking-wider">Free Security Check</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Has Your Email Been
              <span className="block text-primary">Compromised?</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Check if your email address has been exposed in a data breach. We scan billions of records to keep you safe.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleCheck} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 text-lg border-2 border-foreground shadow-sm focus:shadow-md transition-all"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-14 px-8 text-lg font-bold uppercase tracking-wide border-2 border-foreground shadow-sm hover:shadow-md transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Now"
                )}
              </Button>
            </div>
          </form>

          {/* Results */}
          {hasSearched && !isLoading && breaches !== null && (
            <div className="space-y-6">
              {breaches.length > 0 ? (
                <>
                  <div className="p-4 bg-destructive/10 border-2 border-destructive flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-destructive">
                        Oh no — pwned in {breaches.length} data {breaches.length === 1 ? 'breach' : 'breaches'}!
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your email was found in the following breaches. Change your passwords immediately.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {breaches.map((breach) => (
                      <BreachResult key={breach.id} breach={breach} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-6 bg-accent/20 border-2 border-accent flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-accent-foreground">
                      Good news — no breaches found!
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your email wasn't found in any known data breaches. Stay safe by using unique passwords.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
