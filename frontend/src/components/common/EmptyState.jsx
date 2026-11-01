import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title = 'No records found',
  description = 'There are no records matching your current filter criteria.',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`glass-card rounded-2xl p-10 text-center flex flex-col items-center justify-center border border-slate-800 ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h4 className="text-base font-semibold text-white">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm mt-1.5">{description}</p>
      {actionText && onAction && (
        <Button
          variant="primary"
          size="sm"
          onClick={onAction}
          className="mt-5"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};
