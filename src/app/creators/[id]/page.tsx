import { CreatorProfilePage } from "@/modules/creators/pages/creator-profile-page";

type CreatorProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default function Page(props: CreatorProfilePageProps) {
  return <CreatorProfilePage {...props} />;
}

