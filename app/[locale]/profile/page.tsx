import { ProtectedPage } from "@/components/ProtectedRoute";
import ProfilePageContent from "@/components/profile/ProfilePageContent";
import { getServerUser } from "@/lib/auth.server";



export default async function ProfilePage() {
  const user = await getServerUser();

  return (
    <ProtectedPage>
      <ProfilePageContent sessionUser={user || null} />
    </ProtectedPage>
  );
}
