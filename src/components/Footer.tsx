import { Shield, Github, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t-2 border-foreground bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary border-2 border-foreground">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">BREACHGUARD</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Protecting your digital identity by monitoring data breaches worldwide.
            </p>
          </div>

          <div>
            <h3 className="font-bold uppercase text-sm tracking-wide mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Check Your Email
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Breach Blog
                </Link>
              </li>
              <li>
                <Link to="/subscribe" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Email Alerts
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold uppercase text-sm tracking-wide mb-4">Stay Safe</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get notified about new breaches affecting your accounts.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="p-2 border-2 border-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-2xs hover:shadow-xs"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="p-2 border-2 border-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-2xs hover:shadow-xs"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t-2 border-foreground">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} BreachGuard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
