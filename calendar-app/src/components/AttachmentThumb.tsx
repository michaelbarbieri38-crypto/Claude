import type { Attachment } from '../types';
import { getObjectURL, isImageType } from '../utils/files';

interface Props {
  attachment: Attachment;
  size?: number;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}

export default function AttachmentThumb({ attachment, size = 22, onClick, title }: Props) {
  const url = getObjectURL(attachment.id, attachment.blob);
  const isImg = isImageType(attachment.fileType);

  return (
    <button
      type="button"
      className="attachment-thumb"
      style={{ width: size, height: size }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      title={title ?? attachment.fileName}
    >
      {isImg ? (
        <img src={url} alt={attachment.fileName} />
      ) : (
        <span className="pdf-icon" aria-hidden>
          <svg viewBox="0 0 24 24" width={size * 0.75} height={size * 0.75}>
            <path fill="currentColor" d="M6 2h8l5 5v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" opacity="0.25" />
            <path fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" d="M6 2h8l5 5v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" />
            <path fill="none" stroke="currentColor" strokeWidth="1.4" d="M14 2v5h5" />
            <text x="12" y="17.5" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="currentColor">
              PDF
            </text>
          </svg>
        </span>
      )}
    </button>
  );
}
