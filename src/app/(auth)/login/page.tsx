'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // 1. Sign in with Firebase Client Auth
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // 2. Get ID Token
      const idToken = await userCredential.user.getIdToken();
      
      // 3. Send ID Token to our server to create a session cookie
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      setSuccess('Login successful! Redirecting to dashboard...');

      // 4. Redirect to dashboard
      router.push('/dashboard');
      router.refresh(); // Force refresh to apply middleware state
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setError(err.message || 'An error occurred during login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem' }}>
        
        {/* Brand Header with Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <Logo size="lg" showText={true} text="SaleTrack" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Welcome back! Sign in to access your sales workspace.
          </p>
        </div>
        
        {error && (
          <div style={{ padding: '0.85rem 1rem', backgroundColor: 'hsla(354, 75%, 52%, 0.12)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '0.85rem 1rem', backgroundColor: 'hsla(145, 65%, 42%, 0.12)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <input 
              id="email" 
              type="email" 
              placeholder="name@company.com"
              className={`input-field ${errors.email ? 'input-error' : ''}`} 
              {...register('email')} 
            />
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label" htmlFor="password">Password</label>
              <Link href="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>
            <input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              className={`input-field ${errors.password ? 'input-error' : ''}`} 
              {...register('password')} 
            />
            {errors.password && <span className="error-message">{errors.password.message}</span>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          SaleTrack Platform • Secure Workspace
        </div>
      </div>
    </main>
  );
}
