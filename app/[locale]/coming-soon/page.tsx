import ComingSoonPage from "@/components/ComingSoonPage";
import { Metadata } from "next";
import { defaultIcons } from "@/lib/metadata/icons";

export const metadata: Metadata = {
  title: "Coming Soon - AI Hub",
  description: "This page is coming soon. Stay tuned for exciting updates!",
  icons: defaultIcons,
};

export default function ComingSoon() {
  return <ComingSoonPage />;
}

