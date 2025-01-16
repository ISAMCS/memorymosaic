'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './profile.module.css';

const API_BASE_URL = 'http://localhost:3000';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user-profile`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();
        console.log("User data received:", userData);
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSquareClick = (route) => {
    router.push(route);
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className={`${styles.container} ${styles.semiTransparentBox}`}>
        <h1 className={styles.welcome}>Welcome, Guest!</h1>
        <p className={styles.loginMessage}>Please log in under the Login tab!</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.welcome}>Welcome, {user.name}!</h1>
      <div className={styles.squaresContainer}>
        <div className={styles.square} onClick={() => handleSquareClick('/ViewPerson')}>
          View People
        </div>
        <div className={styles.square} onClick={() => handleSquareClick('/CreateEdit')}>
          Create or Edit Person
        </div>
        <div className={styles.square} onClick={() => handleSquareClick('/listOfPeople')}>
          People
        </div>
      </div>
      <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Profile;