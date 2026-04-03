interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const colors = ["#1e2227", "#e05252", "#f59e0b", "#60a5fa", "#00d4c8"];
const labels = ["", "Weak", "Fair", "Good", "Strong"];

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getStrength(password);

  return (
    <div className="flex flex-col gap-1.5 -mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-0.5 rounded-full transition-all duration-300"
            style={{ background: i <= strength ? colors[strength] : "#1e2227" }}
          />
        ))}
      </div>
      {password && (
        <p
          className="text-[0.7rem] transition-colors duration-200"
          style={{ color: colors[strength] }}
        >
          {labels[strength]}
        </p>
      )}
    </div>
  );
}
