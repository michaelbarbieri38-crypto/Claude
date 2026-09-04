import { useRef, useState } from 'react';
import { DEFAULT_RECURRENCE, EVENT_COLORS, type Attachment, type CalendarEvent, type Recurrence, type RecurrenceFreq } from '../types';
import { newId } from '../db';
import { extractFilesFromDataTransfer, formatFileSize, isAcceptedFile } from '../utils/files';
import AttachmentThumb from './AttachmentThumb';

interface Props {
  initialDate: string;
  initialStartTime?: string | null;
  event: CalendarEvent | null; // null = creating new
  attachments: Attachment[]; // already-persisted attachments linked/to-be-linked to this event
  onSave: (event: CalendarEvent, newFiles: File[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDeleteAttachment: (id: string) => Promise<void>;
  onPreviewAttachment: (attachment: Attachment) => void;
  onClose: () => void;
}

function makeBlankEvent(date: string, startTime?: string | null): CalendarEvent {
  const now = Date.now();
  const start = startTime ?? '09:00';
  const [h, m] = start.split(':').map(Number);
  const endH = (h + 1) % 24;
  return {
    id: newId(),
    title: '',
    date,
    allDay: !startTime,
    startTime: start,
    endTime: `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
    location: '',
    notes: '',
    color: EVENT_COLORS[0].value,
    recurrence: { ...DEFAULT_RECURRENCE },
    createdAt: now,
    updatedAt: now,
  };
}

export default function EventModal({
  initialDate,
  initialStartTime,
  event,
  attachments,
  onSave,
  onDelete,
  onDeleteAttachment,
  onPreviewAttachment,
  onClose,
}: Props) {
  const isEditing = !!event;
  const [draft, setDraft] = useState<CalendarEvent>(() => event ?? makeBlankEvent(initialDate, initialStartTime));
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof CalendarEvent>(key: K, value: CalendarEvent[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const updateRecurrence = <K extends keyof Recurrence>(key: K, value: Recurrence[K]) =>
    setDraft((d) => ({ ...d, recurrence: { ...d.recurrence, [key]: value } }));

  const handleFiles = (files: File[]) => {
    const accepted = files.filter(isAcceptedFile);
    if (accepted.length) setNewFiles((f) => [...f, ...accepted]);
  };

  const removePendingFile = (idx: number) => setNewFiles((f) => f.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) {
      setError('Please enter a title.');
      return;
    }
    if (!draft.allDay && draft.startTime && draft.endTime) {
      if (draft.endTime <= draft.startTime) {
        setError('End time must be after start time.');
        return;
      }
    }
    setError(null);
    setSaving(true);
    try {
      await onSave({ ...draft, updatedAt: Date.now() }, newFiles);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    if (!confirm('Delete this event? This cannot be undone.')) return;
    setSaving(true);
    try {
      await onDelete(event.id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal event-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(extractFilesFromDataTransfer(e.dataTransfer));
        }}
      >
        <div className="modal-header">
          <h2>{isEditing ? 'Edit event' : 'New event'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="form-error">{error}</div>}

          <input
            className="field title-field"
            placeholder="Add title"
            value={draft.title}
            onChange={(e) => update('title', e.target.value)}
            autoFocus
          />

          <div className="field-row">
            <label className="field-label">
              <input
                type="checkbox"
                checked={draft.allDay}
                onChange={(e) => update('allDay', e.target.checked)}
              />
              All day
            </label>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>Date</label>
              <input
                type="date"
                className="field"
                value={draft.date}
                onChange={(e) => update('date', e.target.value)}
                required
              />
            </div>
            {!draft.allDay && (
              <>
                <div className="field-group">
                  <label>Start</label>
                  <input
                    type="time"
                    className="field"
                    value={draft.startTime ?? '09:00'}
                    onChange={(e) => update('startTime', e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>End</label>
                  <input
                    type="time"
                    className="field"
                    value={draft.endTime ?? '10:00'}
                    onChange={(e) => update('endTime', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="field-group">
            <label>Location</label>
            <input
              className="field"
              placeholder="Add location"
              value={draft.location}
              onChange={(e) => update('location', e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Notes</label>
            <textarea
              className="field"
              placeholder="Add notes"
              rows={3}
              value={draft.notes}
              onChange={(e) => update('notes', e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Color</label>
            <div className="color-swatches">
              {EVENT_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  className={`swatch ${draft.color === c.value ? 'selected' : ''}`}
                  style={{ background: c.value }}
                  title={c.name}
                  onClick={() => update('color', c.value)}
                />
              ))}
            </div>
          </div>

          <div className="field-group">
            <label>Repeats</label>
            <div className="field-row">
              <select
                className="field"
                value={draft.recurrence.freq}
                onChange={(e) => updateRecurrence('freq', e.target.value as RecurrenceFreq)}
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              {draft.recurrence.freq !== 'none' && (
                <span className="recurrence-interval">
                  every
                  <input
                    type="number"
                    min={1}
                    className="field small-number"
                    value={draft.recurrence.interval}
                    onChange={(e) => updateRecurrence('interval', Math.max(1, Number(e.target.value) || 1))}
                  />
                  {draft.recurrence.freq === 'daily' && 'day(s)'}
                  {draft.recurrence.freq === 'weekly' && 'week(s)'}
                  {draft.recurrence.freq === 'monthly' && 'month(s)'}
                </span>
              )}
            </div>
            {draft.recurrence.freq !== 'none' && (
              <div className="field-row recurrence-end">
                <label className="field-label">
                  Until
                  <input
                    type="date"
                    className="field"
                    value={draft.recurrence.endDate ?? ''}
                    min={draft.date}
                    onChange={(e) => updateRecurrence('endDate', e.target.value || null)}
                    placeholder="Never"
                  />
                </label>
                <span className="muted">(leave blank to repeat indefinitely)</span>
              </div>
            )}
          </div>

          <div className="field-group">
            <label>Attachments</label>
            {(attachments.length > 0 || newFiles.length > 0) && (
              <ul className="attachment-list">
                {attachments.map((a) => (
                  <li key={a.id} className="attachment-row">
                    <AttachmentThumb attachment={a} onClick={() => onPreviewAttachment(a)} />
                    <span className="attachment-name">{a.fileName}</span>
                    <span className="muted small">{formatFileSize(a.size)}</span>
                    <button
                      type="button"
                      className="icon-btn small"
                      onClick={() => onDeleteAttachment(a.id)}
                      aria-label="Remove attachment"
                    >
                      ✕
                    </button>
                  </li>
                ))}
                {newFiles.map((f, idx) => (
                  <li key={`new-${idx}`} className="attachment-row pending">
                    <span className="attachment-pending-icon">{f.type.startsWith('image/') ? '🖼️' : '📄'}</span>
                    <span className="attachment-name">{f.name}</span>
                    <span className="muted small">{formatFileSize(f.size)} · new</span>
                    <button
                      type="button"
                      className="icon-btn small"
                      onClick={() => removePendingFile(idx)}
                      aria-label="Remove file"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div
              className={`dropzone ${dragActive ? 'active' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <span>Drag & drop a PDF or image here, or click to choose a file</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files) handleFiles(Array.from(e.target.files));
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {isEditing && (
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={saving}>
              Delete
            </button>
          )}
          <div className="footer-spacer" />
          <button type="button" className="btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
