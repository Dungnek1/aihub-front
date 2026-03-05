import HeroSection from "@/components/landing/home/HeroSection";
import FeaturesSection from "@/components/landing/home/FeatureSection";
import CTASection from "@/components/landing/home/CTASection";
import CoreValuesSection from "@/components/landing/home/CoreValuesSection";
import NewsletterSection from "@/components/landing/home/NewsletterSection";

export default function Home() {
    return (
        <main>
            <HeroSection />
            <FeaturesSection />
            <CTASection />
            <CoreValuesSection />
            <NewsletterSection />
        </main>
    );
}   