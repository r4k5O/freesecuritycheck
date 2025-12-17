import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ArrowLeft, Calendar, Clock, Users, AlertTriangle, Shield, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BlogPostData {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  breachName: string;
  affectedUsers: string;
  breachDate: string;
  exposedData: string[];
  content: string;
  recommendations: string[];
  sources: string[];
}

const blogPosts: Record<string, BlogPostData> = {
  "linkedin-2021-breach": {
    slug: "linkedin-2021-breach",
    title: "LinkedIn Data Breach: 700 Million Users Exposed",
    date: "2024-01-15",
    readTime: "5 min read",
    breachName: "LinkedIn",
    affectedUsers: "700 Million",
    breachDate: "June 2021",
    exposedData: ["Email addresses", "Phone numbers", "Full names", "Physical addresses", "Geolocation data", "Professional details", "Gender"],
    content: `
## What Happened

In June 2021, a hacker known as "TomLiner" posted data from 700 million LinkedIn users for sale on a dark web forum. This represented approximately 92% of LinkedIn's total user base at the time.

The data was obtained through a technique called "scraping" – using automated tools to harvest publicly available information from the platform. While LinkedIn initially stated that this wasn't technically a "breach" since it only involved public data, the aggregation of this information poses significant privacy and security risks.

## The Attack Vector

The attacker exploited LinkedIn's API to collect data that users had made publicly visible on their profiles. By automating millions of requests, they were able to compile a comprehensive database of user information.

This incident highlights a crucial security consideration: even "public" data, when aggregated at scale, can be weaponized for various malicious purposes.

## Impact Assessment

The exposed data enables several attack vectors:

1. **Targeted Phishing**: With detailed professional information, attackers can craft highly convincing spear-phishing emails
2. **Social Engineering**: Knowledge of job titles and company relationships makes impersonation attacks more effective
3. **Identity Theft**: Combined with other breached data, this information could be used to steal identities
4. **Credential Stuffing**: Email addresses can be used to attempt account access using leaked passwords from other breaches
    `,
    recommendations: [
      "Review your LinkedIn privacy settings and limit visible information",
      "Enable two-factor authentication on your LinkedIn account",
      "Be cautious of unsolicited connection requests",
      "Watch for targeted phishing attempts using your professional details",
      "Use unique passwords for all your accounts"
    ],
    sources: [
      "https://www.linkedin.com/pulse/update-report-scraped-data-linkedin",
      "https://www.bleepingcomputer.com/news/security/hackers-sell-700-million-linkedin-records/"
    ]
  },
  "adobe-2013-breach": {
    slug: "adobe-2013-breach",
    title: "Adobe Breach Analysis: Lessons from 153 Million Accounts",
    date: "2024-01-10",
    readTime: "7 min read",
    breachName: "Adobe",
    affectedUsers: "153 Million",
    breachDate: "October 2013",
    exposedData: ["Email addresses", "Encrypted passwords", "Password hints", "Usernames", "Customer IDs"],
    content: `
## What Happened

In October 2013, Adobe Systems disclosed a massive security breach that initially affected 2.9 million accounts but eventually grew to 153 million – one of the largest data breaches in history.

Attackers gained access to Adobe's servers and exfiltrated user credentials, as well as portions of the source code for several Adobe products including ColdFusion and Adobe Acrobat.

## The Critical Encryption Failure

What made this breach particularly devastating was Adobe's use of 3DES encryption in ECB (Electronic Codebook) mode for passwords. This method has a critical flaw: identical passwords produce identical ciphertext.

This meant that security researchers could identify the most common passwords simply by counting identical encrypted values. Combined with password hints stored in plaintext, many passwords were trivially cracked.

## Analysis of Password Patterns

The breach revealed alarming patterns in user password behavior:

| Rank | Password | Occurrences |
|------|----------|-------------|
| 1 | 123456 | 1,911,938 |
| 2 | 123456789 | 446,162 |
| 3 | password | 345,834 |
| 4 | adobe123 | 211,659 |
| 5 | 12345678 | 201,580 |

These findings underscore the ongoing challenge of password security education.
    `,
    recommendations: [
      "Never reuse passwords across multiple services",
      "Use a password manager to generate and store complex passwords",
      "Enable two-factor authentication wherever available",
      "Avoid password hints or use deliberately misleading ones",
      "Monitor your accounts for suspicious activity"
    ],
    sources: [
      "https://blog.adobe.com/en/publish/2013/10/03/important-customer-security-announcement",
      "https://nakedsecurity.sophos.com/2013/11/04/anatomy-of-a-password-disaster-adobes-giant-sized-cryptographic-blunder/"
    ]
  },
  "dropbox-2012-breach": {
    slug: "dropbox-2012-breach",
    title: "Dropbox 2012: How a Reused Password Led to 68 Million Leaked Accounts",
    date: "2024-01-05",
    readTime: "4 min read",
    breachName: "Dropbox",
    affectedUsers: "68 Million",
    breachDate: "July 2012",
    exposedData: ["Email addresses", "Hashed passwords (SHA-1 and bcrypt)"],
    content: `
## What Happened

In 2012, Dropbox suffered a data breach that wasn't fully understood until the data surfaced in 2016. The breach exposed approximately 68 million user accounts, including email addresses and hashed passwords.

The breach originated from a Dropbox employee who had reused a password that was exposed in the LinkedIn 2012 breach. Attackers used this credential to access internal systems.

## The Chain of Events

1. LinkedIn was breached in 2012, exposing employee passwords
2. A Dropbox employee used the same password for both services
3. Attackers used the LinkedIn password to access Dropbox corporate systems
4. User credentials were exfiltrated from Dropbox's database

This incident is a textbook example of why password reuse is dangerous, even for technical professionals.

## Silver Lining: Proper Password Hashing

Unlike the Adobe breach, Dropbox had implemented proper password hashing. About half of the passwords were protected with SHA-1 (with salt), while newer accounts used bcrypt – a much more secure algorithm.

This meant that while the data was stolen, cracking the passwords was significantly more difficult than in other breaches.
    `,
    recommendations: [
      "Never reuse passwords, especially for work accounts",
      "Use a password manager for all accounts",
      "Enable two-factor authentication on Dropbox",
      "Regularly review connected apps and sessions",
      "Consider using a hardware security key for critical accounts"
    ],
    sources: [
      "https://blog.dropbox.com/topics/company/resetting-passwords-for-dropbox-users",
      "https://www.vice.com/en/article/nz74qb/hackers-stole-over-60-million-dropbox-accounts"
    ]
  }
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogPosts[slug] : null;

  if (!post) {
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
                <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold uppercase border-2 border-foreground">
                  {post.breachName}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-6">{post.title}</h1>

              <div className="p-4 border-2 border-destructive bg-destructive/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4" />
                      <span className="font-bold">{post.affectedUsers} users affected</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Breach Date: {post.breachDate}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.exposedData.map((data) => (
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
            </header>

            <div className="prose prose-lg max-w-none mb-10">
              {post.content.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('## ')) {
                  return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
                }
                if (paragraph.startsWith('| ')) {
                  return null; // Skip table rows for now
                }
                if (paragraph.trim() === '') return null;
                if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ') || paragraph.startsWith('4. ')) {
                  return <li key={index} className="ml-6 text-muted-foreground">{paragraph.replace(/^\d+\.\s+/, '')}</li>;
                }
                return <p key={index} className="text-muted-foreground mb-4">{paragraph}</p>;
              })}
            </div>

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
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default BlogPost;
