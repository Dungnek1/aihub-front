import AuthVideoBackground from "@/components/AuthVideoBackground";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
  return (
    <AuthVideoBackground>
      {children}
    </AuthVideoBackground>
  );
}

