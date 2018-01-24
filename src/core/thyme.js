// @flow

import differenceInMinutes from 'date-fns/difference_in_minutes';
import isAfter from 'date-fns/is_after';
import isBefore from 'date-fns/is_before';
import isEqual from 'date-fns/is_equal';

export function calculateDuration(from: string, to: string): number {
  const [fromHour, fromMinute] = from.split(':');
  const [toHour, toMinute] = to.split(':');

  const fromDate = Date.UTC(2000, 0, 1, parseInt(fromHour, 10), parseInt(fromMinute, 10), 0);
  const toDate = Date.UTC(2000, 0, 1, parseInt(toHour, 10), parseInt(toMinute, 10), 0);

  if (toDate < fromDate) {
    return 0;
  }

  return differenceInMinutes(toDate, fromDate);
}

export function formatDuration(duration: number): string {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
}

export function totalProjectTime(
  project: projectType | { id: null, nameTree: Array<string> },
  time: Array<timeType>,
  from: Date | string,
  to: Date | string,
): number {
  return time
    .filter(entry => entry.project === project.id)
    .filter(entry => isAfter(entry.date, from) || isEqual(entry.date, from))
    .filter(entry => isBefore(entry.date, to) || isEqual(entry.date, to))
    .reduce((total, entry) => total + calculateDuration(entry.start, entry.end), 0);
}
