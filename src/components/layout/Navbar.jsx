export default function Navbar() {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6">
      <h2 className="font-semibold">Infinity IP Dashboard</h2>

      <div className="flex items-center gap-3">
        <span className="text-slate-400">User</span>
      </div>
    </header>
  );
}