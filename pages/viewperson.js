"use client";

import React, { useEffect, useState } from 'react';
import styles from '../styles/viewperson.module.css';
import Image from 'next/image';
import LogoImg from '../public/Logo.png';
import Navbar from '../components/navbar'; 

const API_BASE_URL = 'https://memorymosaic.vercel.app';

const ViewPerson = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [currentMemoryIndex, setCurrentMemoryIndex] = useState(0);

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
          fetchPeopleData();
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

  const fetchPeopleData = () => {
    fetch(`${API_BASE_URL}/api/people`, { credentials: 'include' })
      .then(response => response.json())
      .then(data => setPeople(data))
      .catch(error => console.error('Error fetching people:', error));
  };



  const handlePersonSelect = (event) => {
    const selectedId = event.target.value;
    const person = people.find(p => p._id === selectedId);
    setSelectedPerson(person);
    setCurrentMemoryIndex(0);
  };

  const handlePrevMemory = () => {
    setCurrentMemoryIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : selectedPerson.memories.length - 1
    );
  };

  const handleNextMemory = () => {
    setCurrentMemoryIndex((prevIndex) => 
      prevIndex < selectedPerson.memories.length - 1 ? prevIndex + 1 : 0
    );
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className={styles.background}>
        <div className={styles.app}>
          <div className={styles.loginBox}>
            <div className={styles.logoContainer}>
             <Navbar />
              <Image src={LogoImg} alt="Memory Mosaic Logo" className={styles.logo} />
              <h1 className={styles.titleLoggedOut}>Memory Mosaic</h1>
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
   <Navbar />
      <h1 className={styles.title}>People Archive</h1>
      <div className={styles.content}>
        <div className={styles.selectContainer}>
          <select 
            className={styles.personSelect} 
            onChange={handlePersonSelect} 
            value={selectedPerson ? selectedPerson._id : ''}
          >
            <option value="">Select a person</option>
            {people.map(person => (
              <option key={person._id} value={person._id}>{person.name}</option>
            ))}
          </select>
        </div>
        {selectedPerson && selectedPerson.memories && selectedPerson.memories.length > 0 && (
          <div className={styles.memoryCarousel}>
          <div className={styles.memoryArchive}>
          <h2 className={styles.centeredHeading}> </h2>
              <h2>{selectedPerson.name}&apos;s Memories</h2>
            <div className={styles.carouselContainer}>
              <button className={styles.arrowButton} onClick={handlePrevMemory}>&lt;</button>
              <div className={styles.memoryCard}>
                <img 
                  src={selectedPerson.memories[currentMemoryIndex].photo} 
                  alt={selectedPerson.memories[currentMemoryIndex].title}
                  className={styles.fullSizePhoto}
                />
                <h3>{selectedPerson.memories[currentMemoryIndex].title}</h3>
                <p>{selectedPerson.memories[currentMemoryIndex].comments[0]?.text}</p>
              </div>
              <button className={styles.arrowButton} onClick={handleNextMemory}>&gt;</button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ViewPerson;