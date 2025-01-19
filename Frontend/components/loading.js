import React from 'react';
import styles from '../styles/loading.module.css';

function Loading() {
    return <div className = {styles.all}>
        <div className={styles.dots}></div>
        <div className={styles.dots}></div>
        <div className={styles.dots}></div>
        <div className={styles.dots}></div>
        <div className={styles.dots}></div>
    </div>;
}

export default Loading;