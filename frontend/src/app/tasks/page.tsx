import { Task } from '@time-tracker/shared';

export const instant = false;

const apiBaseUrl =
  process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Next.js Server Component
export default async function TaskList() {
  // Frontend ví přesně, jak vypadá Task, protože sdílí TypeScript typ z Prismy
  const res = await fetch(`${apiBaseUrl}/api/tasks`);
  if (!res.ok) {
    throw new Error(`Failed to load tasks: ${res.status} ${res.statusText}`);
  }

  const tasks: Task[] = await res.json();

  return (
    <ul className="space-y-4">
      {tasks.map((task) => (
        <li key={task.id}>
          <div className="border p-4 rounded shadow mb-4">
            <p className="text-lg font-semibold">{task.title}</p>
            <span className="text-sm text-gray-500">{task.description}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
