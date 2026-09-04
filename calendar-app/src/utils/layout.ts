import type { EventOccurrence } from '../types';
import { timeToMinutes } from './dates';

export interface PositionedOccurrence {
  occ: EventOccurrence;
  startMin: number;
  endMin: number;
  col: number;
  colCount: number;
}

/**
 * Assigns each timed occurrence a column index so overlapping events render
 * side by side instead of stacking on top of each other.
 */
export function layoutTimedOccurrences(occs: EventOccurrence[]): PositionedOccurrence[] {
  const items = occs
    .filter((o) => !o.event.allDay)
    .map((o) => {
      const startMin = timeToMinutes(o.event.startTime);
      let endMin = timeToMinutes(o.event.endTime);
      if (endMin <= startMin) endMin = startMin + 30;
      return { occ: o, startMin, endMin, col: 0, colCount: 1 };
    })
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  // Group into clusters of mutually-overlapping events.
  let cluster: typeof items = [];
  let clusterEnd = -1;

  const flushCluster = () => {
    if (cluster.length === 0) return;
    const columns: number[] = []; // columns[i] = end time of last event in column i
    for (const item of cluster) {
      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        if (item.startMin >= columns[c]) {
          item.col = c;
          columns[c] = item.endMin;
          placed = true;
          break;
        }
      }
      if (!placed) {
        item.col = columns.length;
        columns.push(item.endMin);
      }
    }
    const colCount = columns.length;
    for (const item of cluster) item.colCount = colCount;
    cluster = [];
  };

  for (const item of items) {
    if (cluster.length === 0) {
      cluster.push(item);
      clusterEnd = item.endMin;
    } else if (item.startMin < clusterEnd) {
      cluster.push(item);
      clusterEnd = Math.max(clusterEnd, item.endMin);
    } else {
      flushCluster();
      cluster.push(item);
      clusterEnd = item.endMin;
    }
  }
  flushCluster();

  return items;
}
