import { format, parseISO } from 'date-fns';
import type { Attachment, EventOccurrence } from '../types';
import AttachmentThumb from './AttachmentThumb';
import { formatTime } from '../utils/dates';

interface Props {
  open: boolean;
  upcomingWithAttachments: { occ: EventOccurrence; attachments: Attachment[] }[];
  unassignedAttachments: Attachment[];
  onEventClick: (occ: EventOccurrence) => void;
  onAttachmentClick: (attachment: Attachment) => void;
  onUnassignedClick: (attachment: Attachment) => void;
}

export default function Sidebar({
  open,
  upcomingWithAttachments,
  unassignedAttachments,
  onEventClick,
  onAttachmentClick,
  onUnassignedClick,
}: Props) {
  return (
    <aside className={`sidebar ${open ? 'open' : 'closed'}`}>
      {unassignedAttachments.length > 0 && (
        <div className="sidebar-section">
          <h3>Unassigned files ({unassignedAttachments.length})</h3>
          <p className="muted small sidebar-hint">Quick-added files waiting to be assigned to an event.</p>
          <ul className="sidebar-list">
            {unassignedAttachments.map((a) => (
              <li key={a.id} className="sidebar-row" onClick={() => onUnassignedClick(a)}>
                <AttachmentThumb attachment={a} size={28} />
                <div className="sidebar-row-text">
                  <span className="sidebar-row-title">{a.fileName}</span>
                  <span className="muted small">Click to assign</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="sidebar-section">
        <h3>Upcoming with attachments</h3>
        {upcomingWithAttachments.length === 0 && (
          <p className="muted small sidebar-hint">
            Events with a ticket, itinerary, or receipt attached will show up here.
          </p>
        )}
        <ul className="sidebar-list">
          {upcomingWithAttachments.map(({ occ, attachments }) => (
            <li
              key={`${occ.event.id}-${occ.occurrenceDate}`}
              className="sidebar-row"
              onClick={() => onEventClick(occ)}
            >
              <span className="swatch-dot" style={{ background: occ.event.color }} />
              <div className="sidebar-row-text">
                <span className="sidebar-row-title">{occ.event.title || '(untitled)'}</span>
                <span className="muted small">
                  {format(parseISO(occ.occurrenceDate), 'EEE, MMM d')}
                  {!occ.event.allDay && occ.event.startTime ? ` · ${formatTime(occ.event.startTime)}` : ''}
                </span>
              </div>
              <div className="sidebar-row-thumbs">
                {attachments.slice(0, 3).map((a) => (
                  <AttachmentThumb key={a.id} attachment={a} size={22} onClick={() => onAttachmentClick(a)} />
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
