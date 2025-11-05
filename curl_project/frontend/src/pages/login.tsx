import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Link2Icon, TrendingUp, Shield, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  login: z.string().min(1, "Please enter your username or email"),
  password: z.string().min(1, "Please enter your password"),
});

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await login(values);
      toast.success("Successfully logged in!");
      navigate("/dashboard");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full lg:grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md space-y-8">
          {/* Header */}
          <div className="flex flex-col space-y-2 text-center">
            <Link to="/" className="mx-auto">
              <div className="flex items-center gap-2">
                <Link2Icon className="h-8 w-8 text-violet-500" />
                <span className="text-2xl font-bold">cu.rl</span>
              </div>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight mt-6">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form Card */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="login"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username or Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="yourusername or m@example.com"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-violet-600 hover:text-violet-700 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-violet-600 hover:bg-violet-700 font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-violet-600 hover:text-violet-700 hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Features */}
      <div className="hidden lg:flex bg-gradient-to-br from-violet-500 to-indigo-600 p-12 text-white">
        <div className="flex flex-col justify-center space-y-8 max-w-md mx-auto">
          <div>
            <h2 className="text-4xl font-bold mb-4">
              Manage your links with confidence
            </h2>
            <p className="text-violet-100 text-lg">
              Access powerful analytics, custom branded links, and detailed insights to grow your business.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Real-time Analytics</h3>
                <p className="text-violet-100">
                  Track clicks, locations, and performance in real-time
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Detailed Reports</h3>
                <p className="text-violet-100">
                  Get comprehensive insights on your audience behavior
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Secure & Reliable</h3>
                <p className="text-violet-100">
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
