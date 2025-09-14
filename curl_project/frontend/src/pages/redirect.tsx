import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchWithoutAuth } from "@/lib/api";
import { NotFoundPage } from "./not-found";

export function RedirectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const response = await fetchWithoutAuth(`/urls/${slug}/`);
        if (response.ok) {
          const data = await response.json();
          window.location.href = data.original_url;
        } else if (response.status === 404) {
          setError("URL not found");
        } else {
          setError("An error occurred");
        }
      } catch {
        setError("An error occurred");
      }
    };

    if (slug) {
      fetchUrl();
    }
  }, [slug]);

  if (error === "URL not found") {
    return <NotFoundPage />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return <div>Redirecting...</div>;
}
