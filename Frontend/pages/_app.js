import React from 'react';
import { useRouter } from 'next/router';
import RootLayout from './layout.js';
import "../styles/globals.css";
import '../styles/button.css';

function MyApp({ Component, pageProps }) {
  return (
    <RootLayout>
      <Component {...pageProps} />
    </RootLayout>
  );
}

export default MyApp;