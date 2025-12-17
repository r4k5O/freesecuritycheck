import { Calendar, Globe, Database, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { Breach } from "./EmailChecker";

interface BreachResultProps {
  breach: Breach;
}

export const BreachResult = ({ breach }: BreachResultProps) => {
  return (
    <div className="border-2 border-foreground bg-card shadow-sm hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold">{breach.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Globe className="h-4 w-4" />
              <span>{breach.domain}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(breach.breachDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        <p className="text-muted-foreground mb-4">{breach.description}</p>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium">Exposed Data:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {breach.exposedData.map((data) => (
              <Badge 
                key={data} 
                variant="secondary"
                className="border-2 border-foreground font-medium"
              >
                {data}
              </Badge>
            ))}
          </div>
        </div>

        {breach.blogSlug && (
          <Link 
            to={`/blog/${breach.blogSlug}`}
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline group"
          >
            Read full breach report
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
};
