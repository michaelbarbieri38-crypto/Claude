import { format } from 'date-fns';
import type { ViewMode } from '../App';

interface Props {
  anchor: Date;
  view: ViewMode;
  onView: (v: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewEvent: () => void;
  onToggleSidebar: () => void;
}

export default function Header({
  anchor,
  view,
  onView,
  onPrev,
  onNext,
  onToday,
  onNewEvent,
  onToggleSidebar,
}: Props) {
  const label =
    view === 'month'
      ? format(anchor, 'MMMM yyyy')
      : view === 'week'
      ? format(anchor, 'MMMM yyyy')
      : format(anchor, 'EEEE, MMMM d, yyyy');

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="icon-btn sidebar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          </svg>
        </button>
        <span className="brand">Calendar</span>
        <button className="btn today-btn" onClick={onToday}>
          Today
        </button>
        <div className="nav-arrows">
          <button className="icon-btn" onClick={onPrev} aria-label="Previous">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
          <button className="icon-btn" onClick={onNext} aria-label="Next">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
        </div>
        <h1 className="current-label">{label}</h1>
      </div>
      <div className="header-right">
        <div className="view-switch">
          {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
            <button
              key={v}
              className={`view-btn ${view === v ? 'active' : ''}`}
              onClick={() => onView(v)}
            >
              {v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-primary new-event-btn" onClick={onNewEvent}>
          <span className="plus">+</span> New event
        </button>
      </div>
    </header>
  );
}
