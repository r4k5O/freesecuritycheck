import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  breachName: string;
  affectedUsers: string;
}

const featuredPosts: BlogPost[] = [
  {
    slug: "linkedin-2021-breach",
    title: "LinkedIn Data Breach: 700 Million Users Exposed",
    excerpt: "In June 2021, data scraped from LinkedIn was posted for sale, exposing personal information of 700 million users including emails, phone numbers, and professional details.",
    date: "2024-01-15",
    readTime: "5 min read",
    breachName: "LinkedIn",
    affectedUsers: "700M"
  },
  {
    slug: "adobe-2013-breach",
    title: "Adobe Breach Analysis: Lessons from 153 Million Accounts",
    excerpt: "The 2013 Adobe breach remains one of the largest in history. Learn how weak encryption practices led to massive exposure and what we can learn from it.",
    date: "2024-01-10",
    readTime: "7 min read",
    breachName: "Adobe",
    affectedUsers: "153M"
  },
  {
    slug: "dropbox-2012-breach",
    title: "Dropbox 2012: How a Reused Password Led to 68 Million Leaked Accounts",
    excerpt: "An employee's reused password gave attackers access to user credentials. This breach highlights the critical importance of unique passwords.",
    date: "2024-01-05",
    readTime: "4 min read",
    breachName: "Dropbox",
    affectedUsers: "68M"
  }
];

export const BlogPreview = () => {
  return (
    <section className="py-16 bg-secondary border-y-2 border-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">Breach Reports</h2>
            <p className="text-muted-foreground mt-2">AI-generated analysis of major data breaches</p>
          </div>
          <Link 
            to="/blog"
            className="hidden md:inline-flex items-center gap-2 font-medium text-primary hover:underline group"
          >
            View All
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.map((post) => (
            <article 
              key={post.slug}
              className="border-2 border-foreground bg-card shadow-sm hover:shadow-md transition-all group"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold uppercase border-2 border-foreground">
                    {post.breachName}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {post.affectedUsers} affected
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  <Link to={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link 
            to="/blog"
            className="inline-flex items-center gap-2 font-medium text-primary hover:underline group"
          >
            View All Posts
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
