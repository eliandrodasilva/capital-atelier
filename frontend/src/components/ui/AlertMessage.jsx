import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const AlertMessage = ({ message, variant = "error" }) => {
  if (!message) return null;

  const isSuccess = variant === "success";

  return (
    <div
      className={`flex items-center justify-center gap-2.5 rounded-md p-3 text-sm border ${
        isSuccess
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-red-500/30 bg-red-500/10 text-red-400"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      <span className="text-center">{message}</span>
    </div>
  );
};

export default AlertMessage;
