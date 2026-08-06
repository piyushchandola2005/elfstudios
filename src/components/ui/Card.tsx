import React from "react";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border-t-4 border-elf-orange bg-elf-gray/50 p-6 md:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
