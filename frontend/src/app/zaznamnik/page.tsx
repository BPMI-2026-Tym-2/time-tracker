'use client';

import { useState, type SubmitEvent } from 'react';
import Image from 'next/image';
import ZobrazeniZaznamnikuSkupiny from '@/components/features/zaznamnik/zobrazeni-zaznamniku-skupiny';
import type { Activity } from '@/components/features/zaznamnik/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import sidebarImage from './tempImages/sidebar.png';
import topbarImage from './tempImages/topbar.png';
import buttonsImage from './tempImages/buttons.png';

// Temporary 100% slopped form component-------------------------------------------------------------------
function TemporaryAddActivity({ onAdd }: { onAdd: (activity: Activity) => void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const title = String(formData.get('title') ?? '').trim();
    const date = String(formData.get('date') ?? '');
    const startTime = String(formData.get('startTime') ?? '');
    const endTime = String(formData.get('endTime') ?? '');

    if (endTime <= startTime) {
      setError('Čas ukončení musí být později než čas zahájení.');
      return;
    }

    onAdd({
      id: crypto.randomUUID(),
      title,
      date,
      startTime,
      endTime,
    });

    setError('');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            className="rounded-xl border border-[#6c6254] bg-[#eddfc9] px-3 py-2 text-black shadow-none hover:bg-[#e2cfb0]"
          />
        }
      >
        Přidat aktivitu
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Přidat aktivitu</DialogTitle>
          <DialogDescription>Vyplňte informace o nové aktivitě.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity-title">Název aktivity</Label>
            <Input id="activity-title" name="title" type="text" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-date">Datum</Label>
            <Input id="activity-date" name="date" type="date" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-start">Začátek</Label>
            <Input id="activity-start" name="startTime" type="time" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-end">Konec</Label>
            <Input id="activity-end" name="endTime" type="time" required />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <Button type="submit">Uložit aktivitu</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
// Temporary  100% slopped  form component end----------------------------------------------------------------------

export default function ZaznamnikPage() {
  const [activities, setActivities] = useState<Activity[]>([]);

  function addActivity(activity: Activity) {
    setActivities((previous) => [...previous, activity]);
  }

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="relative w-[155px] shrink-0">
        <Image src={sidebarImage} alt="Temporary sidebar" fill className="object-fill" />
      </aside>

      {/* Everything to the right of the sidebar */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top toolbar */}
        <header className="shrink-0">
          <Image src={topbarImage} alt="Temporary toolbar" className="block h-auto w-full" />
        </header>

        {/* calender and temporary controls image */}
        <section className="flex min-h-0 flex-1 flex-col p-4">
          <div className="min-h-0 flex-1">
            <ZobrazeniZaznamnikuSkupiny
              activities={activities}

              leftControl={<TemporaryAddActivity onAdd={addActivity} />}

              rightControl={
                <Image
                  src={buttonsImage}
                  alt="Temporary toolbar buttons"
                  width={290}
                  className="h-auto max-w-full object-contain"
                />
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}
