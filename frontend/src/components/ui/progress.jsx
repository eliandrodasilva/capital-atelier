import * as React from 'react';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef(
  ({ className, value, indicatorClassName, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'border-border bg-secondary relative h-2 w-full overflow-hidden rounded-none border',
        className
      )}
      {...props}
    >
      <div
        className={cn('bg-primary h-full w-full flex-1', indicatorClassName)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  )
);
Progress.displayName = 'Progress';

export { Progress };
