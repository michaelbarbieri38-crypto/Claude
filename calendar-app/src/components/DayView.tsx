import type { Attachment, EventOccurrence } from '../types';
import TimeGrid from './TimeGrid';

interface Props {
  anchor: Date;
  occurrences: EventOccurrence[];
  attachmentsByEvent: Map<string, Attachment[]>;
  onSlotClick: (dateISO: string, time: string) => void;
  onEventClick: (occ: EventOccurrence) => void;
  onAttachmentClick: (attachment: Attachment) => void;
}

export default function DayView({ anchor, ...rest }: Props) {
  return <TimeGrid days={[anchor]} {...rest} />;
}
