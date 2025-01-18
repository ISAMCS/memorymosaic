import React from "react";
import styles from "../styles/about.module.css";
import Image from "next/image";
import graceHeadshot from "../public/graceHeadshot.jpg";
import colinHeadshot from "../public/colinHeadshot.jpg";
import isabellaHeadshot from "../public/isabellaHeadshot.png"
import kevinHeadshot from "../public/kevinHeadshot.png"
import arwenHeadshot from "../public/arwenHeadshot.png"
import yutakaHeadshot from "../public/yutakaHeadshot.png"
import muhaisHeadshot from "../public/muhaisHeadshot.png"
import Navbar from "../components/navbar"; 
 
export default function AboutPage() {
    return (
      <div className = {styles.body}>
        <div className= {styles.photo}>
          <div className= {styles.text}>
            <h1 className = {styles.ourTeam}> Meet the Team</h1>
            <div className = {styles.table}>
              <Navbar />
              <div className = {`${styles.div1} ${styles.cells}`}>
                <Image alt="headshot" src={arwenHeadshot} className = {styles.headshot}/>
                <p className = {styles.name}>Arwen Louie </p>
                <p className = {styles.position}>Frontend </p>
              </div> 
              <div className = {`${styles.div2} ${styles.cells}`}>
                <Image alt="headshot" src={colinHeadshot} className = {styles.headshot}/>
                <p className = {styles.name}>Colin Su </p>
                <p className = {styles.position}>Frontend </p>
              </div>
              <div className = {`${styles.div3} ${styles.cells}`}>
                <Image alt="headshot" src={graceHeadshot} className = {styles.headshot}/>
                <p className = {styles.name}>Grace Sletten </p>
                <p className = {styles.position}>Frontend </p>
              </div>
              <div className = {`${styles.div4} ${styles.cells}`}>
                <Image alt="headshot" src={isabellaHeadshot} className = {styles.headshot}/>
              <p className = {styles.name}>Isabella Marquez </p>
              <p className = {styles.position}>Frontend + Backend </p>
              </div>
              <div className = {`${styles.div5} ${styles.cells}`}>
                <Image alt="headshot" src={kevinHeadshot} className = {styles.headshot}/>
                 <p className = {styles.name}>Kevin Hwang </p>
                <p className = {styles.position}>Backend </p>
              </div>
              <div className = {`${styles.div6} ${styles.cells}`}>
                <Image alt="headshot" src={muhaisHeadshot} className = {styles.headshot}/>
                <p className = {styles.name}>Muhais Olatundun </p>
                <p className = {styles.position}>Backend </p>
              </div>
              <div className = {`${styles.div7} ${styles.cells}`}>
                <Image alt="headshot" src={yutakaHeadshot} className = {styles.headshot}/>
                <p className = {styles.name}>Yutaka Gomi </p>
                <p className = {styles.position}>Frontend </p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    );
  }
