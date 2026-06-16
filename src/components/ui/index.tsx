"use client";

import React, { ForwardedRef, forwardRef } from "react";
import { cn } from "@/lib/utils"; // Wait, do we have cn helper? Let's check. If not, we can write a simple cn.

// ==========================================
// BUTTON
// ==========================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          {
            "bg-blue-600 text-white hover:bg-blue-700 shadow-sm": variant === "default",
            "bg-red-600 text-white hover:bg-red-700 shadow-sm": variant === "destructive",
            "border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700": variant === "outline",
            "bg-slate-100 text-slate-900 hover:bg-slate-200": variant === "secondary",
            "hover:bg-slate-50 text-slate-700 hover:text-slate-900": variant === "ghost",
            "text-blue-600 underline-offset-4 hover:underline bg-transparent": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3 text-xs": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// ==========================================
// INPUT
// ==========================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// ==========================================
// CARD
// ==========================================
export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm", className)} {...props} />
);
export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);
export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-semibold leading-none tracking-tight text-slate-900", className)} {...props} />
);
export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-slate-500", className)} {...props} />
);
export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);
export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center p-6 pt-0 border-t border-slate-50 mt-4", className)} {...props} />
);

// ==========================================
// BADGE
// ==========================================
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
}

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        {
          "bg-slate-900 text-white border-transparent": variant === "default",
          "bg-slate-100 text-slate-800 border-transparent hover:bg-slate-200": variant === "secondary",
          "bg-red-50 text-red-700 border-red-200": variant === "destructive",
          "bg-green-50 text-green-700 border-green-200": variant === "success",
          "bg-yellow-50 text-yellow-700 border-yellow-200": variant === "warning",
          "bg-blue-50 text-blue-700 border-blue-200": variant === "info",
          "text-slate-700 border-slate-200 bg-transparent": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
};

// ==========================================
// TABLE
// ==========================================
export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-auto">
    <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
);
export const TableHeader = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn("[&_tr]:border-b border-slate-200 bg-slate-50/75", className)} {...props} />
);
export const TableBody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
);
export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("border-b border-slate-100 transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-50", className)} {...props} />
);
export const TableHead = ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn("h-10 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0", className)} {...props} />
);
export const TableCell = ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0 text-slate-700", className)} {...props} />
);

// ==========================================
// SELECT / DROPDOWN WRAPPER
// ==========================================
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <div className="relative">
          <select
            className={cn(
              "block w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8 cursor-pointer",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

// ==========================================
// DIALOG / MODAL
// ==========================================
export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Dialog = ({ isOpen, onClose, title, children }: DialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Dialog box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg z-10 w-full max-w-lg mx-4 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-50 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
