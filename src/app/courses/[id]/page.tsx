import { CourseDetailPage } from "@/modules/courses/pages/course-detail-page";

type CourseDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function Page(props: CourseDetailPageProps) {
  return <CourseDetailPage {...props} />;
}

