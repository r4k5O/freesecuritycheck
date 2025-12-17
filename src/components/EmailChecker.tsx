import { useState } from "react";
import { Search, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BreachResult } from "@/components/BreachResult";
import { useToast } from "@/hooks/use-toast";

export interface Breach {
  id: string;
  name: string;
  domain: string;
  breachDate: string;
  exposedData: string[];
  description: string;
  blogSlug?: string;
}

// Mock data for demonstration
const mockBreaches: Breach[] = [
  {
    id: "1",
    name: "LinkedIn",
    domain: "linkedin.com",
    breachDate: "2021-06-22",
    exposedData: ["Email addresses", "Phone numbers", "Names", "Job titles"],
    description: "In June 2021, data from 700 million LinkedIn users was posted for sale.",
    blogSlug: "linkedin-2021-breach"
  },
  {
    id: "2",
    name: "Adobe",
    domain: "adobe.com",
    breachDate: "2013-10-04",
    exposedData: ["Email addresses", "Password hints", "Usernames"],
    description: "In October 2013, Adobe suffered a breach affecting 153 million accounts.",
    blogSlug: "adobe-2013-breach"
  },
  {
    id: "3",
    name: "Dropbox",
    domain: "dropbox.com",
    breachDate: "2012-07-01",
    exposedData: ["Email addresses", "Hashed passwords"],
    description: "In 2012, Dropbox suffered a data breach exposing 68 million accounts.",
    blogSlug: "dropbox-2012-breach"
  }
];

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

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demo: randomly show breaches or clean result
    const hasBreaches = email.toLowerCase().includes("test") || Math.random() > 0.5;
    setBreaches(hasBreaches ? mockBreaches : []);
    setIsLoading(false);

    if (hasBreaches) {
      toast({
        title: "Breaches Found",
        description: `Your email was found in ${mockBreaches.length} data breaches.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Good News!",
        description: "Your email was not found in any known breaches.",
      });
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
