import { getUserProfile, updateUserProfile } from "@/actions/user";
import MyProfileView from "./_components/my-profile-view";

export default async function MyProfilePage() {
  const profile = await getUserProfile();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and professional bio
        </p>
      </div>
      
      <MyProfileView initialProfile={profile} />
    </div>
  );
}
