import React from 'react';
import { UserCheck } from 'lucide-react';

const BrotherBadge = ({ name, brotherIndex = 1, avatarColor, showIcon = true }) => {
  const bIndex = brotherIndex || 1;
  const bClass = `b-${bIndex <= 3 ? bIndex : 1}`;

  return (
    <span className={`brother-badge ${bClass}`} title={`Added by ${name}`}>
      {showIcon && <UserCheck size={13} />}
      <span>{name || `Brother ${bIndex}`}</span>
    </span>
  );
};

export default BrotherBadge;
