import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Copy, ExternalLink, Trash2 } from 'lucide-react';

type ShortenedURL = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
};

const mockUrls: ShortenedURL[] = [
  {
    id: '1',
    originalUrl: 'https://example.com/very/long/url/that/needs/shortening',
    shortUrl: 'cu.rl/abc123',
    clicks: 145,
    createdAt: '2024-03-20',
  },
  {
    id: '2',
    originalUrl: 'https://another-example.com/path/to/resource',
    shortUrl: 'cu.rl/xyz789',
    clicks: 89,
    createdAt: '2024-03-19',
  },
];

export function Dashboard() {
  const [url, setUrl] = useState('');
  const [urls, setUrls] = useState<ShortenedURL[]>(mockUrls);

  const handleShorten = async () => {
    // TODO: Implement URL shortening
    toast.success('URL shortened successfully!');
  };

  const handleCopy = (shortUrl: string) => {
    navigator.clipboard.writeText(`https://${shortUrl}`);
    toast.success('Copied to clipboard!');
  };

  const handleDelete = (id: string) => {
    setUrls(urls.filter((url) => url.id !== id));
    toast.success('URL deleted successfully!');
  };

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
                  {urls.reduce((acc, url) => acc + url.clicks, 0)}
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
            <div className="flex space-x-2">
              <Input
                placeholder="Enter your long URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
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

        <Card>
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
                  <TableHead>Clicks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {urls.map((url) => (
                  <TableRow key={url.id}>
                    <TableCell className="max-w-[300px] truncate">
                      {url.originalUrl}
                    </TableCell>
                    <TableCell>{url.shortUrl}</TableCell>
                    <TableCell>{url.clicks}</TableCell>
                    <TableCell>{url.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(url.shortUrl)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`https://${url.shortUrl}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(url.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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