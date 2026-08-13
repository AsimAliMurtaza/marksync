import ClassesManager from "./classes-manager";
import { prisma } from "@/libs/prisma";

export default async function SemesterDetailPage({ params }: { params: { id: string } }) {
  const semesterId = Number(params.id);

  const [semester, instructors] = await Promise.all([
    prisma.semester.findUnique({
      where: { id: semesterId },
      include: {
        courses: {
          include: {
            instructor: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        OR: [{ role: "INSTRUCTOR" }, { role: "ADMIN" }],
      },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!semester) {
    return <div className="p-8 text-rose-600 font-bold bg-slate-50 min-h-screen">Semester not found</div>;
  }

  const formattedCourses = semester.courses.map((course) => ({
    id: String(course.id),
    title: course.title,
    code: course.code,
    room: course.room,
    allowed_radius: course.allowedRadius,
    latitude: Number(course.latitude),
    longitude: Number(course.longitude),
    day_of_week: course.dayOfWeek,
    start_time: course.startTime,
    end_time: course.endTime,
    created_by: String(course.createdBy),
    semester_id: String(course.semesterId),
    instructor_id: course.instructorId ? String(course.instructorId) : "",
    instructor_name: course.instructor?.name || "Unassigned",
  }));

  const formattedInstructors = instructors.map((inst) => ({
    id: String(inst.id),
    name: inst.name,
    email: inst.email,
    role: inst.role,
  }));

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">{semester.name} - Course Management</h1>
        <p className="text-slate-500 text-sm mt-1">
          Add, edit, or delete courses for this semester, assign instructors, set geofences, and schedule times.
        </p>
      </div>

      <ClassesManager
        semesterId={String(semester.id)}
        initialData={formattedCourses}
        instructors={formattedInstructors}
      />
    </div>
  );
}
