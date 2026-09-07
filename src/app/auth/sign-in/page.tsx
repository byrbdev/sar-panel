'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'context/AuthContext';
import { MdVisibility, MdVisibilityOff, MdStorefront } from 'react-icons/md';

export default function SignInPage() {
  const { signIn, profile, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!loading && profile) {
      router.replace('/admin/default');
    }
  }, [loading, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error: err } = await signIn(email, password);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    router.replace('/admin/default');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-lightPrimary px-4 dark:bg-navy-900">
      <div className="w-full max-w-[420px] rounded-[20px] bg-white p-8 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600">
            <MdStorefront className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-poppins text-2xl font-bold text-navy-700 dark:text-white">
            Panel Dropship
            <br />
            <span className="font-medium">By RB</span>
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Masuk untuk mengelola bisnis dropship kamu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none focus:border-brand-400 dark:border-white/10 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1.5 ml-1.5 block text-sm font-bold text-navy-700 dark:text-white">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white/0 p-3 pr-11 text-sm text-navy-700 outline-none focus:border-brand-400 dark:border-white/10 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <MdVisibilityOff className="h-5 w-5" />
                ) : (
                  <MdVisibility className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-500 dark:bg-red-500/10">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-brand-500 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Akun hanya dibuat oleh Super Admin. Hubungi admin tim kamu jika
          belum memiliki akun.
        </p>
      </div>
    </div>
  );
}
