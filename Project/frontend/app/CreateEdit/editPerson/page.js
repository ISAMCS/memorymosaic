"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './edit-person.module.css';

const EditPerson = () => {
  

  const { id } = useParams();
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryComment, setMemoryComment] = useState('');
  const [memoryPhoto, setMemoryPhoto] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [memoryPreview, setMemoryPreview] = useState(null);

  useEffect(() => {
    fetchPeople();
  }, []);

  useEffect(() => {
    if (people.length > 0) {
      const person = people.find(p => p._id === id);
      if (person) {
        setSelectedPerson(person);
      }
    }
  }, [people, id]);

  const fetchPeople = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/people', {
        credentials: 'include',
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

  const handleMemoryChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 1800;
          canvas.height = 1200;

          const aspectRatio = img.width / img.height;
          let newWidth = 1800;
          let newHeight = 1800 / aspectRatio;

          if (newHeight < 1200) {
            newHeight = 1200;
            newWidth = 1200 * aspectRatio;
          }

          const offsetX = (newWidth - 1800) / 2;
          const offsetY = 0;

          ctx.drawImage(img, -offsetX, -offsetY, newWidth, newHeight);

          const croppedDataUrl = canvas.toDataURL('image/jpeg');
          setMemoryPreview(croppedDataUrl);
          
          fetch(croppedDataUrl)
            .then(res => res.blob())
            .then(blob => {
              const croppedFile = new File([blob], file.name, { type: 'image/jpeg' });
              setMemoryPhoto(croppedFile);
            });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMemorySubmit = async () => {
    const formData = new FormData();
    formData.append('title', memoryTitle);
    formData.append('comment', memoryComment);
    if (memoryPhoto) {
      formData.append('photo', memoryPhoto);
    }
    try {
      const response = await fetch(`http://localhost:3000/api/people/${selectedPerson._id}/memories`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to add memory');
      }
      const updatedPerson = await response.json();
      setPeople(people.map(person => person._id === updatedPerson._id ? updatedPerson : person));
      setSelectedPerson(updatedPerson);
      setMemoryTitle('');
      setMemoryComment('');
      setMemoryPhoto(null);
      setMemoryPreview(null);
      alert('Memory added successfully');
    } catch (error) {
      console.error('Error adding memory:', error);
      alert('Error adding memory');
    }
  };

  const handleDeleteMemory = async (personId, memoryId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/people/${personId}/memories/${memoryId}`, {
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
        {Array.isArray(people) && people.length > 0 ? (
          people.map(person => (
            <div key={person._id} className={styles.profileWrapper} onClick={() => handlePersonClick(person)}>
              <div className={styles.imageContainer}>
                {person.profilePicture ? (
                  <img src={person.profilePicture} alt={person.name} className={styles.profilePicture} />
                ) : (
                  <div className={styles.placeholderImage}>
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <p className={styles.personName}>{person.name}</p>
            </div>
          ))
        ) : (
          <p>No people available</p>
        )}
      </div>
      {showPopup && selectedPerson && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <h2>{selectedPerson.name}</h2>
            <div className={styles.memoryUploadContainer}>
              <div className={styles.uploadBox} onClick={() => document.getElementById('memoryUpload').click()}>
                {memoryPreview ? (
                  <img src={memoryPreview} alt="Memory preview" className={styles.memoryPreview} />
                ) : (
                  <p>Click to upload a photo</p>
                )}
              </div>
              <input
                id="memoryUpload"
                type="file"
                onChange={handleMemoryChange}
                accept="image/*"
                className={styles.hiddenFileInput}
              />
            </div>
            <input
              type="text"
              value={memoryTitle}
              onChange={(e) => setMemoryTitle(e.target.value)}
              placeholder="Enter memory title"
              className={styles.memoryTitleInput}
            />
            <textarea
              value={memoryComment}
              onChange={(e) => setMemoryComment(e.target.value)}
              placeholder="Enter memory comment"
              className={styles.memoryCommentInput}
            />
            <button onClick={handleMemorySubmit} className={styles.submitButton}>
              Submit Memory
            </button>
            <div className={styles.memoriesContainer}>
              <h3>Saved Memories</h3>
              {selectedPerson.memories.map((memory, index) => (
                <div key={memory._id} className={styles.memoryItem}>
                  <h4>Memory #{index + 1}: {memory.title}</h4>
                  <img src={memory.photo} alt={memory.title} className={styles.memoryPhoto} />
                  {memory.comments.map((comment, commentIndex) => (
                    <p key={commentIndex}>{comment.text}</p>
                  ))}
                  <button onClick={() => handleDeleteMemory(selectedPerson._id, memory._id)} className={styles.deleteButton}>
                    Delete Memory
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setShowPopup(false)} className={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPerson;