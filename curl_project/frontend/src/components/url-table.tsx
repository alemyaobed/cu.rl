import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchWithAuth } from '@/lib/api';
import { z } from 'zod';

const UrlSchema = z.object({
  uuid: z.string(),
  original_url: z.string(),
  shortened_slug: z.string(),
  creation_date: z.string(),
});

const UrlsSchema = z.array(UrlSchema);

export function URLTable() {
  const [urls, setUrls] = useState<z.infer<typeof UrlsSchema>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await fetchWithAuth('/urls/');
        if (response.ok) {
          const data = await response.json();
          setUrls(UrlsSchema.parse(data));
        } else {
          console.error('Failed to fetch URLs');
        }
      } catch (error) {
        console.error('An error occurred while fetching URLs', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrls();
  }, []);

  if (isLoading) {
    return <div>Loading URLs...</div>;
  }

  if (urls.length === 0) {
    return <div>You have not created any short URLs with us.</div>;
  }

  const truncateUrl = (url: string, maxLength: number) => {
    if (url.length <= maxLength) {
      return url;
    }
    return `${url.substring(0, maxLength)}...`;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date Created</TableHead>
          <TableHead>Short URL</TableHead>
          <TableHead>Long URL</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {urls.map((url) => (
          <TableRow key={url.uuid}>
            <TableCell>{new Date(url.creation_date).toLocaleDateString()}</TableCell>
            <TableCell>
              <a
                href={`${window.location.origin}/${url.shortened_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-500 hover:underline"
              >
                {`${window.location.origin}/${url.shortened_slug}`}
              </a>
            </TableCell>
            <TableCell title={url.original_url}>
              {truncateUrl(url.original_url, 50)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
