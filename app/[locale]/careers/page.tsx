import CareerPage from "@/components/career/CareerPage";
import { Metadata } from "next";
import { defaultIcons } from "@/lib/metadata/icons";

export const metadata: Metadata = {
  title: "Careers - AI Hub",
  description: "Join AI Hub and help us build the future. Explore career opportunities and be part of a team that creates meaningful experiences.",
  icons: defaultIcons,
};

export default async function Careers() {
  return <CareerPage />;
}

