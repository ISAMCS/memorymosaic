
import styles from './page.module.css';
import Image from "next/image";
import LogoImg from "../public/Logo.png";
import Link from 'next/link';

export default function createUser() {
    return (
      <div className = {styles.photo}>
        <div className = {styles.pad}>
          <div className = {styles.box}>
              <div className = {styles.logoContainer}>
                <Image src={LogoImg} className = {styles.logo}/>
                <h1 className = {styles.title}>Memory Mosaic</h1>
              </div>
              <h4 className = {styles.boxDes}> Username</h4>
              <input type="text" placeholder="Enter Username" className={styles.textBox} required></input>
              <h4 className = {styles.boxDes}> Password</h4>
              <input type="text" placeholder="Enter Password" className={styles.textBox} required></input>
              <Link href="createUser/empty" className={styles.createUser}>
                 Create User
              </Link>
          </div>
        </div>
      </div>
    );
}

