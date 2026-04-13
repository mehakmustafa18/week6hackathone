'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import toast from 'react-hot-toast';

function AuthSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      const fetchUserData = async () => {
        try {
          // Temporarily set token in localStorage so the API interceptor can use it
          localStorage.setItem('token', token);
          
          const { data: userData } = await api.get('/users/profile');
          
          // Use the AuthContext login to set state properly
          login(token, userData);
          
          toast.success('Login successful!');
          router.push('/');
        } catch (error) {
          console.error('Failed to fetch user data after Google login:', error);
          toast.error('Authentication failed. Please try again.');
          localStorage.removeItem('token');
          router.push('/login');
        }
      };

      fetchUserData();
    } else {
      router.push('/login');
    }
  }, [searchParams, router, login]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      gap: '1rem'
    }}>
      <div className="spinner"></div> {/* Basic spinner or styling */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Completing login...</h2>
      <p style={{ color: '#666' }}>Please wait while we redirect you.</p>
      
      <style jsx>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #000;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function AuthSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthSuccessHandler />
    </Suspense>
  );
}
