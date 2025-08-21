import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {  fetchWithoutAuth } from '@/lib/api';

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
        } else {
          setError('URL not found');
        }
      } catch (err) {
        setError('An error occurred');
      }
    };

    if (slug) {
      fetchUrl();
    }
  }, [slug]);

  if (error) {
    return <div>{error}</div>;
  }

  return <div>Redirecting...</div>;
}
