import AboutUsPage from "@/components/about/AboutUsPage";
import { Metadata } from "next";
import { defaultIcons } from "@/lib/metadata/icons";

export const metadata: Metadata = {
  title: "About Us - AI Hub",
  description: "Learn about AI Hub - a technology-driven platform bringing users a centralized space to explore and access the most valuable AI tools available today.",
  icons: defaultIcons,
};

export default async function About() {
  return <AboutUsPage />;
}

