import React from 'react';
import Navbar from '../components/Layout/NavBar';
import HeroCarousel from '../components/Home/HeroCarouel';
import TrialSection from '../components/Home/TrialSection';
import Footer from '../components/Layout/Footer';
import OnlinePaymentPage from './OnlinePaymentPage';
const HomePage = () => {
    return (
        <main>
            <HeroCarousel />
            <TrialSection />
            <OnlinePaymentPage />
            {/* Sau này bạn có thể nhúng thêm các component khác ở đây:
          <AboutSection />
          <ServicesSection />
      */}
        </main>
    );
};

export default HomePage;