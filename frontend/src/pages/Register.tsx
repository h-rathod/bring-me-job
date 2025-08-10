import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../lib/api';

export function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/register', { fullName, email, password });
      toast.success('Account created. Please sign in.');
      navigate('/login');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg backdrop-blur">
        <h1 className="mb-1 text-center text-3xl font-semibold tracking-tight">Create account</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">Start your journey with Bring Me Job.</p>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-muted-foreground">Full name</label>
            <input
              id="fullName"
              className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted-foreground/70 focus:border-transparent focus:ring-2 focus:ring-primary/40"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email</label>
            <input
              id="email"
              type="email"
              className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted-foreground/70 focus:border-transparent focus:ring-2 focus:ring-primary/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">Password</label>
            <input
              id="password"
              type="password"
              className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted-foreground/70 focus:border-transparent focus:ring-2 focus:ring-primary/40"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
