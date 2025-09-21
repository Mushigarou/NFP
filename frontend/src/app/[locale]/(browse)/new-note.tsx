'use client';

import { useGenericHttp } from '@/hooks/use-generic-http';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

import { noteInSchema, NoteIn } from '@/lib/types';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function NewNoteForm() {
  const queryClient = useQueryClient();
  
  const form = useForm<NoteIn>({
    resolver: zodResolver(noteInSchema),
    defaultValues: {
      text: '',
      completed: false,
    },
  });

  const { mutate, isPending, error } = useGenericHttp<NoteIn, NoteIn>({
    endpoint: '/notes/',
    httpMethod: 'POST',
    zodDataSchema: noteInSchema,
    mutationOptions: {
      onSuccess: () => {
        form.reset();
        queryClient.invalidateQueries({ queryKey: ['notes'] });
      },
    },
  });

  function onSubmit(values: NoteIn) {
    mutate(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-md">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Note text"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="completed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Completed</FormLabel>
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isPending}>
          {isPending ? 'Adding...' : 'Add Note'}
        </Button>
        {error && <div className="text-red-500">Error: Could not add note.</div>}
      </form>
    </Form>
  );
}
