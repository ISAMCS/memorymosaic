import React from 'react';
import Link from 'next/link';
import Image from "next/image";
import styles from "../styles/navbar.module.css";
import LogoImg from "../public/Logo.png";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <ul>
          <li>
            <Image alt="logo" src={LogoImg} className={styles.logoPic} />
          </li>
          <li className={styles.logo}>
            <Link href="/">Memory Mosaic</Link>
          </li>
        </ul>
      </div>
      <div className={styles.navbarRight}>
        <ul>
          <li>
            <Link href="/about" className={styles.item}>About</Link>
          </li>
          <li>
            <Link href="/login" className={styles.item}>Login</Link>
          </li>
          <li>
            <Link href="/viewperson">View Person</Link>
          </li>
        </ul>
        <ul>
          <li>
            <Link href="/listOfPeople" className={styles.item}>People</Link>
          </li>
          <li>
            <Link href="/CreateEdit" className={styles.item}>Create or Edit Person</Link>
          </li>
          <li>
            <Link href="/Profile" className={styles.item}>Profile</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
