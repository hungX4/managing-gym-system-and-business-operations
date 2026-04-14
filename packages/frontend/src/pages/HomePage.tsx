import React from 'react';
import Navbar from '../components/Layout/NavBar';
import HeroCarousel from '../components/Home/HeroCarouel';
import TrialSection from '../components/Home/TrialSection';
import Footer from '../components/Layout/Footer';
const HomePage = () => {
    return (
        <main>
            <HeroCarousel />
            <TrialSection />
            {/* Sau này bạn có thể nhúng thêm các component khác ở đây:
          <AboutSection />
          <ServicesSection />
          <Footer />
      */}
        </main>
    );
};

export default HomePage;