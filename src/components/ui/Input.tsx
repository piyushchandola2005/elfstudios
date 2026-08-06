import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col w-full space-y-2">
        {label && (
          <label className="font-mono text-sm uppercase tracking-widest text-gray-400">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`bg-white border border-gray-300 px-4 py-3 font-sans text-black focus:outline-none focus:border-black transition-colors ${
            error ? "border-red-500" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="font-mono text-xs text-red-500">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
