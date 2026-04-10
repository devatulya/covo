import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';

export function Signup() {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    login({
      id: 'user_new',
      username: 'new_user',
      name: 'New User',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=new'
    });
    navigate('/');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neoBg relative overflow-hidden">
      
      <div className="bg-neoText text-white text-[10px] md:text-sm font-black tracking-widest uppercase md:w-20 md:h-screen flex items-center justify-center p-3 text-center md:writing-vertical-rl md:transform md:rotate-180 z-20 w-full">
         <span className="md:rotate-90 whitespace-nowrap">COMPLETE PROFILE SETUP</span>
      </div>

      <div className="flex-1 flex justify-center items-center p-4 z-10 w-full relative">
        {/* Background shapes desktop */}
        <div className="hidden md:block absolute top-[10%] left-[10%] w-32 h-32 bg-neoPurple border-[3px] border-neoBorder rotate-[-12deg] shadow-neo z-0"></div>
        <div className="absolute top-[20%] right-[10%] w-16 h-16 bg-neoCyan border-[3px] border-neoBorder rotate-12 shadow-neo z-0"></div>

        <form onSubmit={handleSignup} className="flex-1 w-full max-w-2xl bg-white border-[3px] border-neoBorder shadow-neo p-6 md:p-12 z-10 relative">
          
          <div className="flex items-start justify-between mb-8">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter w-[60%]">
              New <br/> Initiate
            </h1>
            <div className="w-24 h-24 md:w-32 md:h-32 bg-neoPink border-[3px] border-neoBorder shadow-neo flex flex-col items-center justify-center cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all Group hover:bg-[#ff1aff]">
              <span className="text-white text-3xl font-black mb-1">📷</span>
              <span className="text-[8px] md:text-[10px] font-black text-white uppercase text-center leading-none">ADD PHOTO</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1 text-left">
              <label className="text-[10px] md:text-xs font-black uppercase tracking-wider bg-neoCyan px-2 border-[2px] border-neoBorder ml-2 -mb-2 relative z-10 inline-block">USERNAME</label>
              <Input type="text" placeholder="Enter username" required className="relative z-0" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full relative">
              <div className="space-y-1 text-left relative z-10">
                <label className="text-[10px] md:text-xs font-black uppercase tracking-wider bg-neoCyan px-2 border-[2px] border-neoBorder ml-2 -mb-2 relative z-10 inline-block">PASSWORD</label>
                <Input type="password" placeholder="••••••••" required className="relative z-0" />
              </div>

              <div className="space-y-1 text-left relative z-10">
                <label className="text-[10px] md:text-xs font-black uppercase tracking-wider bg-neoYellow px-2 border-[2px] border-neoBorder ml-2 -mb-2 relative z-10 inline-block">VOUCH PASS</label>
                <Input type="password" placeholder="••••••••" required className="relative z-0" />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-[10px] md:text-xs font-black uppercase tracking-wider inline-block">BIO</label>
              <textarea 
                className="w-full p-4 font-bold text-sm bg-white border-[3px] border-neoBorder shadow-neo focus:outline-none focus:shadow-neo-lg resize-none h-32 md:h-40"
                placeholder="Tell us something about yourself..."
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full bg-neoYellow hover:bg-[#ffe000] text-neoText font-black uppercase text-xl md:text-2xl py-4 md:py-6 border-[3px] border-neoBorder shadow-neo active:translate-x-1 active:translate-y-1 active:shadow-none transition-all mt-4"
            >
              LFG 🚀
            </button>

             <div className="text-center mt-6">
                <Link to="/login" className="text-xs font-black underline uppercase hover:text-neoPurple">Back to Login</Link>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}
