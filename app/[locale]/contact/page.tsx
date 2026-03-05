import ContactPage from "@/components/contact/ContactPage";
import { Metadata } from "next";
import { defaultIcons } from "@/lib/metadata/icons";

export const metadata: Metadata = {
  title: "Contact AI Hub",
  description:
    "Reach out to our team for sales, support, or general inquiries – we're always happy to chat.",
  icons: defaultIcons,
};

export default async function Contact() {
  return <ContactPage />;
}

