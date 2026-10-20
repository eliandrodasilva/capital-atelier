import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const AlertMessage = ({ message, variant = 'error' }) => {
  if (!message) return null;

  const isSuccess = variant === 'success';

  return (
    <div
      className={`flex items-center justify-center gap-2.5 rounded-none border p-3 text-sm ${
        isSuccess
          ? 'border-border bg-secondary text-foreground'
          : 'border-foreground bg-muted text-foreground'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <span className="text-center">{message}</span>
    </div>
  );
};

export default AlertMessage;
