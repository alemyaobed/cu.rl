import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Link2Icon,
  BarChart3Icon,
  ShieldIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "@/lib/api";
import { URLTable, URLTableHandle } from "@/components/url-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      console.error(error);
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
      <section className="container flex-1 py-12 md:py-24 lg:py-32">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Shorten your links with style
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
              Create short, memorable links in seconds. Track clicks and analyze
              your audience.
            </p>
          </div>
          <div className="w-full max-w-2xl space-y-2">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter your long URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleShorten}
                disabled={isLoading}
                className="bg-violet-500 hover:bg-violet-600"
              >
                {isLoading ? "Shortening..." : "Shorten"}
              </Button>
            </div>
            {shortenedUrl && (
              <div className="flex items-center space-x-2 pt-4">
                <Input value={shortenedUrl} readOnly className="flex-1" />
                <Button
                  variant="outline"
                  onClick={handleCopyToClipboard}
                  className="flex items-center space-x-2 px-3"
                >
                  {isCopied ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300 transition-opacity duration-200">
                    {isCopied ? "Copied!" : "Copy"}
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container py-12">
        <URLTable ref={urlTableRef} />
      </section>

      <section className="container py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
              <CardDescription>
                Get started with CU.RL in a few simple steps.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-left space-y-4">
              <p>
                1. <strong>Enter your long URL:</strong> Paste the URL you want
                to shorten into the input field above.
              </p>
              <p>
                2. <strong>Click 'Shorten':</strong> Our service will generate a
                unique, short URL for you.
              </p>
              <p>
                3. <strong>Copy and Share:</strong> Copy your new short URL and
                share it anywhere you like!
              </p>
              <p>
                4. <strong>Track Clicks:</strong> If you're signed in, you can
                track the performance of your links, including click counts and
                more.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Unlock More Insights</CardTitle>
              <CardDescription>
                Sign in to gain full control over your links.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-left space-y-4">
              <p>
                As a guest, your shortened URLs are temporary. To ensure your
                links and their analytics are permanently saved, please sign in
                or register for a free account.
              </p>
              <p>Signing in allows you to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Access detailed analytics for all your links.</li>
                <li>Manage and edit your shortened URLs at any time.</li>
                <li>Create custom, branded links.</li>
                <li>
                  Keep your links forever, preventing them from being lost.
                </li>
              </ul>
              <p>
                Don't lose your valuable links!{" "}
                <Link to="/login" className="text-violet-500 hover:underline">
                  Sign in
                </Link>{" "}
                or{" "}
                <Link
                  to="/register"
                  className="text-violet-500 hover:underline"
                >
                  Register
                </Link>{" "}
                now.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t bg-muted/40">
        <div className="container py-12 md:py-24 lg:py-32">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 text-center">
              <Link2Icon className="h-12 w-12 text-violet-500" />
              <h3 className="text-xl font-bold">Quick & Easy</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Shorten URLs instantly with our simple interface
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <BarChart3Icon className="h-12 w-12 text-violet-500" />
              <h3 className="text-xl font-bold">Detailed Analytics</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Track clicks, locations, and devices in real-time
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <ShieldIcon className="h-12 w-12 text-violet-500" />
              <h3 className="text-xl font-bold">Secure & Reliable</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Your links are safe and always available
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
