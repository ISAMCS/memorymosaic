"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/createPerson.module.css';
import Navbar from '../components/navbar'; 

const CreatePersonPage = () => {
  const [person, setPerson] = useState({ name: '', photo: null });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('https://memorymosaic.vercel.app/api/user-profile', {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Redirect to login if not authenticated
          router.push('/auth/google');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setError('Failed to authenticate. Please try again.');
      }
    };

    checkAuth();
  }, [router]);

  const handleNameChange = (e) => {
    setPerson(prev => ({ ...prev, name: e.target.value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPerson(prev => ({ ...prev, photo: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be logged in to create a person');
      return;
    }

    const formData = new FormData();
    formData.append('name', person.name);
    if (person.photo) {
      formData.append('photo', person.photo);
    }

    try {
      const response = await fetch('https://memorymosaic.vercel.app/api/people', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        } catch (error) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Person created successfully:', result);
      router.push('/CreateEdit/editPerson');
    } catch (error) {
      console.error('Error creating person:', error.message);
      setError(`Failed to create person: ${error.message}`);
    }
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
       <Navbar />
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={`${styles.uploadCircle} ${preview ? styles.hasImage : ''}`}>
          <input type="file" onChange={handlePhotoChange} accept="image/*" />
          {preview ? (
            <img src={preview} alt="Profile Preview" className={styles.profilePicture} />
          ) : (
            <div className={styles.uploadText}>Upload Picture</div>
          )}
        </div>
        <input
          type="text"
          value={person.name}
          onChange={handleNameChange}
          placeholder="Enter name"
          className={styles.input}
          required
        />
        <button type="submit" className={styles.button}>
          Create Person
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

export default CreatePersonPage;