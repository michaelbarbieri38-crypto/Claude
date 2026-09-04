import { useMemo, useState } from 'react';
import type { Attachment, CalendarEvent } from '../types';
import { formatFileSize, getObjectURL, isImageType } from '../utils/files';
import { toISODate } from '../utils/dates';

interface Props {
  attachment: Attachment;
  events: CalendarEvent[];
  onCreateEvent: (dateISO: string) => void;
  onAssignToEvent: (eventId: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function AssignAttachmentModal({
  attachment,
  events,
  onCreateEvent,
  onAssignToEvent,
  onDelete,
  onClose,
}: Props) {
  const [newDate, setNewDate] = useState(() => toISODate(new Date()));
  const [search, setSearch] = useState('');
  const url = getObjectURL(attachment.id, attachment.blob);
  const isImg = isImageType(attachment.fileType);

  const sortedEvents = useMemo(
    () =>
      [...events]
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
        .filter((e) => e.title.toLowerCase().includes(search.toLowerCase())),
    [events, search]
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal assign-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Quick add file</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="assign-preview">
            {isImg ? (
              <img src={url} alt={attachment.fileName} className="assign-preview-img" />
            ) : (
              <div className="assign-preview-pdf">📄</div>
            )}
            <div>
              <div className="attachment-name">{attachment.fileName}</div>
              <div className="muted small">{formatFileSize(attachment.size)}</div>
            </div>
          </div>

          <div className="field-group">
            <label>Create a new event on this date</label>
            <div className="field-row">
              <input
                type="date"
                className="field"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
              <button type="button" className="btn btn-primary" onClick={() => onCreateEvent(newDate)}>
                Create event
              </button>
            </div>
          </div>

          <div className="field-group">
            <label>Or attach to an existing event</label>
            <input
              className="field"
              placeholder="Search events…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="existing-event-list">
              {sortedEvents.length === 0 && <div className="muted small">No events found.</div>}
              {sortedEvents.slice(0, 30).map((ev) => (
                <button
                  type="button"
                  key={ev.id}
                  className="existing-event-row"
                  onClick={() => onAssignToEvent(ev.id)}
                >
                  <span className="swatch-dot" style={{ background: ev.color }} />
                  <span className="existing-event-title">{ev.title || '(untitled)'}</span>
                  <span className="muted small">{ev.date}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-danger" onClick={onDelete}>
            Discard file
          </button>
          <div className="footer-spacer" />
          <button type="button" className="btn" onClick={onClose}>
            Do this later
          </button>
        </div>
      </div>
    </div>
  );
}
