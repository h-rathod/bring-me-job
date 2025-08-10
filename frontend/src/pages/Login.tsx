import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../lib/api';
import { setToken } from '../lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      setToken(res.data.token);
      toast.success('Logged in successfully');
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <CardHeader className="mb-0">
          <CardTitle className="text-center">Sign in</CardTitle>
          <CardDescription className="text-center">Welcome back. Enter your credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
            Don't have an account? <Link to="/register" className="underline">Create one</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
