import BlockchainNetworkSection from "@/components/landing/introduction/BlockchainNetworkSection";
import FeaturedProductsSection from "@/components/landing/introduction/FeaturedProductsSection";
import MissionSection from "@/components/landing/introduction/MissionSection";
import OurMemberSection from "@/components/landing/introduction/OurMemberSection";
import VisionSection from "@/components/landing/introduction/VisionSection";
export default function Introduction() {
    return (
        <main>
            <BlockchainNetworkSection />
            <VisionSection />
            <MissionSection />
            <OurMemberSection />
            <FeaturedProductsSection />
        </main>
    );
}