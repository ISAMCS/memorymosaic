import Image from "next/image";
import userImg from '/public/user.png';
import documentImg from '/public/document.png';
import writingImg from '/public/writing.png';
import sendImg from '/public/send.png';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className = {styles.page}>
      <div className={styles.part1}>
        <h1> 
          A good life is a collection of happy memories.
        </h1>
        <h2>
          -Denis Waitley
        </h2>
        <div className={styles.row}>
          <div className={styles.column}>
            <h2>Step 1</h2>
            <p>Add <br></br> Person</p>
            <Image alt="document" src={userImg} className={styles.center}/>
          </div>
          <div className={styles.column}>
            <h2>Step 2</h2>
            <p>Upload <br></br> Photos</p>
            <Image alt="document" src={documentImg} className={styles.center}/>
          </div>
          <div className={styles.column}>
            <h2>Step 3</h2>
            <p>Write <br></br> Description</p>
            <Image alt="document" src={writingImg} className={styles.center}/>
          </div>
          <div className={styles.column}>
            <h2>Step 4</h2>
            <p>Share <br></br> Memories</p>
            <Image alt="document" src={sendImg} className={styles.center}/>
          </div>
        </div>
      </div>
      
    </div>
  );
}
