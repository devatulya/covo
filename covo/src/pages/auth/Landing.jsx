import React from 'react';
import { BadgeCheck, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="min-h-screen bg-neoBg">
      <div className="bg-neoText px-4 py-3 text-center text-xs font-black uppercase tracking-[0.35em] text-neoBg">
        Students only | No teachers allowed
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-52px)] w-full max-w-6xl flex-col overflow-hidden px-4 py-6 md:px-8 md:py-10">
        <div className="pointer-events-none absolute left-[-30px] top-[28%] h-28 w-28 rotate-[-12deg] border-[3px] border-neoBorder bg-neoCyan shadow-neo md:h-36 md:w-36" />
        <div className="pointer-events-none absolute right-[-16px] top-[10%] h-20 w-20 rotate-[12deg] border-[3px] border-neoBorder bg-neoCyan shadow-neo md:h-24 md:w-24" />
        <div className="pointer-events-none absolute right-[10%] top-[18%] h-24 w-24 rotate-[2deg] border-[3px] border-neoBorder bg-neoSurface shadow-neo md:h-28 md:w-28" />

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center text-center md:max-w-2xl">
          <div className="mx-auto mb-6 flex h-24 w-24 rotate-[-3deg] items-center justify-center border-[3px] border-neoBorder bg-neoSurface shadow-neo">
            <span className="text-5xl font-black">Z</span>
          </div>

          <h1 className="text-5xl font-black uppercase leading-none tracking-tight sm:text-6xl md:text-7xl">
            Join the
          </h1>
          <div className="mt-2 inline-flex self-center rotate-[-1deg] border-[3px] border-neoBorder bg-neoYellow px-4 py-1 shadow-neo md:px-6 md:py-2">
            <span className="text-5xl font-black uppercase leading-none tracking-tight sm:text-6xl md:text-7xl">Chaos</span>
          </div>

          <div className="mx-auto mt-8 max-w-xl rotate-[1deg] border-[3px] border-neoBorder bg-neoSurface px-5 py-4 shadow-neo md:px-8 md:py-5">
            <p className="text-2xl font-semibold leading-tight">The rawest social network for campus life!</p>
          </div>

          <div className="mt-12 flex flex-col gap-5">
            <Link
              to="/signup?method=email"
              className="flex w-full items-center justify-center gap-4 border-[3px] border-neoBorder bg-neoYellow px-5 py-5 text-left shadow-neo"
            >
              <GraduationCap className="h-6 w-6 shrink-0 stroke-[3px]" />
              <span className="flex flex-col">
                <span className="text-xl font-black uppercase leading-none">Use college email</span>
                <span className="mt-2 text-sm font-black uppercase">(all colleges)</span>
              </span>
            </Link>

            <Link
              to="/signup?method=id"
              className="flex w-full items-center justify-center gap-4 border-[3px] border-neoBorder bg-neoCyan px-5 py-5 text-left shadow-neo"
            >
              <BadgeCheck className="h-6 w-6 shrink-0 stroke-[3px]" />
              <span className="flex flex-col">
                <span className="text-xl font-black uppercase leading-none">Use college ID-card</span>
                <span className="mt-2 text-sm font-black uppercase">(verified campus flow)</span>
              </span>
            </Link>
          </div>

          <div className="mt-10">
            <p className="text-base font-black uppercase tracking-wide">
              Already have an account?{' '}
              <Link to="/login" className="underline">
                Log in
              </Link>
            </p>
          </div>

          <div className="mt-10 border-t-[3px] border-dashed border-neoBorder pt-6">
            <p className="text-sm font-semibold text-neoMuted">
              By jumping into the chaos, you agree to our Terms &amp; Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
