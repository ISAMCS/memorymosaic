import React from 'react';
import Navbar from '../components/navbar.js';
import Loading from '../components/loading.js';

export default function RootLayout({ children, loading }) {
  return (
    <>
      <Navbar />
      {loading ? <Loading /> : children}
    </>
  );
}