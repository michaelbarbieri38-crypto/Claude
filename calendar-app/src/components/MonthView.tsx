import { format, isSameMonth, isToday } from 'date-fns';
import type { Attachment, EventOccurrence } from '../types';
import { getMonthGrid, toISODate } from '../utils/dates';
import AttachmentThumb from './AttachmentThumb';

interface Props {
  anchor: Date;
  occurrences: EventOccurrence[];
  attachmentsByEvent: Map<string, Attachment[]>;
  onDayClick: (dateISO: string) => void;
  onEventClick: (occ: EventOccurrence) => void;
  onAttachmentClick: (attachment: Attachment) => void;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_VISIBLE = 3;

export default function MonthView({
  anchor,
  occurrences,
  attachmentsByEvent,
  onDayClick,
  onEventClick,
  onAttachmentClick,
}: Props) {
  const days = getMonthGrid(anchor);
  const occByDate = new Map<string, EventOccurrence[]>();
  for (const occ of occurrences) {
    const list = occByDate.get(occ.occurrenceDate) ?? [];
    list.push(occ);
    occByDate.set(occ.occurrenceDate, list);
  }

  return (
    <div className="month-view">
      <div className="month-weekday-row">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="month-weekday">
            {d}
          </div>
        ))}
      </div>
      <div className="month-grid">
        {days.map((day) => {
          const iso = toISODate(day);
          const dayOccs = occByDate.get(iso) ?? [];
          const visible = dayOccs.slice(0, MAX_VISIBLE);
          const overflow = dayOccs.length - visible.length;
          const inMonth = isSameMonth(day, anchor);
          return (
            <div
              key={iso}
              className={`month-cell ${inMonth ? '' : 'outside'} ${isToday(day) ? 'today' : ''}`}
              onClick={() => onDayClick(iso)}
            >
              <div className="month-cell-date">
                <span className={isToday(day) ? 'today-badge' : ''}>{format(day, 'd')}</span>
              </div>
              <div className="month-cell-events">
                {visible.map((occ, i) => {
                  const atts = attachmentsByEvent.get(occ.event.id) ?? [];
                  return (
                    <div
                      key={`${occ.event.id}-${occ.occurrenceDate}-${i}`}
                      className="month-event"
                      style={{ borderLeftColor: occ.event.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(occ);
                      }}
                    >
                      {!occ.event.allDay && occ.event.startTime && (
                        <span className="month-event-time">{formatShortTime(occ.event.startTime)}</span>
                      )}
                      <span className="month-event-title">{occ.event.title || '(untitled)'}</span>
                      {atts.length > 0 && (
                        <AttachmentThumb
                          attachment={atts[0]}
                          size={14}
                          onClick={() => onAttachmentClick(atts[0])}
                        />
                      )}
                    </div>
                  );
                })}
                {overflow > 0 && <div className="month-event-overflow">+{overflow} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatShortTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'p' : 'a';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${period}` : `${h12}:${String(m).padStart(2, '0')}${period}`;
}
