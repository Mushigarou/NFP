'use client';

import { useGenericHttp } from '@/hooks/use-generic-http';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { noteSchema } from '@/lib/types';

import { Button } from '@/components/ui/button';

import NewNoteForm from './(browse)/new-note';

const notesArraySchema = z.array(noteSchema);

export default function Home() {
  const t = useTranslations('HomePage');

  const {
    data: notes,
    isPending,
    error,
  } = useGenericHttp({
    endpoint: '/notes/',
    httpMethod: 'GET',
    zodDataSchema: notesArraySchema,
    queryOptions: {
      queryKey: ['notes'],
    },
  });

  return (
    <div className="space-y-4">
      <Button>{t('title')}</Button>
      <NewNoteForm />
      <div>
        <h2 className="font-bold">Notes</h2>
        {isPending && <div>Loading...</div>}
        {error && <div>Error loading notes</div>}
        {Array.isArray(notes) && notes.length === 0 && <div>No notes found.</div>}
        {Array.isArray(notes) && notes.length > 0 && (
          <ul className="list-disc pl-4">
            {notes.map((note) => (
              <li key={note.id}>
                <span className="font-semibold">{note.text}</span> -{' '}
                {note.completed ? 'Done' : 'Pending'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
