import Script from 'next/script';
import { ThemeProvider } from 'next-themes';

import { NFTProvider } from '../context/NFTContext';

import { Navbar, Footer } from '../components';

import '../styles/globals.css';

const MyApp = ({ Component, pageProps }) => (
  <NFTProvider>
    <ThemeProvider attribute="class">
      <div className="dark:bg-nft-dark bg-white min-h-screen">
        <Navbar />
        <div className="pt-65">
          <Component {...pageProps} />
        </div>
        <Footer />
      </div>
      <Script src="https://kit.fontawesome.com/c3cf6b4510.js" crossOrigin="anonymous" />
    </ThemeProvider>
  </NFTProvider>
);

export default MyApp;
