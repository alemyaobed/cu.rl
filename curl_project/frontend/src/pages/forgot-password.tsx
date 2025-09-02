import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Link2Icon } from 'lucide-react';
import { forgotPassword } from '@/lib/api';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await forgotPassword(values.email);
      setIsSubmitted(true);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="container flex h-[calc(100vh-3.5rem)] w-full flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Link2Icon className="mx-auto h-6 w-6 text-violet-500" />
            <h1 className="text-2xl font-semibold tracking-tight">Email Sent</h1>
            <p className="text-sm text-muted-foreground">
              If an account with that email exists, a password reset link has
              been sent.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-[calc(100vh-3.5rem)] w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Link2Icon className="mx-auto h-6 w-6 text-violet-500" />
          <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to receive a password reset link.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-violet-500 hover:bg-violet-600"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
