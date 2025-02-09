import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Link2Icon } from 'lucide-react';

export function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Link2Icon className="h-6 w-6 text-violet-500" />
          <span className="font-bold">cu.rl</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-foreground">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-violet-500 hover:bg-violet-600 text-white dark:text-white">
                Sign up
              </Button>
            </Link>
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}