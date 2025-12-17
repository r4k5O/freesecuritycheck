-- Create table for email subscriptions (breach alerts)
CREATE TABLE public.email_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for known data breaches
CREATE TABLE public.breaches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  breach_date DATE NOT NULL,
  discovered_date DATE,
  exposed_data TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  affected_count TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for blog posts (AI-generated breach reports)
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  breach_id UUID REFERENCES public.breaches(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  exposed_data TEXT[] NOT NULL DEFAULT '{}',
  recommendations TEXT[] NOT NULL DEFAULT '{}',
  sources TEXT[] NOT NULL DEFAULT '{}',
  read_time TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for breach-email associations (which emails are in which breaches)
CREATE TABLE public.email_breach_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_hash TEXT NOT NULL, -- Store hashed email for privacy
  breach_id UUID NOT NULL REFERENCES public.breaches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email_hash, breach_id)
);

-- Enable Row Level Security
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_breach_records ENABLE ROW LEVEL SECURITY;

-- Public read access to breaches (they're public information)
CREATE POLICY "Breaches are publicly readable"
ON public.breaches
FOR SELECT
USING (true);

-- Public read access to published blog posts
CREATE POLICY "Published blog posts are publicly readable"
ON public.blog_posts
FOR SELECT
USING (is_published = true);

-- Email subscriptions can only be managed via edge functions (service role)
CREATE POLICY "Email subscriptions are managed via service role only"
ON public.email_subscriptions
FOR ALL
USING (false);

-- Email breach records are managed via edge functions (service role)
CREATE POLICY "Email breach records are managed via service role only"
ON public.email_breach_records
FOR ALL
USING (false);

-- Create indexes for better query performance
CREATE INDEX idx_breaches_domain ON public.breaches(domain);
CREATE INDEX idx_breaches_breach_date ON public.breaches(breach_date);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_breach_id ON public.blog_posts(breach_id);
CREATE INDEX idx_email_breach_records_email_hash ON public.email_breach_records(email_hash);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_email_subscriptions_updated_at
BEFORE UPDATE ON public.email_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_breaches_updated_at
BEFORE UPDATE ON public.breaches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample breach data
INSERT INTO public.breaches (name, domain, breach_date, exposed_data, description, affected_count, severity, is_verified) VALUES
('LinkedIn', 'linkedin.com', '2021-06-22', ARRAY['Email addresses', 'Phone numbers', 'Full names', 'Job titles', 'Geolocation data'], 'In June 2021, data from 700 million LinkedIn users was posted for sale on a dark web forum. The data was obtained through scraping and API abuse.', '700M', 'critical', true),
('Adobe', 'adobe.com', '2013-10-04', ARRAY['Email addresses', 'Encrypted passwords', 'Password hints', 'Usernames'], 'In October 2013, Adobe suffered a breach affecting 153 million accounts. The passwords were encrypted using 3DES in ECB mode, making them vulnerable.', '153M', 'critical', true),
('Dropbox', 'dropbox.com', '2012-07-01', ARRAY['Email addresses', 'Hashed passwords'], 'In 2012, Dropbox suffered a data breach exposing 68 million accounts due to an employee reusing a password from LinkedIn.', '68M', 'high', true),
('Yahoo', 'yahoo.com', '2014-01-01', ARRAY['Email addresses', 'Names', 'Phone numbers', 'Security questions', 'Hashed passwords'], 'State-sponsored hackers breached Yahoo in 2014, stealing data from 500 million accounts. The breach was not disclosed until 2016.', '500M', 'critical', true),
('Twitter', 'twitter.com', '2023-01-01', ARRAY['Email addresses', 'Usernames', 'Account IDs'], 'An API vulnerability allowed attackers to scrape email addresses associated with Twitter accounts, affecting 200 million users.', '200M', 'high', true),
('MySpace', 'myspace.com', '2013-06-01', ARRAY['Email addresses', 'Usernames', 'Hashed passwords'], 'Historical MySpace data from around 2013 surfaced in 2016, exposing usernames, email addresses, and weakly hashed passwords.', '360M', 'high', true);