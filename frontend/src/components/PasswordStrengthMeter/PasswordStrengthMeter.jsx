import React from "react";
import zxcvbn from "zxcvbn";
import { Progress } from "@/components/ui/progress";

const STRENGTH_CONFIG = {
  0: { label: "Muito Fraca", score: 20, color: "bg-red-500", textColor: "text-red-400" },
  1: { label: "Fraca", score: 40, color: "bg-orange-500", textColor: "text-orange-400" },
  2: { label: "Média", score: 60, color: "bg-yellow-500", textColor: "text-yellow-400" },
  3: { label: "Forte", score: 80, color: "bg-emerald-500", textColor: "text-emerald-400" },
  4: { label: "Muito Forte", score: 100, color: "bg-green-400", textColor: "text-green-300" },
};

const PasswordStrengthMeter = ({ password }) => {
  if (!password) return null;

  const result = zxcvbn(password);
  const config = STRENGTH_CONFIG[result.score] || STRENGTH_CONFIG[0];
  
  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-zinc-400">Força da senha:</span>
        <span className={`font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>

      <Progress
        value={config.score}
        indicatorClassName={config.color}
      />
    </div>
  );
};

export default PasswordStrengthMeter;
