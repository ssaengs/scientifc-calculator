import React from 'react';

function formatTimestamp(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function HistoryWidget({ history, onSelect }) {
  return (
    <div className="card shadow h-100" style={{ borderRadius: 20, background: '#f8f9fa' }}>
      <div className="card-body d-flex flex-column p-3">
        <h6 className="mb-3 d-flex align-items-center gap-2" style={{ fontWeight: 600 }}>
          <span style={{ fontSize: '1.1rem' }}>History</span>
          <span className="badge bg-secondary rounded-pill" style={{ fontSize: '0.7rem' }}>
            {history.length}
          </span>
        </h6>

        {history.length === 0 ? (
          <div className="text-center text-muted py-4 flex-grow-1 d-flex flex-column align-items-center justify-content-center">
            <div style={{ fontSize: '2rem', opacity: 0.3 }}>&#x1D4D2;</div>
            <div className="mt-2 small">No calculations yet.</div>
            <div className="small">Results will appear here.</div>
          </div>
        ) : (
          <ul
            className="list-group list-group-flush flex-grow-1"
            style={{ maxHeight: 480, overflowY: 'auto' }}
          >
            {history.map((h) => (
              <li
                key={h.id}
                className="list-group-item bg-transparent px-0 py-2"
                style={{ cursor: onSelect ? 'pointer' : 'default', borderColor: '#e9ecef' }}
                onClick={() => onSelect && onSelect(h.result)}
                title={onSelect ? 'Click to use this result' : undefined}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <span className="text-muted text-truncate me-2" style={{ fontSize: '0.85rem', maxWidth: '60%' }}>
                    {h.expression}
                  </span>
                  <span className="fw-bold text-nowrap" style={{ fontSize: '0.95rem' }}>
                    = {h.result}
                  </span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: 2 }}>
                  {formatTimestamp(h.created_at)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default HistoryWidget;
