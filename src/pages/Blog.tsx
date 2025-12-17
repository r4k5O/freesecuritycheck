import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Calendar, Clock, Users, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  breachName: string;
  affectedUsers: string;
  severity: "critical" | "high" | "medium" | "low";
}

interface BreachData {
  id: string;
  name: string;
  affected_count: string | null;
  severity: string;
  description: string | null;
  breach_date: string;
  created_at: string;
}

const severityColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-primary text-primary-foreground",
  medium: "bg-accent text-accent-foreground",
  low: "bg-secondary text-secondary-foreground"
};

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      // First try to get blog posts
      const { data: blogPosts, error: blogError } = await supabase
        .from('blog_posts')
        .select(`
          slug,
          title,
          excerpt,
          created_at,
          read_time,
          breach_id,
          breaches (
            name,
            affected_count,
            severity
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (blogError) throw blogError;

      // Get all breaches to show ones without blog posts too
      const { data: breaches, error: breachError } = await supabase
        .from('breaches')
        .select('*')
        .order('breach_date', { ascending: false });

      if (breachError) throw breachError;

      // Create a map of breach IDs with blog posts
      const breachesWithPosts = new Set((blogPosts || []).map((p: any) => p.breach_id));

      // Format blog posts
      const formattedPosts: BlogPost[] = (blogPosts || []).map((post: any) => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        date: post.created_at,
        readTime: post.read_time || '5 min read',
        breachName: post.breaches?.name || 'Unknown',
        affectedUsers: post.breaches?.affected_count || 'Unknown',
        severity: (post.breaches?.severity || 'medium') as BlogPost['severity']
      }));

      // Add breaches without blog posts
      const breachesWithoutPosts = (breaches || [])
        .filter((b: BreachData) => !breachesWithPosts.has(b.id))
        .map((b: BreachData) => ({
          slug: `breach-${b.id}`,
          title: `${b.name} Data Breach: ${b.affected_count || 'Users'} Affected`,
          excerpt: b.description || `Analysis of the ${b.name} data breach is being generated...`,
          date: b.created_at,
          readTime: '5 min read',
          breachName: b.name,
          affectedUsers: b.affected_count || 'Unknown',
          severity: (b.severity || 'medium') as BlogPost['severity'],
          breachId: b.id,
          needsGeneration: true
        }));

      setPosts([...formattedPosts, ...breachesWithoutPosts]);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const generateBlogPost = async (breachId: string, breachName: string) => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog', {
        body: { breachId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Blog Post Generated!",
          description: `Article about ${breachName} is now available.`,
        });
        fetchPosts();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error generating blog post:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Breach Reports</h1>
              <p className="text-lg text-muted-foreground">
                AI-generated analysis of major data breaches. Stay informed about security incidents
                affecting millions of users worldwide.
              </p>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-muted">
                <p className="text-muted-foreground mb-4">No blog posts yet.</p>
                <p className="text-sm text-muted-foreground">Blog posts are generated automatically for discovered breaches.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post: any) => (
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
                        {post.needsGeneration ? (
                          post.title
                        ) : (
                          <Link to={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        )}
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

                        {post.needsGeneration ? (
                          <Button
                            onClick={() => generateBlogPost(post.breachId, post.breachName)}
                            disabled={generating}
                            variant="outline"
                            className="border-2"
                          >
                            {generating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Generate Report
                              </>
                            )}
                          </Button>
                        ) : (
                          <Link 
                            to={`/blog/${post.slug}`}
                            className="inline-flex items-center gap-2 font-medium text-primary hover:underline group/link"
                          >
                            Read More
                            <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
