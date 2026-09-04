import type { Attachment } from '../types';
import { formatFileSize, getObjectURL, isImageType } from '../utils/files';

interface Props {
  attachment: Attachment;
  onClose: () => void;
}

export default function FilePreviewModal({ attachment, onClose }: Props) {
  const url = getObjectURL(attachment.id, attachment.blob);
  const isImg = isImageType(attachment.fileType);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="preview-title">
            <strong>{attachment.fileName}</strong>
            <span className="muted"> · {formatFileSize(attachment.size)}</span>
          </div>
          <div className="preview-actions">
            <a className="btn" href={url} target="_blank" rel="noopener noreferrer">
              Open in new tab
            </a>
            <button className="icon-btn" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>
        <div className="preview-body">
          {isImg ? (
            <img src={url} alt={attachment.fileName} className="preview-image" />
          ) : (
            <iframe src={url} title={attachment.fileName} className="preview-pdf" />
          )}
        </div>
      </div>
    </div>
  );
}
