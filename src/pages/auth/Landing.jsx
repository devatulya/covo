import React from 'react';
import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-neoBg md:flex-row relative overflow-hidden">
      
      {/* Mobile Top Bar / Desktop Side Bar */}
      <div className="bg-neoText text-white text-[9px] md:text-xs font-black tracking-widest uppercase md:w-16 md:h-screen flex items-center justify-center p-2 text-center md:writing-vertical-rl md:transform md:rotate-180 z-10 w-full py-2">
        <span className="md:rotate-90 whitespace-nowrap">STUDENTS ONLY • NO TEACHERS ALLOWED</span>
      </div>

      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto h-full min-h-screen overflow-hidden">
        
        {/* Left Art Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative">
          {/* Decorative blocks */}
          <div className="absolute top-[20%] left-[10%] w-16 h-16 bg-neoCyan border-[3px] border-neoBorder -rotate-12 shadow-neo z-0 hidden md:block"></div>
          <div className="absolute bottom-[20%] right-[10%] w-12 h-12 bg-neoPink border-[3px] border-neoBorder rotate-12 shadow-neo z-0 hidden md:block"></div>
          
          {/* Title */}
          <div className="flex flex-col items-center md:items-start rotate-[-2deg] mb-8 md:rotate-0 z-10">
            <div className="border-[3px] border-neoBorder bg-white p-2 shadow-neo mb-4 hidden md:block w-min">
              <span className="text-4xl font-black">⚡</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black uppercase text-center md:text-left leading-none md:tracking-tighter">
              JOIN THE
            </h1>
            <div className="inline-block">
               <h1 className="text-4xl md:text-7xl font-black uppercase text-center bg-neoYellow border-[3px] border-neoBorder px-4 py-1 md:py-2 md:px-6 shadow-neo mt-1 rotate-2 md:rotate-[-2deg] inline-block">
                 CHAOS
               </h1>
            </div>
          </div>

          <div className="bg-white border-[3px] border-neoBorder px-4 py-3 shadow-neo text-center md:text-left rotate-1 md:rotate-2 mb-8 md:mb-0 w-full max-w-[300px] md:max-w-md z-10">
            <p className="text-sm md:text-xl font-bold leading-tight uppercase">
              The rawest social network for campus life!
            </p>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10 md:bg-white md:border-l-[3px] md:border-neoBorder">
          
          <div className="absolute top-[10%] left-[-20px] w-12 h-12 bg-neoCyan border-[3px] border-neoBorder rotate-[-15deg] shadow-neo z-0 md:hidden"></div>

          <div className="w-full space-y-4 max-w-[350px] relative z-10">
            
            <Link to="/signup" className="w-full relative block">
              <button className="w-full bg-neoYellow border-[3px] border-neoBorder py-4 md:py-6 shadow-neo active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex flex-col items-center justify-center group hover:bg-[#ffe000]">
                <span className="font-black text-sm md:text-lg uppercase">🎓 USE COLLEGE EMAIL</span>
                <span className="text-[9px] md:text-xs font-bold">(ALL COLLEGES)</span>
              </button>
            </Link>

            <button className="w-full bg-neoCyan border-[3px] border-neoBorder py-4 md:py-6 shadow-neo active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex flex-col items-center justify-center hover:bg-[#00e5cc]">
              <span className="font-black text-sm md:text-lg uppercase">🪪 USE COLLEGE ID-CARD</span>
              <span className="text-[9px] md:text-xs font-bold">(NIT ONLY)</span>
            </button>

            <div className="mt-8 text-center pt-8 border-t-[3px] border-dashed border-slate-300 w-full">
              <Link to="/login" className="inline-block bg-neoText text-white px-6 py-3 font-black text-xs md:text-sm uppercase shadow-neo hover:-translate-y-1 transition-transform">
                ALREADY HAVE AN ACCOUNT? LOG IN
              </Link>
              <p className="text-[9px] text-slate-500 font-bold mt-6 px-4 md:hidden">
                By jumping into the chaos, you agree to our <br/>Terms & Privacy Policy.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
