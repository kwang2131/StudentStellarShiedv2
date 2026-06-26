export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
}: {
  actions?: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="orb-ring grid gap-5 rounded-[2rem] bg-[linear-gradient(135deg,#071121,#12305f_58%,#0059c7)] px-6 py-8 text-white shadow-[0_24px_64px_rgba(4,19,44,0.24)] md:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div>
        <p className="display-eyebrow text-xs text-white/55">
          {eyebrow}
        </p>
        <h1 className="display-title mt-3 max-w-3xl text-4xl font-semibold md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div> : null}
    </section>
  );
}
