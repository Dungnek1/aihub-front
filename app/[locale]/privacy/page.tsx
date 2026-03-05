import { Metadata } from "next";
import PrivacyPolicyPage from "@/components/privacy/PrivacyPolicyPage";
import { defaultIcons } from "@/lib/metadata/icons";

export const metadata: Metadata = {
  title: "Privacy Policy - AI Hub",
  description:
    "Learn how AI Hub collects, uses, and protects your information. Our Privacy Policy explains your rights and how we handle your data.",
  icons: defaultIcons,
};

export default async function Privacy() {
  return <PrivacyPolicyPage />;
}

