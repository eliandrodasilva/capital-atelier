import zxcvbn from 'zxcvbn';
import { Progress } from '@/components/ui/progress';

const STRENGTH_CONFIG = {
  0: {
    label: 'Muito fraca',
    score: 20,
    color: 'bg-muted-foreground/50',
    textColor: 'text-muted-foreground',
  },
  1: {
    label: 'Fraca',
    score: 40,
    color: 'bg-muted-foreground/70',
    textColor: 'text-muted-foreground',
  },
  2: {
    label: 'Média',
    score: 60,
    color: 'bg-muted-foreground',
    textColor: 'text-foreground',
  },
  3: {
    label: 'Forte',
    score: 80,
    color: 'bg-foreground/80',
    textColor: 'text-foreground',
  },
  4: {
    label: 'Muito forte',
    score: 100,
    color: 'bg-primary',
    textColor: 'text-foreground',
  },
};

const PasswordStrengthMeter = ({ password }) => {
  if (!password) return null;

  const result = zxcvbn(password);
  const config = STRENGTH_CONFIG[result.score] || STRENGTH_CONFIG[0];

  return (
    <div className="flex flex-col gap-1.5 pt-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Força da senha:</span>
        <span className={`font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>

      <Progress value={config.score} indicatorClassName={config.color} />
    </div>
  );
};

export default PasswordStrengthMeter;
