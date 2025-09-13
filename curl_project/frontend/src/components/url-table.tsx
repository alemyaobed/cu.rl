import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchWithAuth } from "@/lib/api";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const UrlSchema = z.object({
  uuid: z.string(),
  original_url: z.string(),
  shortened_slug: z.string(),
  creation_date: z.string(),
});

const UrlsSchema = z.array(UrlSchema);

export type URLTableHandle = {
  fetchUrls: () => void;
};

export const URLTable = forwardRef<URLTableHandle, {}>((_props, ref) => {
  const [urls, setUrls] = useState<z.infer<typeof UrlsSchema>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUrls = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth("/urls/");
      if (response.ok) {
        const data = await response.json();
        setUrls(UrlsSchema.parse(data));
      } else {
        console.error("Failed to fetch URLs");
      }
    } catch (error) {
      console.error("An error occurred while fetching URLs", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (uuid: string) => {
    try {
      const response = await fetchWithAuth(`/urls/${uuid}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("URL deleted successfully!");
        fetchUrls(); // Re-fetch URLs to update the table
      } else {
        toast.error("Failed to delete URL.");
      }
    } catch (error) {
      console.error("Error deleting URL:", error);
      toast.error("An error occurred while deleting the URL.");
    }
  };

  useImperativeHandle(ref, () => ({
    fetchUrls,
  }));

  useEffect(() => {
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
    <Card>
      <CardHeader>
        <CardTitle>Your URLs</CardTitle>
        <CardDescription>Manage your shortened URLs</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date Created</TableHead>
              <TableHead>Short URL</TableHead>
              <TableHead>Long URL</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {urls.map((url) => (
              <TableRow key={url.uuid}>
                <TableCell>
                  {new Date(url.creation_date).toLocaleDateString()}
                </TableCell>
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
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your shortened URL and all associated analytics
                          data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(url.uuid)}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});
