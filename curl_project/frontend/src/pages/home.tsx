import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Link2Icon,
  CopyIcon,
  CheckIcon,
  Zap,
  TrendingUp,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "@/lib/api";
import { URLTable, URLTableHandle } from "@/components/url-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import logger from "@/lib/logger";

export function Home() {
  const [url, setUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const urlTableRef = useRef<URLTableHandle>(null);

  const handleShorten = async () => {
    if (!url) {
      toast.error("Please enter a URL to shorten");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchWithAuth("/urls/shorten/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ original_url: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to shorten URL");
      }

      const data = await response.json();
      setShortenedUrl(`${window.location.origin}/${data.shortened_slug}`);
      toast.success("URL shortened successfully!");
      urlTableRef.current?.fetchUrls();
    } catch (error) {
      logger.error(error);
      toast.error(
        (error instanceof Error && error.message) ||
          "An error occurred while shortening the URL"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shortenedUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 to-background dark:from-violet-950/20 dark:to-background">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="container relative py-16 md:py-24 lg:py-32">
          <div className="flex flex-col items-center space-y-8 text-center">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-background/60 backdrop-blur-sm">
              <Zap className="mr-2 h-4 w-4 text-violet-500" />
              Fast, Simple, and Powerful
            </div>

            {/* Hero Text */}
            <div className="space-y-4 max-w-4xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
                Shorten Links.
                <br />
                Track Performance.
              </h1>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
                Transform long URLs into powerful short links. Monitor clicks, analyze traffic, and grow your audience with actionable insights.
              </p>
            </div>

            {/* URL Shortener Card */}
            <Card className="w-full max-w-3xl shadow-xl border-2">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="Enter your long URL here..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
                      className="flex-1 h-12 text-base"
                    />
                    <Button
                      onClick={handleShorten}
                      disabled={isLoading}
                      size="lg"
                      className="bg-violet-600 hover:bg-violet-700 h-12 px-8 font-semibold"
                    >
                      {isLoading ? (
                        "Shortening..."
                      ) : (
                        <>
                          Shorten URL
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>

                  {shortenedUrl && (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 border animate-in fade-in slide-in-from-top-2 duration-300">
                      <Input
                        value={shortenedUrl}
                        readOnly
                        className="flex-1 bg-background font-mono"
                      />
                      <Button
                        variant="outline"
                        onClick={handleCopyToClipboard}
                        className="flex items-center gap-2 px-4"
                      >
                        {isCopied ? (
                          <>
                            <CheckIcon className="h-4 w-4 text-green-500" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <CopyIcon className="h-4 w-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground text-center">
                    No registration required. Start shortening URLs instantly! 🚀
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" variant="outline" className="font-semibold">
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="font-semibold">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* URL Table Section */}
      <section className="container py-16">
        <URLTable ref={urlTableRef} />
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 border-y">
        <div className="container py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, manage, and track your short links
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center mb-4">
                  <Link2Icon className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                </div>
                <CardTitle>Instant Shortening</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Transform long, unwieldy URLs into clean, memorable short links in seconds. No registration required.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                </div>
                <CardTitle>Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Get detailed insights on clicks, geographic locations, devices, and browsers. Make data-driven decisions.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Your data is protected with enterprise-grade security. All links are monitored and safe from malicious content.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24">
        <Card className="border-2 shadow-xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20">
          <CardContent className="p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to supercharge your links?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of users who trust cu.rl to manage their links. Create your free account today and unlock premium features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700 font-semibold">
                  <Link to="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="font-semibold">
                  <Link to="/login">Sign In to Your Account</Link>
                </Button>
              </div>
              
              <div className="pt-6 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <span>Unlimited links</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
