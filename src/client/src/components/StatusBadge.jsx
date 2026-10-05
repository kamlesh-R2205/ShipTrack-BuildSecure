import React from 'react';

const STATUS_LABELS = {
  CREATED: 'Created',
  ASSIGNED: 'Assigned',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`badge badge-${status}`}>
      ● {label}
    </span>
  );
}
