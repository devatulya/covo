import React from 'react';
import { ArrowLeft, LogOut, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Settings() {
  const { logout } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen bg-neoBg pb-20 md:pb-0">
      <div className="bg-white border-b-[3px] border-neoBorder px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="md:hidden">
            <Link to="/profile/me" className="w-8 h-8 flex items-center justify-center border-[3px] border-neoBorder bg-white shadow-neo-sm text-neoText active:translate-y-0.5 active:translate-x-0.5 active:shadow-none hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 stroke-[3px]" />
            </Link>
        </div>
        <div className="hidden md:block w-8"></div>
        <h1 className="text-lg font-black tracking-tighter uppercase mr-0 md:mr-0 text-center flex-1">SETTINGS</h1>
        <div className="w-8"></div>
      </div>

      <div className="p-4 md:p-8 space-y-10 max-w-3xl mx-auto w-full">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-8">
                <section>
                    <h2 className="font-black text-sm md:text-lg uppercase mb-3 border-b-2 border-slate-300 pb-2">ACCOUNT</h2>
                    <div className="space-y-4">
                        <SettingsButton label="EDIT PROFILE" icon={<span className="font-bold text-sm">👤</span>} arrow />
                        <SettingsButton label="CHANGE PASSWORD" icon={<span className="font-bold text-sm">🔒</span>} arrow />
                    </div>
                </section>

                <section>
                    <h2 className="font-black text-sm md:text-lg uppercase mb-3 border-b-2 border-slate-300 pb-2">PRIVACY</h2>
                    <div className="space-y-4">
                        <SettingsButton label="BLOCKED USERS" icon={<span className="font-bold text-sm">🚫</span>} arrow />
                        <SettingsButton label="PRIVACY POLICY" icon={<span className="font-bold text-sm">🛡️</span>} external />
                    </div>
                </section>
            </div>

            <section>
                <h2 className="font-black text-sm md:text-lg uppercase mb-3 border-b-2 border-slate-300 pb-2">CONTACT US</h2>
                <div className="space-y-4">
                    <ContactCard 
                        color="bg-neoCyan" 
                        icon={<Mail />} 
                        title="EMAIL SUPPORT" 
                        desc="Got a bug? Feature request? Or just want to say hi? Drop us a line anytime."
                        btnText="SEND EMAIL"
                    />
                    <ContactCard 
                        color="bg-neoYellow" 
                        icon={<Phone />} 
                        title="PHONE" 
                        desc="Mon-Fri, 9am - 5pm EST. We're here to help you navigate campus life."
                        btnText="CALL US"
                    />
                    <ContactCard 
                        color="bg-neoPink text-white" 
                        icon={<MapPin />} 
                        title="HQ ADDRESS" 
                        desc="123 University Ave, Suite 404\nTech District, NY 10012"
                        btnText="GET DIRECTIONS"
                    />
                </div>
            </section>
        </div>

        <button 
          onClick={logout}
          className="w-full bg-white border-[3px] border-neoBorder p-4 flex items-center justify-center gap-2 font-black shadow-neo hover:bg-slate-50 transition-all uppercase"
        >
          <LogOut className="w-5 h-5 stroke-[3px] text-red-500" /> LOG OUT
        </button>

        <div className="text-center font-bold text-[10px] text-slate-400 py-4 uppercase">
          Version 2.4.0 (Build 884)
        </div>

      </div>
    </div>
  );
}

function SettingsButton({ label, icon, arrow, external }) {
  return (
    <button className="w-full bg-white border-[3px] border-neoBorder py-3 px-4 flex items-center justify-between shadow-neo-sm hover:-translate-y-1 transition-transform">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-bold text-xs md:text-sm uppercase tracking-wide">{label}</span>
      </div>
      {(arrow || external) && (
        <span className="font-bold text-lg leading-none">{arrow ? '›' : '↗'}</span>
      )}
    </button>
  );
}

function ContactCard({ color, icon, title, desc, btnText }) {
  return (
    <div className="bg-white border-[3px] border-neoBorder p-4 shadow-neo flex flex-col gap-3 group">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border-[3px] border-neoBorder ${color} group-hover:rotate-12 transition-transform`}>
          {React.cloneElement(icon, { className: "w-4 h-4 md:w-5 md:h-5 stroke-[3px] " + (color.includes('text-white') ? 'text-white' : 'text-neoText') })}
        </div>
        <h3 className="font-black text-sm md:text-base uppercase tracking-tighter">{title}</h3>
      </div>
      <p className="text-[11px] md:text-xs font-bold text-slate-500 leading-relaxed whitespace-pre-line">{desc}</p>
      <button className="self-start mt-2 border-[3px] border-neoBorder px-4 py-1.5 font-bold text-[10px] uppercase hover:bg-neoText hover:text-white transition-colors shadow-neo-sm">
        {btnText}
      </button>
    </div>
  );
}
