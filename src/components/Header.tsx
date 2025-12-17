import { Link } from "react-router-dom";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b-2 border-foreground bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary border-2 border-foreground shadow-xs group-hover:shadow-sm transition-all">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">BREACHGUARD</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="font-medium hover:text-primary transition-colors uppercase text-sm tracking-wide"
            >
              Check Email
            </Link>
            <Link 
              to="/blog" 
              className="font-medium hover:text-primary transition-colors uppercase text-sm tracking-wide"
            >
              Breach Blog
            </Link>
            <Link 
              to="/subscribe" 
              className="font-medium hover:text-primary transition-colors uppercase text-sm tracking-wide"
            >
              Get Alerts
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden border-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t-2 border-foreground flex flex-col gap-4">
            <Link 
              to="/" 
              className="font-medium hover:text-primary transition-colors uppercase text-sm tracking-wide"
              onClick={() => setIsMenuOpen(false)}
            >
              Check Email
            </Link>
            <Link 
              to="/blog" 
              className="font-medium hover:text-primary transition-colors uppercase text-sm tracking-wide"
              onClick={() => setIsMenuOpen(false)}
            >
              Breach Blog
            </Link>
            <Link 
              to="/subscribe" 
              className="font-medium hover:text-primary transition-colors uppercase text-sm tracking-wide"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Alerts
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};
