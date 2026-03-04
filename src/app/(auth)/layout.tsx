import { Moon } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center mb-4">
          <Moon size={28} className="text-white" fill="white" strokeWidth={0} />
        </div>
        <span className="text-2xl font-semibold tracking-tight">
          Baby<span className="text-accent-glow">Lull</span>
          <span className="text-muted text-base font-normal">.ai</span>
        </span>
      </div>
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
