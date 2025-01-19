"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import styles from '../styles/editPerson.module.css';
import Navbar from '../components/navbar'; 
import Loading from '../components/loading';

const EditPerson = () => {
  const params = useParams();
  const id = params ? params.id : null;
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryComment, setMemoryComment] = useState('');
  const [memoryPhoto, setMemoryPhoto] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonData = async () => {
      try {
        const response = await fetch(`/api/people/${id}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const personData = await response.json();
          setSelectedPerson(personData);
        } else {
          setSelectedPerson(null);
        }
      } catch (error) {
        console.error('Error fetching person data:', error);
        setSelectedPerson(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchPeople = async () => {
      try {
        const response = await fetch('/api/people', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch people');
        }
        const data = await response.json();
        setPeople(data);
      } catch (error) {
        console.error('Error fetching people:', error);
      }
    };

    if (id) {
      fetchPersonData();
    } else {
      setLoading(false);
    }

    fetchPeople();
  }, [id]);

  useEffect(() => {
    if (people.length > 0 && id) {
      const person = people.find(p => p._id === id);
      if (person) {
        setSelectedPerson(person);
      }
    }
  }, [people, id]);

  if (loading) {
    return <Loading />;
  }

  const handleMemoryChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMemoryPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteMemory = async (personId, memoryId) => {
    try {
      const response = await fetch(`/api/people/${personId}/memories/${memoryId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete memory');
      }
      const updatedPerson = await response.json();
      setPeople(prevPeople => prevPeople.map(person => person._id === updatedPerson._id ? updatedPerson : person));
      setSelectedPerson(updatedPerson);
    } catch (error) {
      console.error('Error deleting memory:', error);
      alert(`Error deleting memory: ${error.message}`);
    }
  };

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
    setShowPopup(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileContainer}>
        <Navbar />
        {Array.isArray(people) && people.length > 0 ? (
          people.map(person => (
            <div key={person._id} className={styles.profileWrapper} onClick={() => handlePersonClick(person)}>
              <div className={styles.imageContainer}>
                {person.profilePicture ? (
                  <Image src={person.profilePicture} alt={person.name} width={100} height={100} />
                ) : (
                  <div className={styles.placeholder}></div>
                )}
              </div>
              <div className={styles.profileDetails}>
                <h3>{person.name}</h3>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noPeopleFound}>No people found</p>
        )}
      </div>
    </div>
  );
};

export default EditPerson;