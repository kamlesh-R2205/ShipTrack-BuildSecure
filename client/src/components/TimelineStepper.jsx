import React from 'react';

const LIFECYCLE_STAGES = [
  { key: 'CREATED', label: 'Order Created' },
  { key: 'ASSIGNED', label: 'Driver Assigned' },
  { key: 'PICKED_UP', label: 'Picked Up' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export function TimelineStepper({ currentStatus, isCancelled }) {
  if (isCancelled || currentStatus === 'CANCELLED') {
    return (
      <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#f87171', textAlign: 'center', margin: '1.5rem 0' }}>
        <strong>Shipment Cancelled</strong> — This delivery was terminated before fulfillment.
      </div>
    );
  }

  const currentIndex = LIFECYCLE_STAGES.findIndex((s) => s.key === currentStatus);

  return (
    <div className="timeline-stepper">
      <div className="timeline-line-bg" />
      {LIFECYCLE_STAGES.map((stage, idx) => {
        const isCompleted = currentIndex > idx;
        const isCurrent = currentIndex === idx;

        let nodeClass = 'step-node';
        if (isCompleted) nodeClass += ' completed';
        if (isCurrent) nodeClass += ' current';

        let labelClass = 'step-label';
        if (isCompleted) labelClass += ' completed';
        if (isCurrent) labelClass += ' current';

        return (
          <div key={stage.key} className="timeline-step">
            <div className={nodeClass}>
              {isCompleted ? '✓' : idx + 1}
            </div>
            <div className={labelClass}>
              {stage.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
