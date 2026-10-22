export default function BotBlocked() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1528] px-6 text-center">
      <div className="max-w-md">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C69259]">
          Access restricted
        </p>
        <h1 className="mt-3 text-2xl font-bold text-white">
          Automated traffic is not allowed
        </h1>
        <p className="mt-3 text-sm text-[#94A3B8]">
          Our systems detected bot-like behavior from this browser or network.
          If you believe this is a mistake, contact First Step Wealth Group
          support from a normal browser session.
        </p>
      </div>
    </div>
  );
}
