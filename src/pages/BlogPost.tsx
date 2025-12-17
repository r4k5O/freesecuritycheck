import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { ArrowLeft, Calendar, Clock, Users, AlertTriangle, Shield, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface BlogPostData {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  created_at: string;
  read_time: string | null;
  exposed_data: string[];
  recommendations: string[];
  sources: string[];
  breaches: {
    name: string;
    domain: string;
    breach_date: string;
    affected_count: string | null;
    severity: string;
  } | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('blog_posts')
          .select(`
            slug,
            title,
            excerpt,
            content,
            created_at,
            read_time,
            exposed_data,
            recommendations,
            sources,
            breaches (
              name,
              domain,
              breach_date,
              affected_count,
              severity
            )
          `)
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Post not found');
          } else {
            throw fetchError;
          }
        } else {
          setPost(data as unknown as BlogPostData);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="py-16">
          <div className="container mx-auto px-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist.
            </p>
            <Link 
              to="/blog"
              className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Parse markdown content
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let inList = false;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-2 mb-4 text-muted-foreground">
            {listItems.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
            {trimmed.replace('## ', '')}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-xl font-bold mt-6 mb-3">
            {trimmed.replace('### ', '')}
          </h3>
        );
      } else if (trimmed.match(/^[\d]+\.\s/) || trimmed.startsWith('- ')) {
        inList = true;
        listItems.push(trimmed.replace(/^[\d]+\.\s/, '').replace(/^-\s/, ''));
      } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        flushList();
        elements.push(
          <p key={index} className="font-bold mb-2">
            {trimmed.replace(/\*\*/g, '')}
          </p>
        );
      } else if (trimmed) {
        flushList();
        elements.push(
          <p key={index} className="text-muted-foreground mb-4">
            {trimmed}
          </p>
        );
      } else if (inList) {
        flushList();
      }
    });

    flushList();
    return elements;
  };

  return (
    <Layout>
      <article className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link 
              to="/blog"
              className="inline-flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            <header className="mb-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {post.breaches && (
                  <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold uppercase border-2 border-foreground">
                    {post.breaches.name}
                  </span>
                )}
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {post.read_time || '5 min read'}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-6">{post.title}</h1>

              {post.breaches && (
                <div className="p-4 border-2 border-destructive bg-destructive/5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4" />
                        <span className="font-bold">{post.breaches.affected_count || 'Unknown'} users affected</span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Breach Date: {new Date(post.breaches.breach_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {post.exposed_data?.map((data) => (
                          <Badge 
                            key={data}
                            variant="secondary"
                            className="border-2 border-foreground"
                          >
                            {data}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </header>

            <div className="prose prose-lg max-w-none mb-10">
              {renderContent(post.content)}
            </div>

            {post.recommendations && post.recommendations.length > 0 && (
              <div className="p-6 border-2 border-foreground bg-secondary mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">Recommendations</h3>
                </div>
                <ul className="space-y-2">
                  {post.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary font-bold">{index + 1}.</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {post.sources && post.sources.length > 0 && (
              <div className="border-t-2 border-foreground pt-6">
                <h3 className="font-bold mb-3">Sources</h3>
                <ul className="space-y-2">
                  {post.sources.map((source, index) => (
                    <li key={index}>
                      <a 
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline break-all"
                      >
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        {source}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default BlogPost;
