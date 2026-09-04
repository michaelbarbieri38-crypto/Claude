import { format, isToday } from 'date-fns';
import type { Attachment, EventOccurrence } from '../types';
import { toISODate } from '../utils/dates';
import { layoutTimedOccurrences } from '../utils/layout';
import AttachmentThumb from './AttachmentThumb';

interface Props {
  days: Date[];
  occurrences: EventOccurrence[];
  attachmentsByEvent: Map<string, Attachment[]>;
  onSlotClick: (dateISO: string, time: string) => void;
  onEventClick: (occ: EventOccurrence) => void;
  onAttachmentClick: (attachment: Attachment) => void;
}

const HOUR_HEIGHT = 56; // px
const START_HOUR = 0;
const END_HOUR = 24;

export default function TimeGrid({
  days,
  occurrences,
  attachmentsByEvent,
  onSlotClick,
  onEventClick,
  onAttachmentClick,
}: Props) {
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  const isMultiDay = days.length > 1;

  const occByDate = new Map<string, EventOccurrence[]>();
  for (const occ of occurrences) {
    const list = occByDate.get(occ.occurrenceDate) ?? [];
    list.push(occ);
    occByDate.set(occ.occurrenceDate, list);
  }

  const handleSlotClick = (dateISO: string, hour: number) => {
    onSlotClick(dateISO, `${String(hour).padStart(2, '0')}:00`);
  };

  return (
    <div className="time-grid-wrapper">
      <div className="time-grid-header">
        <div className="time-gutter" />
        {days.map((day) => {
          const iso = toISODate(day);
          const dayOccs = (occByDate.get(iso) ?? []).filter((o) => o.event.allDay);
          return (
            <div key={iso} className={`time-grid-day-header ${isToday(day) ? 'today' : ''}`}>
              <div className="day-header-label">
                <span className="day-header-weekday">{format(day, 'EEE')}</span>
                <span className={`day-header-num ${isToday(day) ? 'today-badge' : ''}`}>
                  {format(day, 'd')}
                </span>
              </div>
              {dayOccs.length > 0 && (
                <div className="all-day-events">
                  {dayOccs.map((occ, i) => {
                    const atts = attachmentsByEvent.get(occ.event.id) ?? [];
                    return (
                      <div
                        key={`${occ.event.id}-${i}`}
                        className="all-day-event"
                        style={{ borderLeftColor: occ.event.color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(occ);
                        }}
                      >
                        <span>{occ.event.title || '(untitled)'}</span>
                        {atts.length > 0 && (
                          <AttachmentThumb attachment={atts[0]} size={14} onClick={() => onAttachmentClick(atts[0])} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="time-grid-body">
        <div className="time-gutter">
          {hours.map((h) => (
            <div key={h} className="time-gutter-label" style={{ height: HOUR_HEIGHT }}>
              {h === 0 ? '' : formatHourLabel(h)}
            </div>
          ))}
        </div>
        {days.map((day) => {
          const iso = toISODate(day);
          const timed = layoutTimedOccurrences(occByDate.get(iso) ?? []);
          return (
            <div key={iso} className={`time-grid-day-col ${isMultiDay ? '' : 'single-day'}`}>
              {hours.map((h) => (
                <div
                  key={h}
                  className="time-slot"
                  style={{ height: HOUR_HEIGHT }}
                  onClick={() => handleSlotClick(iso, h)}
                />
              ))}
              {isToday(day) && <NowIndicator hourHeight={HOUR_HEIGHT} />}
              {timed.map((item, i) => {
                const atts = attachmentsByEvent.get(item.occ.event.id) ?? [];
                const top = (item.startMin / 60) * HOUR_HEIGHT;
                const height = Math.max(20, ((item.endMin - item.startMin) / 60) * HOUR_HEIGHT - 2);
                const widthPct = 100 / item.colCount;
                return (
                  <div
                    key={`${item.occ.event.id}-${i}`}
                    className="timed-event"
                    style={{
                      top,
                      height,
                      left: `calc(${widthPct * item.col}% + 2px)`,
                      width: `calc(${widthPct}% - 4px)`,
                      background: item.occ.event.color,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(item.occ);
                    }}
                  >
                    <div className="timed-event-content">
                      <span className="timed-event-title">{item.occ.event.title || '(untitled)'}</span>
                      {height > 34 && (
                        <span className="timed-event-time">
                          {item.occ.event.startTime && formatHourMinLabel(item.occ.event.startTime)}
                        </span>
                      )}
                      {atts.length > 0 && (
                        <span className="timed-event-attachment">
                          <AttachmentThumb
                            attachment={atts[0]}
                            size={14}
                            onClick={() => onAttachmentClick(atts[0])}
                          />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NowIndicator({ hourHeight }: { hourHeight: number }) {
  const now = new Date();
  const top = ((now.getHours() * 60 + now.getMinutes()) / 60) * hourHeight;
  return <div className="now-indicator" style={{ top }} />;
}

function formatHourLabel(h: number): string {
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12} ${period}`;
}

function formatHourMinLabel(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2, '0')} ${period}`;
}
