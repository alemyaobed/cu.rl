import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchWithAuth } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

type ShortenedURL = {
  uuid: string;
  original_url: string;
  shortened_slug: string;
  creation_date: string;
};

type AnalyticsData = {
  total_clicks: number;
  successful_redirects: number;
  failed_redirects: number;
  countries: string[];
  browsers: string[];
  platforms: string[];
  devices: string[];
};

export function Analytics() {
  const { uuid } = useParams<{ uuid: string }>();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [url, setUrl] = useState<ShortenedURL | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) {
      setError("URL ID not provided.");
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const response = await fetchWithAuth(`/urls/${uuid}/analytics/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: AnalyticsData = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Failed to load analytics data. Please try again.");
        toast.error("Failed to load analytics data.");
      }
    };

    const fetchUrlDetails = async () => {
      try {
        const response = await fetchWithAuth(`/urls/${uuid}/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ShortenedURL = await response.json();
        setUrl(data);
      } catch (err) {
        console.error("Failed to fetch URL details:", err);
        toast.error("Failed to load URL details.");
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAnalytics(), fetchUrlDetails()]);
      setLoading(false);
    };

    loadData();
  }, [uuid]);

  if (loading) {
    return <div className="container py-8">Loading analytics...</div>;
  }

  if (error) {
    return <div className="container py-8 text-red-500">Error: {error}</div>;
  }

  if (!analyticsData) {
    return <div className="container py-8">No analytics data available.</div>;
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link to="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {url && (
        <>
          <h1 className="text-3xl font-bold mb-6">Analytics Data</h1>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Showing analytics for your URL:</CardTitle>
              <CardDescription className="break-words">
                <a
                  href={url.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {url.original_url}
                </a>
              </CardDescription>
            </CardHeader>
          </Card>
        </>
      )}

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Clicks</CardTitle>
            <CardDescription>All time clicks on this URL</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analyticsData.total_clicks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Successful Redirects</CardTitle>
            <CardDescription>
              Clicks that led to a successful redirect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {analyticsData.successful_redirects}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Failed Redirects</CardTitle>
            <CardDescription>
              Clicks that did not lead to a successful redirect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {analyticsData.failed_redirects}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Countries</CardTitle>
            <CardDescription>Top countries by clicks</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.countries.length > 0 ? (
              <ul className="list-disc list-inside">
                {analyticsData.countries.map((country, index) => (
                  <li key={index}>{country}</li>
                ))}
              </ul>
            ) : (
              <p>No country data available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browsers</CardTitle>
            <CardDescription>Top browsers by clicks</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.browsers.length > 0 ? (
              <ul className="list-disc list-inside">
                {analyticsData.browsers.map((browser, index) => (
                  <li key={index}>{browser}</li>
                ))}
              </ul>
            ) : (
              <p>No browser data available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platforms</CardTitle>
            <CardDescription>Top platforms by clicks</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.platforms.length > 0 ? (
              <ul className="list-disc list-inside">
                {analyticsData.platforms.map((platform, index) => (
                  <li key={index}>{platform}</li>
                ))}
              </ul>
            ) : (
              <p>No platform data available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>Top devices by clicks</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.devices.length > 0 ? (
              <ul className="list-disc list-inside">
                {analyticsData.devices.map((device, index) => (
                  <li key={index}>{device}</li>
                ))}
              </ul>
            ) : (
              <p>No device data available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
