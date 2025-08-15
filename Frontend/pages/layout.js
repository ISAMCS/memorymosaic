import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/navbar.js'

export default function RootLayout({ children }) {

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}