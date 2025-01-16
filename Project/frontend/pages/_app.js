import React from 'react';
import PropTypes from 'prop-types';
import { MyContextProvider } from '../context/MyContext'; // Adjust the import path as needed
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <MyContextProvider>
      <Component {...pageProps} />
    </MyContextProvider>
  );
}
MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default MyApp;