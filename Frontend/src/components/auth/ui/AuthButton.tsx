interface AuthButtonProps {
  loading: boolean;
  label: string;
  loadingLabel: string;
  fullWidth?: boolean;
}

export default function AuthButton({
  loading,
  label,
  loadingLabel,
  fullWidth = false,
}: AuthButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`bg-[#00d4c8] hover:cursor-pointer text-[#090b0e] font-syne font-bold text-[0.82rem] uppercase tracking-widest py-3.5 px-8 hover:opacity-85 transition-opacity duration-200 disabled:opacity-60 flex items-center justify-center gap-2 ${fullWidth ? "w-full" : ""}`}
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-[#090b0e] border-t-transparent rounded-full animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}
