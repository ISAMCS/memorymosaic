import React from 'react';
import Link from 'next/link';
import styles from "./navbar.module.css";
import Image from "next/image";
import LogoImg from "../public/Logo.png";
import './navbar.module.css';
// This code defines a Navbar component using React

const Navbar = () => {
  return (

<nav className={styles.navbar}
/* Left side of the navbar */>
  <div className = {styles.navbarLeft}>
    <ul>
       {/* Logo image */}
      <Image alt="logo" src={LogoImg} className={styles.logoPic}/>
         {/* Website name/logo text */}
      <li className = {styles.logo}>
        <Link href="/">
        Memory Mosaic
      </Link>
    </li>
  </ul>
</div>

{/* Right side of the navbar */}
  <div className = {styles.navbarRight}>
     {/* First set of navigation links */}
    <ul>
       {/* About page link */}
      <li>
        <Link href="/about" className= {styles.item}>
          About
        </Link>
      </li>
         {/* Login page link */}
      <li>
        <Link href="/login" className = {styles.item}>
          Login
        </Link>
      </li>
       {/* View Person page link */}
      <li>
          <Link href="/ViewPerson">View Person</Link>
      </li>
    </ul>
     {/* Second set of navigation links */}
    <ul>
      {/* List of People page link */}
      <li>
        <Link href="/listOfPeople" className = {styles.item}>
          People
        </Link>
      </li>
      {/* Create or Edit Person page link */}
      <li>
        <Link href="/CreateEdit" className = {styles.item}>
          Create or Edit Person
        </Link>
      </li>
      <li>
        <Link href="/Profile" className={styles.item}>
         Profile
        </Link>
    </li>
    </ul>
  </div>

</nav>
);
};

// Make the Navbar component available for use in other parts of the application

export default Navbar;