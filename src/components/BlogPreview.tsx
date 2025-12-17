import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  breachName: string;
  affectedUsers: string;
}

export const BlogPreview = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            slug,
            title,
            excerpt,
            created_at,
            read_time,
            breaches (
              name,
              affected_count
            )
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;

        const formattedPosts: BlogPost[] = (data || []).map((post: any) => ({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          date: post.created_at,
          readTime: post.read_time || '5 min read',
          breachName: post.breaches?.name || 'Unknown',
          affectedUsers: post.breaches?.affected_count || 'Unknown'
        }));

        setPosts(formattedPosts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        // Fallback to showing breach data if no blog posts exist
        const { data: breaches } = await supabase
          .from('breaches')
          .select('*')
          .order('breach_date', { ascending: false })
          .limit(3);

        if (breaches) {
          setPosts(breaches.map(b => ({
            slug: `${b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${b.breach_date?.split('-')[0]}`,
            title: `${b.name} Data Breach: ${b.affected_count || 'Millions of'} Users Affected`,
            excerpt: b.description || `Analysis of the ${b.name} data breach.`,
            date: b.created_at,
            readTime: '5 min read',
            breachName: b.name,
            affectedUsers: b.affected_count || 'Unknown'
          })));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-secondary border-y-2 border-foreground">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-muted border-2 border-foreground"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

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
          {posts.map((post) => (
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
