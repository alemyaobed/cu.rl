import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Link2Icon, ArrowRightIcon, BarChart3Icon, ShieldIcon } from 'lucide-react';

export function Home() {
  const [url, setUrl] = useState('');

  const handleShorten = async () => {
    // TODO: Implement URL shortening
    toast.success('URL shortened successfully!');
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
              Create short, memorable links in seconds. Track clicks and analyze your audience.
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
              <Button onClick={handleShorten} className="bg-violet-500 hover:bg-violet-600">
                Shorten
              </Button>
            </div>
          </div>
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