import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses =
    "font-display uppercase tracking-widest px-4 py-2 text-[0.75rem] font-bold transition-all duration-200 border border-transparent";

  const variants = {
    primary:
      "bg-black text-white border-black hover:bg-elf-orange hover:border-elf-orange hover:text-black",
    secondary:
      "bg-gray-100 text-black border-gray-100 hover:bg-black hover:text-white hover:border-black",
    outline:
      "bg-transparent text-black border-black/20 hover:bg-black hover:text-white hover:border-black",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  );
}
