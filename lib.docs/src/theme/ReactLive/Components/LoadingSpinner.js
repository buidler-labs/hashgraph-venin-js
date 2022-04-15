import * as React from "react";
import styles from "./styles.module.css";

const LoadingSpinner = () => {
  return (
    <div className={styles.loadingSpinner}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default LoadingSpinner;
