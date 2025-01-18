import React from 'react';
import Navbar from '../components/navbar'; // Ensure the path and case are correct
import Image from 'next/image';
import styles from '../styles/index.module.css'; // Ensure the path is correct
import userImg from '../public/user.png'; // Ensure the path is correct
import documentImg from '../public/document.png'; // Ensure the path is correct

const Home = () => {
  return (
    <div className={styles.part1}>
     <Navbar />
      <h1>A good life is a collection of happy memories.</h1>
      <h2>-Denis Waitley</h2>
      <div className={styles.row}>
        <div className={styles.column}>
          <h2>Step 1</h2>
          <p>Add <br /> Person</p>
          <Image alt="document" src={userImg} className={styles.center} />
        </div>
        <div className={styles.column}>
          <h2>Step 2</h2>
          <p>Upload <br /> Photos</p>
          <Image alt="document" src={documentImg} className={styles.center} />
        </div>
      </div>
    </div>
  );
};

export default Home;