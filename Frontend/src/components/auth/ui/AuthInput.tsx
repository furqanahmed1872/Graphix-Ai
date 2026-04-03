"use client";

import { forwardRef, useState } from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  right?: React.ReactNode;
}

const EyeOpen = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, right, type, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && show ? "text" : type;

    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-[0.72rem] uppercase tracking-[0.1em] text-[#6b7280]">
            {label}
          </label>
          {right}
        </div>

        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            {...props}
            className={`w-full bg-[#0d1014] border text-white text-[0.92rem] font-light px-4 py-3.5 outline-none placeholder-[#6b7280] transition-all duration-200 focus:shadow-[0_0_0_2px_rgba(0,212,200,0.1)] ${
              isPassword ? "pr-11" : ""
            } ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-[#1e2227] focus:border-[#00d4c8]"
            }`}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white transition-colors duration-200"
              tabIndex={-1}
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOpen /> : <EyeClosed />}
            </button>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-[0.72rem] leading-tight">{error}</p>
        )}
      </div>
    );
  },
);

AuthInput.displayName = "AuthInput";
export default AuthInput;
