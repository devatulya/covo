import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';

export function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    login({
      id: 'user_1',
      username: 'devatulya',
      name: 'Alex Rivera',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=devatulya'
    });
    navigate('/');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neoBg">
      
      <div className="bg-neoText text-white text-[9px] md:text-sm font-black tracking-widest uppercase md:w-20 md:h-screen flex items-center justify-center p-2 text-center md:writing-vertical-rl md:transform md:rotate-180 z-10 w-full py-4 leading-relaxed">
        <span className="md:rotate-90 whitespace-nowrap">STUDENTS ONLY • NO TEACHERS ALLOWED</span>
      </div>

      <div className="flex-1 flex justify-center items-center p-4">
        <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white border-[3px] border-neoBorder shadow-neo overflow-hidden">
          
          <div className="p-8 md:p-16 flex-1 bg-neoYellow border-b-[3px] md:border-b-0 md:border-r-[3px] border-neoBorder flex flex-col justify-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter">
              WELCOME<br/>BACK
            </h1>
            <div className="w-16 h-2 md:h-4 bg-neoPurple border-[3px] border-neoBorder mt-4 md:mt-8 shadow-neo-sm"></div>
            <p className="mt-6 font-bold text-sm md:text-lg uppercase max-w-xs">Enter your details to get back to the chaos.</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 md:p-16 space-y-6 flex-1 flex flex-col justify-center relative">
            <div className="absolute top-4 right-4 w-8 h-8 bg-neoCyan border-[3px] border-neoBorder rotate-45"></div>

            <div className="space-y-1">
              <label className="text-[10px] md:text-xs font-black uppercase tracking-wider bg-white px-1">USERNAME</label>
              <Input type="text" placeholder="TYPE HERE..." className="h-14 font-black text-sm uppercase" required />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] md:text-xs font-black uppercase tracking-wider bg-white px-1">PASSWORD</label>
              <Input type="password" placeholder="••••••••" className="h-14" required />
            </div>

            <button 
              type="submit"
              className="w-full bg-neoPurple text-white font-black uppercase text-lg py-4 border-[3px] border-neoBorder shadow-neo active:translate-x-1 active:translate-y-1 active:shadow-none transition-all mt-4 hover:bg-[#5815ff]"
            >
              LOG IN ➔
            </button>

            <div className="text-center md:text-left mt-6 flex flex-col md:flex-row md:justify-between items-center gap-4">
              <span className="text-[10px] md:text-xs font-black underline uppercase cursor-pointer hover:text-neoPurple">
                FORGOT PASSWORD?
              </span>
              <span className="text-xs font-black uppercase border-[3px] border-neoText px-4 py-2 shadow-neo-sm hover:-translate-y-0.5 transition-transform">
                NEW HERE? <Link to="/signup" className="underline text-neoPurple">SIGN UP</Link>
              </span>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
