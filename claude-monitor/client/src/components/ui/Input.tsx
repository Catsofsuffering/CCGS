import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function Input({ icon, className = "", ...props }: InputProps) {
  if (icon) {
    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          {icon}
        </span>
        <input
          className={`input w-full pl-9 ${className}`}
          {...props}
        />
      </div>
    );
  }
  return <input className={`input ${className}`} {...props} />;
}
