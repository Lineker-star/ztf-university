import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import SchoolsPreview from '@/components/home/SchoolsPreview';
import FounderSection from '@/components/home/FounderSection';
import WhyZTF from '@/components/home/WhyZTF';
import OnlineBanner from '@/components/home/OnlineBanner';
import PartnersSection from '@/components/home/PartnersSection';
import AdmissionCTA from '@/components/home/AdmissionCTA';
import LatestNews from '@/components/home/LatestNews';
import ContactStrip from '@/components/home/ContactStrip';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <SchoolsPreview />
      <FounderSection />
      <WhyZTF />
      <OnlineBanner />
      <PartnersSection />
      <AdmissionCTA />
      <LatestNews />
      <ContactStrip />
    </>
  );
}
