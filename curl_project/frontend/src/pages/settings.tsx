import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Calendar, Shield, Trash2, AlertTriangle, ArrowLeft, Palette } from "lucide-react";
import { deleteAccount } from "@/lib/api";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";

export function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success("Account deleted successfully");
      await logout();
      navigate("/");
    } catch (error) {
      toast.error((error as Error).message || "An error occurred while deleting your account");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return null;
  }

  const formattedDate = new Date(user.date_joined).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container max-w-5xl py-6 md:py-10">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your profile and account preferences
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/dashboard")}
            className="self-start sm:self-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Profile Card with Avatar */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-violet-500 text-white text-2xl font-semibold">
                  {user.username?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{user.username}</CardTitle>
                <CardDescription className="text-base mt-1">
                  {user.email || "No email provided"}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={user.user_type === "free" ? "default" : "secondary"} className="font-medium">
                    {user.user_type === "free" ? "Free Plan" : user.user_type}
                  </Badge>
                  {user.is_superuser && (
                    <Badge variant="destructive" className="font-medium">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              Information about your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Username</p>
                  <p className="text-base font-semibold">{user.username}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                  <p className="text-base font-semibold">{user.email || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p className="text-base font-semibold">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                  <p className="text-base font-semibold text-green-600 dark:text-green-400">Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how cu.rl looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  Select your preferred color theme
                </p>
              </div>
              <ModeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-destructive/10 p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-destructive/20 bg-destructive/5 p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-5 w-5 text-destructive" />
                      <h3 className="font-semibold text-lg">Delete Account</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-start gap-2">
                        <div className="rounded-full bg-destructive/20 p-1 mt-0.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                        </div>
                        <p className="text-sm text-muted-foreground">All your shortened URLs will be permanently deleted</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="rounded-full bg-destructive/20 p-1 mt-0.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                        </div>
                        <p className="text-sm text-muted-foreground">All analytics and click data will be lost forever</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="rounded-full bg-destructive/20 p-1 mt-0.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                        </div>
                        <p className="text-sm text-muted-foreground">Your account cannot be recovered after deletion</p>
                      </div>
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="md:mt-0">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md">
                      <AlertDialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="rounded-full bg-destructive/10 p-3">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                          </div>
                          <AlertDialogTitle className="text-xl">Delete Account?</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="space-y-3 text-base">
                          <p>
                            You are about to permanently delete your account <strong className="text-foreground">{user.username}</strong>. 
                            This action cannot be undone.
                          </p>
                          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                            <p className="text-sm font-semibold text-destructive">
                              ⚠️ All your data will be permanently deleted:
                            </p>
                            <ul className="text-sm mt-2 space-y-1 text-muted-foreground">
                              <li>• Shortened URLs</li>
                              <li>• Analytics data</li>
                              <li>• Account information</li>
                            </ul>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Deleting..." : "Yes, Delete Forever"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
