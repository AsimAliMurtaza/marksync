import ClassesManager from "./classes-manager";
import { prisma } from "@/libs/prisma";

export default async function SemesterDetailPage({ params }: { params: { id: string } }) {
  const semesterId = Number(params.id);

  const semester = await prisma.semesters.findUnique({
    where: { id: semesterId },
    include: { courses: true },
  });

  const serializedSemester = semester
    ? {
        ...semester,
        id: semester.id.toString(),
        created_by: semester.created_by.toString(),
        courses: semester.courses.map(course => ({
          ...course,
          id: course.id.toString(),
          semester_id: course.semester_id.toString(),
          created_by: course.created_by.toString(),
          allowed_radius: Number(course.allowed_radius), // Convert Decimal to number
          longitude: Number(course.longitude), // Convert Decimal to number
          latitude: Number(course.latitude), // Convert Decimal to number
          start_time: course.start_time.toISOString(),
          end_time: course.end_time.toISOString(),
        })),
      }
    : null;

  if (!serializedSemester) return <div className="p-6">Semester not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{serializedSemester.name} - Classes</h1>
      <ClassesManager
        semesterId={serializedSemester.id}
        initialData={serializedSemester.courses}
      />
    </div>
  );
}
