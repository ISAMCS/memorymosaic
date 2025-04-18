import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import userImg from '../public/addUser.png';
import LogoImg from '../public/Logo.png';
import styles from '../styles/listOfPeople.module.css';

const PersonIcon = ({ person, onDelete }) => {
  return (
    <div className={styles.userIcon}>
      <div className={styles.imageContainer}>
        {person.profilePicture ? (
          <img
          src={`/api${person.profilePicture.replace(/api\//, '')}`}
            alt={person.name}
            width={100}
            height={100}
            className={styles.userPicture}
          />
        ) : (
          <img
            src={userImg}
            alt="Default User"
            width={100}
            height={100}
            className={styles.userPicture}
          />
        )}
      </div>
      <div className={styles.userName}>{person.name}</div>
      <button onClick={() => onDelete(person.id)}>Delete</button>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`/api/user-profile`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          fetchPeople();
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

  const fetchPeople = async () => {
    try {
      const response = await fetch(`/api/people`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch people');
      }
      const data = await response.json();
      setPeople(data);
    } catch (error) {
      console.error('Error fetching people:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (personId) => {
    try {
      const response = await fetch(`/api/people/${personId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setPeople(people.filter(person => person._id !== personId));
      } else {
        throw new Error('Failed to delete person');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
      setError(error.message);
    }
  };

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextPerson = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (people.length + 1));
  };

  const prevPerson = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + people.length + 1) % (people.length + 1));
  };

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

  if (people.length === 0) {
    return (
      <div className={styles.background}>
        <div className={styles.app}>
          <div className={styles.loginBox}>
            <div className={styles.logoContainer}>
              <Image src={LogoImg} alt="Memory Mosaic Logo" className={styles.logo} />
              <h1 className={styles.titleLoggedOut}>Memory Mosaic</h1>
            </div>
            <h2 className={styles.message}>Welcome!</h2>
            <p className={styles.subMessage}>Please create a person!</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.background}>
      <div className={styles.app}>
        <div className={styles.carousel}>
          <button className={styles.arrowButton} onClick={prevPerson}>&lt;</button>
          <div className={styles.carouselContent}>
            {currentIndex < people.length ? (
              <PersonIcon
                key={people[currentIndex]._id}
                person={people[currentIndex]}
                onDelete={handleDelete}
              />
            ) : (
              <div className={styles.addIcon}>
                <Link href="/createPerson" className={styles.item}>
                  <div className={styles.imageContainer}>
                    <Image src={userImg} alt="Add User" className={styles.addIconPic} />
                  </div>
                  <p className={styles.text}>Add User</p>
                </Link>
              </div>
            )}
          </div>
          <button className={styles.arrowButton} onClick={nextPerson}>&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default App;