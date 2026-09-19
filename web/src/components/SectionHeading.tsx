interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="flex flex-col items-center text-center mb-8 md:mb-12">
      <h2 className="text-3xl md:text-4xl font-black text-[#111111] uppercase tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-stone-500 text-sm md:text-base font-medium mt-2 max-w-md">
          {subtitle}
        </p>
      )}
      <svg width="60" height="12" viewBox="0 0 40 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-4">
        <path d="M0 6C3 6 5 2 10 2C15 2 15 10 20 10C25 10 25 2 30 2C35 2 37 6 40 6" stroke="#FFB800" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
}
