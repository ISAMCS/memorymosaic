"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/CreateEdit.module.css';
import LogoImg from '../public/Logo.png'; 
import Loading from '../components/loading';

const API_BASE_URL = "http://localhost:3000";

const CreateEdit = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user-profile`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
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

  if (loading) {
    return <Loading />;
  }

  if (!user) {
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.titlelogged}>Create or Edit Person</h1>
      <div className={styles.grid}>
        <Link href="/createPerson" className={styles.card}>
          <h2>Create Person</h2>
          <p>Add a new person to the database</p>
        </Link>
        <Link href="/editPerson" className={styles.card}>
          <h2>Edit Person</h2>
          <p>Modify an existing person's details</p>
        </Link>
      </div>
    </div>
  );
}

export default CreateEdit;