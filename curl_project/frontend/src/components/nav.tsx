import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Link2Icon, MenuIcon, XIcon } from "lucide-react";

export function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Link2Icon className="h-6 w-6 text-violet-500" />
          <span className="font-bold text-2xl">cu.rl</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="hidden md:flex items-center space-x-2">
            <Link to="/login">
              <Button variant="ghost" className="text-foreground text-lg">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button
                className="bg-violet-500 hover:bg-violet-600 text-white dark:text-white text-lg"
              >
                Sign up
              </Button>
            </Link>
            <ModeToggle />
          </nav>
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XIcon className="h-8 w-8" />
              ) : (
                <MenuIcon className="h-8 w-8" />
              )}
            </Button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden">
          <nav className="flex flex-col items-center space-y-2 p-4">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="text-foreground text-lg">
                Login
              </Button>
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button
                className="bg-violet-500 hover:bg-violet-600 text-white dark:text-white text-lg"
              >
                Sign up
              </Button>
            </Link>
            <ModeToggle />
          </nav>
        </div>
      )}
    </header>
  );
}
