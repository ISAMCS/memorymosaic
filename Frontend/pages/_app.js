import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import RootLayout from './layout';
import "../styles/globals.css";
import '../styles/button.css';
import Loading from '../components/loading.js';

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <RootLayout loading={loading}>
      {loading ? <Loading /> : <Component {...pageProps} />}
    </RootLayout>
  );
}

export default MyApp;