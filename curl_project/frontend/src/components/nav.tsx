import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Link2Icon, MenuIcon, XIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { token, logout } = useAuth();
  const isLoggedIn = token && token.user.user_type === "free";
  const isStaff = token?.user.is_superuser;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-24 items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Link2Icon className="h-6 w-6 md:h-8 md:w-8 text-violet-500" />
          <span className="font-bold text-2xl md:text-4xl">cu.rl</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="hidden md:flex items-center space-x-2">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-foreground text-base md:text-lg"
                  >
                    Dashboard
                  </Button>
                </Link>

                {isStaff && (
                  <Link to="/admin">
                    <Button
                      variant="ghost"
                      className="text-foreground text-base md:text-lg"
                    >
                      Admin
                    </Button>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  className="text-foreground text-base md:text-lg"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-foreground text-base">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-violet-500 hover:bg-violet-600 text-white dark:text-white text-base">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
            <ModeToggle />
          </nav>
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-0 z-50 grid h-screen w-screen grid-flow-row auto-rows-max overflow-auto p-6">
            <div className="relative z-50 grid gap-6 rounded-md bg-popover p-4 text-popover-foreground shadow-md">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <XIcon className="h-6 w-6" />
                </Button>
              </div>
              <nav className="grid gap-4">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className="w-full text-foreground text-base"
                      >
                        Dashboard
                      </Button>
                    </Link>

                    {isStaff && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className="w-full text-foreground text-base"
                        >
                          Admin
                        </Button>
                      </Link>
                    )}

                    <Button
                      variant="ghost"
                      className="w-full text-foreground text-base"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full text-foreground text-base"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-violet-500 hover:bg-violet-600 text-white dark:text-white text-base">
                        Sign up
                      </Button>
                    </Link>
                  </>
                )}
                <ModeToggle />
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
