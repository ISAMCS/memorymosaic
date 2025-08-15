import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../styles/about.module.css';
import graceHeadshot from "../public/graceHeadshot.jpg";
import colinHeadshot from "../public/colinHeadshot.jpg";
import isabellaHeadshot from "../public/isabellaHeadshot.png";
import kevinHeadshot from "../public/kevinHeadshot.png";
import arwenHeadshot from "../public/arwenHeadshot.png";
import yutakaHeadshot from "../public/yutakaHeadshot.png";
import muhaisHeadshot from "../public/muhaisHeadshot.png";

const teamMembers = [
    { name: 'Arwen Louie', position: 'Frontend', src: arwenHeadshot },
    { name: 'Colin Su', position: 'Frontend', src: colinHeadshot },
    { name: 'Grace Sletten', position: 'Frontend', src: graceHeadshot },
    { name: 'Isabella Marquez', position: 'Frontend + Backend', src: isabellaHeadshot },
    { name: 'Kevin Hwang', position: 'Backend', src: kevinHeadshot },
    { name: 'Yutaka Gomi', position: 'Backend', src: yutakaHeadshot },
    { 
      name: 'Muhais Olatundun', 
      position: 'Backend', 
      src: muhaisHeadshot,
      style: { 
        transform: 'translateY(30px)', 
        width: '100%',
        height: '200%',
        objectFit: 'cover',
        objectPosition: 'center'
      }
    }
  ];
  

  const AboutPage = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
  
    useEffect(() => {
      // Set initial positions
      setCurrentIndex(0);
    }, []);
  
    const handlePersonClick = (index) => {
      setCurrentIndex(index);
    };
  
    return (
      <div className={styles.body}>
        <div className={styles.photo}>
          <div className={styles.text}>
            <h1 className={styles.ourTeam}> Meet the Team</h1>
            <div className={styles.carousel}>
              <div className={styles.carouselTrack}>
                {[-1, 0, 1].map((offset) => {
                  const index = (currentIndex + offset + teamMembers.length) % teamMembers.length;
                  const member = teamMembers[index];
                  const isCurrent = offset === 0;
                  return (
                    <div
                      key={index}
                      className={`${styles.cells} ${isCurrent ? styles.current : styles.blur}`}
                      style={{
                        transform: `translateX(${offset * 100}%)`,
                        zIndex: isCurrent ? 1 : 0,
                      }}
                      onClick={() => handlePersonClick(index)}
                    >
                      <Image
                        alt="headshot"
                        src={member.src}
                        className={styles.Headshot}
                        priority={isCurrent}
                        style={member.style}
                      />
                      <p className={styles.name}>{member.name}</p>
                      <p className={styles.position}>{member.position}</p>
                      {offset < 0 && <div className={styles.previousArrow}></div>}
                      {offset > 0 && <div className={styles.nextArrow}></div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default AboutPage;