import type { Attachment, EventOccurrence } from '../types';
import { getWeekDays } from '../utils/dates';
import TimeGrid from './TimeGrid';

interface Props {
  anchor: Date;
  occurrences: EventOccurrence[];
  attachmentsByEvent: Map<string, Attachment[]>;
  onSlotClick: (dateISO: string, time: string) => void;
  onEventClick: (occ: EventOccurrence) => void;
  onAttachmentClick: (attachment: Attachment) => void;
}

export default function WeekView({ anchor, ...rest }: Props) {
  const days = getWeekDays(anchor);
  return <TimeGrid days={days} {...rest} />;
}
