import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { resetPasswordConfirm } from '@/lib/api';

const formSchema = z
  .object({
    new_password1: z.string().min(8, 'Password must be at least 8 characters'),
    new_password2: z.string(),
  })
  .refine((data) => data.new_password1 === data.new_password2, {
    message: "Passwords don't match",
    path: ['new_password2'],
  });

export function PasswordResetConfirm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { uid, token } = useParams<{ uid: string; token: string }>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      new_password1: '',
      new_password2: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (!uid || !token) {
        throw new Error('Invalid password reset link.');
      }
      await resetPasswordConfirm({ ...values, uid, token });
      toast.success('Password has been reset successfully! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container flex h-[calc(100vh-3.5rem)] w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Link2Icon className="mx-auto h-6 w-6 text-violet-500" />
          <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="new_password1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="new_password2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
