import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import StatsSection from '../components/StatsSection';
import FeaturesSection from '../components/FeaturesSection';
import TelegramSection from '../components/TelegramSection';
import TeamSection from '../components/TeamSection';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      {/* <TelegramSection />*/}
      <TeamSection />
      <Footer />
    </div>
  );
}
