'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Title is required.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

      const response = await fetch(`${apiBaseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          description: description.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task.');
      }

      router.push('/tasks');
      router.refresh();
    } catch (submitError) {
      console.error(submitError);
      setError('Task could not be created. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl p-8">
      <h1 className="mb-6 text-3xl font-semibold">Create task</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="mb-2 block font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-black px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create task'}
        </button>
      </form>
    </main>
  );
}
