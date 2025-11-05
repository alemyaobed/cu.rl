import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link2Icon, MenuIcon, Settings, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { user, logout } = useAuth();
  const isLoggedIn = user && user.user_type === "free";
  const isStaff = user?.is_superuser;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
      setShowLogoutDialog(false);
    } catch (error) {
      toast.error((error as Error).message);
      setShowLogoutDialog(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <Link2Icon className="h-6 w-6 text-violet-500" />
          <span className="font-bold text-xl">cu.rl</span>
        </Link>

        {/* Desktop Navigation - Center */}
        <nav className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
          {isLoggedIn && (
            <>
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  className="text-sm font-medium"
                >
                  Dashboard
                </Button>
              </Link>

              {isStaff && (
                <Link to="/admin">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium"
                  >
                    Admin
                  </Button>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-violet-500 text-white text-sm">
                          {user?.username?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || "No email"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-medium">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-700 font-medium">
                    Get Started
                  </Button>
                </Link>
                <ModeToggle />
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Link2Icon className="h-6 w-6 text-violet-500" />
              <span className="font-bold text-xl">cu.rl</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="overflow-y-auto h-[calc(100vh-80px)]">
                {isLoggedIn ? (
                  <>
                    {/* User Profile Section */}
                    <div className="px-6 py-4 bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-violet-500 text-white text-sm font-semibold">
                            {user?.username?.substring(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{user?.username}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email || "No email"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="px-3 py-4 space-y-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block"
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-base font-medium"
                        >
                          Dashboard
                        </Button>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block"
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-base font-medium"
                        >
                          <Settings className="h-5 w-5 mr-3" />
                          Settings
                        </Button>
                      </Link>

                      {isStaff && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block"
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-base font-medium"
                          >
                            <Shield className="h-5 w-5 mr-3" />
                            Admin
                          </Button>
                        </Link>
                      )}
                    </div>

                    {/* Bottom Section */}
                    <div className="border-t px-3 py-4 space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-base font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowLogoutDialog(true);
                        }}
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Log out
                      </Button>
                    </div>
                  </>

                ) : (
                  <>
                    {/* Guest Menu */}
                    <div className="px-6 py-8 space-y-3">
                      <Link 
                        to="/login" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="block"
                      >
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full text-base font-medium"
                        >
                          Sign in
                        </Button>
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block"
                      >
                        <Button size="lg" className="w-full bg-violet-600 hover:bg-violet-700 text-base font-medium">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                    
                    {/* Theme Toggle */}
                    <div className="border-t px-6 py-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Appearance</span>
                        <ModeToggle />
                      </div>
                    </div>
                  </>
                )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of your account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
