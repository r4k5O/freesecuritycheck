import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Calendar, Clock, Users, ArrowRight } from "lucide-react";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  breachName: string;
  affectedUsers: string;
  severity: "critical" | "high" | "medium";
}

const allPosts: BlogPost[] = [
  {
    slug: "linkedin-2021-breach",
    title: "LinkedIn Data Breach: 700 Million Users Exposed",
    excerpt: "In June 2021, data scraped from LinkedIn was posted for sale, exposing personal information of 700 million users including emails, phone numbers, and professional details.",
    date: "2024-01-15",
    readTime: "5 min read",
    breachName: "LinkedIn",
    affectedUsers: "700M",
    severity: "critical"
  },
  {
    slug: "adobe-2013-breach",
    title: "Adobe Breach Analysis: Lessons from 153 Million Accounts",
    excerpt: "The 2013 Adobe breach remains one of the largest in history. Learn how weak encryption practices led to massive exposure and what we can learn from it.",
    date: "2024-01-10",
    readTime: "7 min read",
    breachName: "Adobe",
    affectedUsers: "153M",
    severity: "critical"
  },
  {
    slug: "dropbox-2012-breach",
    title: "Dropbox 2012: How a Reused Password Led to 68 Million Leaked Accounts",
    excerpt: "An employee's reused password gave attackers access to user credentials. This breach highlights the critical importance of unique passwords.",
    date: "2024-01-05",
    readTime: "4 min read",
    breachName: "Dropbox",
    affectedUsers: "68M",
    severity: "high"
  },
  {
    slug: "yahoo-2014-breach",
    title: "Yahoo's Massive 2014 Breach: 500 Million Accounts Compromised",
    excerpt: "State-sponsored hackers breached Yahoo, stealing names, email addresses, and security questions. The breach wasn't disclosed until 2016.",
    date: "2024-01-02",
    readTime: "6 min read",
    breachName: "Yahoo",
    affectedUsers: "500M",
    severity: "critical"
  },
  {
    slug: "myspace-2016-breach",
    title: "MySpace Data Dump: 360 Million Accounts from 2013",
    excerpt: "Historical MySpace data surfaced in 2016, exposing usernames, email addresses, and weakly hashed passwords from the social network's peak years.",
    date: "2023-12-28",
    readTime: "5 min read",
    breachName: "MySpace",
    affectedUsers: "360M",
    severity: "high"
  },
  {
    slug: "twitter-2023-breach",
    title: "Twitter Email Leak: 200 Million Users' Emails Exposed",
    excerpt: "An API vulnerability led to a massive leak of Twitter user emails, enabling targeted phishing attacks and account takeovers.",
    date: "2023-12-20",
    readTime: "4 min read",
    breachName: "Twitter",
    affectedUsers: "200M",
    severity: "high"
  }
];

const severityColors = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-primary text-primary-foreground",
  medium: "bg-accent text-accent-foreground"
};

const Blog = () => {
  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Breach Reports</h1>
              <p className="text-lg text-muted-foreground">
                AI-generated analysis of major data breaches. Stay informed about security incidents
                affecting millions of users worldwide.
              </p>
            </div>

            <div className="space-y-6">
              {allPosts.map((post) => (
                <article 
                  key={post.slug}
                  className="border-2 border-foreground bg-card shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className={`px-3 py-1 text-xs font-bold uppercase border-2 border-foreground ${severityColors[post.severity]}`}>
                        {post.severity}
                      </span>
                      <span className="px-3 py-1 bg-secondary text-xs font-bold uppercase border-2 border-foreground">
                        {post.breachName}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {post.affectedUsers} affected
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                      <Link to={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-muted-foreground mb-4">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(post.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.readTime}
                        </span>
                      </div>

                      <Link 
                        to={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 font-medium text-primary hover:underline group/link"
                      >
                        Read More
                        <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
