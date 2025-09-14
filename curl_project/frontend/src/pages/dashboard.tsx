import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, ExternalLink, Trash2, BarChart2, CheckIcon } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ShortenedURL = {
  uuid: string;
  original_url: string;
  shortened_slug: string;
  creation_date: string;
};

export function Dashboard() {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [urls, setUrls] = useState<ShortenedURL[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth("/urls/");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ShortenedURL[] = await response.json();
      setUrls(data);
    } catch (err) {
      console.error("Failed to fetch URLs:", err);
      setError("Failed to load URLs. Please try again.");
      toast.error("Failed to load URLs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleShorten = async () => {
    try {
      const body: { original_url: string; shortened_slug?: string } = {
        original_url: url,
      };
      if (customSlug) {
        body.shortened_slug = customSlug;
      }
      const response = await fetchWithAuth("/urls/shorten/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to shorten URL");
      }

      const newUrl: ShortenedURL = await response.json();
      setUrls((prevUrls) => [...prevUrls, newUrl]);
      setUrl("");
      setCustomSlug("");
      toast.success("URL shortened successfully!");
    } catch (err) {
      console.error("Failed to shorten URL:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to shorten URL."
      );
    }
  };

  const handleCopy = (shortened_slug: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/${shortened_slug}`
    );
    setCopiedUrl(shortened_slug);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDelete = async (uuid: string) => {
    try {
      const response = await fetchWithAuth(`/urls/${uuid}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setUrls((prevUrls) => prevUrls.filter((url) => url.uuid !== uuid));
      toast.success("URL deleted successfully!");
    } catch (err) {
      console.error("Failed to delete URL:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete URL.");
    }
  };

  const handleViewAnalytics = (uuid: string) => {
    navigate(`/analytics/${uuid}`);
  };

  if (loading) {
    return <div className="container py-8">Loading URLs...</div>;
  }

  if (error) {
    return <div className="container py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container py-8">
      <div className="grid gap-8">
        <div className="grid gap-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Links</CardTitle>
                <CardDescription>All time shortened URLs</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{urls.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Clicks</CardTitle>
                <CardDescription>All time link clicks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {/* Clicks data will be fetched from analytics page */}0
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Active Links</CardTitle>
                <CardDescription>Currently active URLs</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{urls.length}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shorten URL</CardTitle>
            <CardDescription>Create a new shortened URL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
              <Input
                placeholder="Enter your long URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Custom slug (optional)"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                className="flex-1"
              />
                    <Button
                      onClick={handleShorten}
                      className="bg-violet-500 hover:bg-violet-600"
                    >
                      Shorten
                    </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Your URLs</CardTitle>
            <CardDescription>Manage your shortened URLs</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Original URL</TableHead>
                  <TableHead>Short URL</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {urls.map((url) => (
                  <TableRow key={url.uuid}>
                    <TableCell className="max-w-xs truncate">
                      {url.original_url}
                    </TableCell>
                    <TableCell>{`${window.location.origin}/${url.shortened_slug}`}</TableCell>
                    <TableCell>
                      {new Date(url.creation_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex flex-col sm:flex-row sm:space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopy(url.shortened_slug)}
                              >
                                {copiedUrl === url.shortened_slug ? (
                                  <CheckIcon className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy link</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  window.open(
                                    `${window.location.origin}/${url.shortened_slug}`,
                                    "_blank"
                                  )
                                }
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Open link</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewAnalytics(url.uuid)}
                              >
                                <BarChart2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View analytics</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(url.uuid)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete URL</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}