"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/createPerson.module.css';
import Loading from '../components/loading';

const API_BASE_URL = "http://localhost:3000";

const CreatePersonPage = () => {
  const [person, setPerson] = useState({ name: '', photo: null });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();
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
          setLoading(false);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setUser(null);
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

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

    const formData = new FormData();
    formData.append('name', person.name);
    if (person.photo) {
      formData.append('photo', person.photo);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/people`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        } catch (e) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Person created successfully:', result);
      router.push('/editPerson');
    } catch (error) {
      console.error('Error creating person:', error.message);
      setError(`Failed to create person: ${error.message}`);
    }
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
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