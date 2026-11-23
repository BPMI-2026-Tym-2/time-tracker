export type Activity = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  color?: string;
  category?: string;
  tag?: string | string[];
};
