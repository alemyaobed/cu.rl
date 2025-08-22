import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className='container flex-1 py-0 md:py-24 lg:py-32'>
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center space-y-12 text-center">
      <div className="space-y-6">
        <h1 className="text-9xl font-bold tracking-tighter sm:text-[10rem]">404</h1>
        <p className="text-2xl text-gray-500 dark:text-gray-400">
          Oops! The page you're looking for could not be found.
        </p>
      </div>
      <Link to="/">
        <Button className="bg-violet-500 hover:bg-violet-600">Go back home</Button>
      </Link>
    </div>
    </div>
  );
}
