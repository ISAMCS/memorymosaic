'use client';

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import './button.css';
import Image from 'next/image';
import LogoImg from '../public/Logo.png';
import { useRouter } from 'next/navigation';

const FRONTEND_URL = process.env.FRONTEND_URL;

const Login = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user profile to check login status
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${FRONTEND_URL}/api/user-profile`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData); // User is logged in
        } else {
          setUser(null); // User is not logged in
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleGoogleLogin = () => {
    router.push(`${FRONTEND_URL}/auth/google`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return (
      <div className={styles.background}>
        <div className={styles.app}>
          <div className={styles.loginBox}>
            <div className={styles.logoContainer}>
              <Image src={LogoImg} alt="Memory Mosaic Logo" className={styles.logo} />
              <h1 className={styles.title}>Memory Mosaic</h1>
            </div>
            <h2 className={styles.message}>Welcome!</h2>
            <p className={styles.subMessage}>You are already logged in!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.background}>
      <div className={styles.app}>
        <div className={styles.loginBox}>
          <div className={styles.logoContainer}>
            <Image src={LogoImg} alt="Memory Mosaic Logo" className={styles.logo} />
            <h1 className={styles.title}>Memory Mosaic</h1>
          </div>
          <h2 className={styles.message}>Welcome!</h2>
          <p className={styles.subMessage}>Please log in to continue</p>
          <div className={styles.googleButtonContainer}>
            <button onClick={handleGoogleLogin} className="gsi-material-button">
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  {/* Google logo SVG */}
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                  >
                    {/* SVG paths here */}
                  </svg>
                </div>
                <span className="gsi-material-button-contents google-sign-in-text">Sign in with Google</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
