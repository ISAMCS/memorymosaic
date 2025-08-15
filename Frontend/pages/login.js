'use client';

import React, { useEffect, useState } from 'react';
import styles from '../styles/login.module.css';
import Image from 'next/image';
import LogoImg from '../public/Logo.png';
import { useRouter } from 'next/navigation';
import Loading from '../components/loading';

const API_BASE_URL = "http://localhost:3000";

const Login = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user-profile`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
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

  // Handle Google login button click
  const handleGoogleLogin = () => {
    router.push(`${API_BASE_URL}/auth/google`);
  };

  if (loading) {
    return <Loading />;
  }

  if (user) {
    return (
      <div className={styles.background}>
        <div className={styles.app}>
          <div className={styles.box}>
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

  if (!user) {
    return (
      <div className={styles.background}>
        <div className={styles.app}>
          <div className={styles.box}>
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
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
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
  }
};

export default Login;