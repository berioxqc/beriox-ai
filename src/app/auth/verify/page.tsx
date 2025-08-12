"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Token de vérification manquant');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Erreur lors de la vérification');
        } else {
          setSuccess(data.message);
          // Rediriger vers la page de connexion après 5 secondes
          setTimeout(() => {
            router.push('/auth/signin');
          }, 5000);
        }
      } catch (error) {
        setError('Erreur lors de la vérification');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Vérification de votre email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Beriox AI</h1>
          <p className="text-gray-300">Vérification de compte</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
              {success}
              <p className="mt-2 text-sm">Redirection vers la page de connexion...</p>
            </div>
          )}

          <div className="text-center">
            <Link 
              href="/auth/signin"
              className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
