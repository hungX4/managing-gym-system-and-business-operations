
import HeroCarousel from '../components/Home/HeroCarouel';
import TrialSection from '../components/Home/TrialSection';
import CoachList from '../components/Home/CoachList';
import OnlinePaymentComponent from '../components/Home/OnlinePaymentComponent';
const HomePage = () => {
    return (
        <main>
            <HeroCarousel />
            <TrialSection />
            <OnlinePaymentComponent />
            <CoachList />
            {/* 
          <AboutSection />
          <ServicesSection />
      */}
        </main>
    );
};

export default HomePage;