'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { Activity } from './types';

type ZobrazeniZaznamnikuSkupinyProps = {
  activities: Activity[];
  leftControl?: ReactNode; //temporary
  rightControl?: ReactNode; //temporary
};

function timeToMinutes(time: string): number {
  const parts = time.split(':');
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  return hours * 60 + minutes;
}

function dateToKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function ZobrazeniZaznamnikuSkupiny({
  activities,
  leftControl,
  rightControl,
}: ZobrazeniZaznamnikuSkupinyProps) {
  const days = ['PO', 'ÚT', 'ST', 'ČT', 'PÁ', 'SO', 'NE'];

  const [today, setToday] = useState<Date | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setToday(new Date());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (today === null) {
    return <div>Loading calendar...</div>;
  }

  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const hours = [4, 8, 12, 16, 20];

  return (
    <>
      {/*<pre>
        {JSON.stringify(activities, null, 2)}
      </pre>   debugging    */}

      <div className="flex h-full min-h-0 w-full min-w-0 flex-col">
        {/* Week navigation  */}
        <div className="mb-4 flex items-center gap-3">
          {/* Add activity button */}
          <div className="mr-auto flex shrink-0">{leftControl}</div>

          {/* Week scroller */}
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setWeekOffset((previous) => previous - 1)}
              className="px-2 py-2 text-xl text-black hover:opacity-70"
            >
              ◀
            </button>

            <div className="rounded-xl border border-[#6c6254] bg-[#eddfc9] px-5 py-2 text-sm whitespace-nowrap text-black">
              {weekOffset === 0
                ? 'tento týden'
                : `${monday.toLocaleDateString('cs-CZ')} - ${sunday.toLocaleDateString('cs-CZ')}`}
            </div>

            <button
              type="button"
              onClick={() => setWeekOffset((previous) => previous + 1)}
              className="px-2 py-2 text-xl text-black hover:opacity-70"
            >
              ▶
            </button>
          </div>

          {/* Temporary buttons image */}
          <div className="flex shrink-0">{rightControl}</div>
        </div>

        {/* Scrollable calender */}
        <div className="min-h-0 flex-1 overflow-y-auto border-2 border-black">
          {/* Weekday header */}
          <div className="sticky top-0 z-10 grid grid-cols-[70px_repeat(7,minmax(0,1fr))] border-b border-gray-400 bg-white">
            <div className="border-r border-gray-400" />

            {days.map((day, index) => {
              const date = new Date(monday);

              date.setDate(monday.getDate() + index);

              return (
                <div
                  key={day}
                  className="flex items-center justify-center gap-1 border-r border-gray-400 p-2 last:border-r-0"
                >
                  <span className="rounded-xl border border-[#6c6254] bg-[#eddfc9] px-1.5 py-0.5 text-sm text-black">
                    {day}
                  </span>

                  <span className="text-sm text-black">{date.toLocaleDateString('cs-CZ')}</span>
                </div>
              );
            })}
          </div>

          {/* Timetable */}
          <div className="grid grid-cols-[70px_repeat(7,minmax(0,1fr))]">
            {/* Time labels */}
            <div className="relative h-[1440px] border-r border-gray-400">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute right-2 -translate-y-1/2"
                  style={{ top: `${hour * 60}px` }}
                >
                  {hour}:00
                </div>
              ))}
            </div>

            {/* day columns */}
            {days.map((day, index) => {
              const date = new Date(monday);
              date.setDate(monday.getDate() + index);

              const currentDate = dateToKey(date);

              return (
                <div
                  key={day}
                  className="relative h-[1440px] border-r border-gray-400 last:border-r-0"
                >
                  {/* Horizontal hour lines */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="absolute inset-x-0 border-t border-gray-300"
                      style={{ top: hour * 60 }}
                    />
                  ))}

                  {/* Activities belonging to what day */}
                  {activities
                    .filter((activity) => activity.date === currentDate)
                    .map((activity) => {
                      const start = timeToMinutes(activity.startTime);
                      const end = timeToMinutes(activity.endTime);

                      return (
                        <div
                          key={activity.id}
                          className="absolute inset-x-1 overflow-hidden rounded bg-blue-200 px-2 py-1 text-xs text-blue-950"
                          style={{
                            top: start,
                            height: end - start,
                          }}
                        >
                          <div className="font-bold">{activity.title}</div>
                          <div>
                            {activity.startTime}–{activity.endTime}
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
