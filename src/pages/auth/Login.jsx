import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';

export function Login() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();

    login({
      id: 'user_1',
      username: 'devatulya',
      name: 'Atulya',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=devatulya',
      major: 'Computer Science (BS)',
      communities: ['Varsity Football', 'Graphic Design', 'Chess Society'],
      notificationsEnabled: true,
    });

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-neoBg px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col overflow-hidden border-[3px] border-neoBorder bg-neoSurface shadow-neo md:flex-row">
        <div className="flex flex-1 flex-col justify-between border-b-[3px] border-neoBorder bg-neoYellow p-6 md:border-b-0 md:border-r-[3px] md:p-10">
          <div className="flex items-center justify-between">
            <Link
              to="/landing"
              className="flex h-10 w-10 items-center justify-center border-[3px] border-neoBorder bg-neoSurface shadow-neo-sm"
            >
              <ArrowLeft className="h-5 w-5 stroke-[3px]" />
            </Link>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Backstage pass</span>
          </div>

          <div className="py-12 md:py-0">
            <h1 className="text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
              Welcome
              <br />
              back
            </h1>
            <div className="mt-6 h-4 w-20 border-[3px] border-neoBorder bg-neoPink shadow-neo-sm" />
            <p className="mt-8 max-w-sm text-base font-bold uppercase leading-relaxed">
              Enter your details, slide back into your scene, and catch up on campus chaos.
            </p>
          </div>

          <p className="text-sm font-semibold text-neoMuted">Students only. Bring your strongest opinions.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-1 flex-col justify-center p-6 md:p-10">
          <div className="mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">Log in</p>
            <h2 className="mt-2 text-3xl font-black uppercase leading-none md:text-4xl">Get back to it</h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em]">Username</label>
              <Input type="text" placeholder="type here..." className="h-14 text-base font-black uppercase" required />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em]">Password</label>
              <Input type="password" placeholder="........" className="h-14 text-base font-black" required />
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 w-full border-[3px] border-neoBorder bg-neoPurple py-4 text-lg font-black uppercase text-white shadow-neo"
          >
            Log in
          </button>

          <div className="mt-8 flex flex-col gap-4 text-sm font-black uppercase md:flex-row md:items-center md:justify-between">
            <span className="underline text-neoMuted">Forgot password?</span>
            <span>
              New here?{' '}
              <Link to="/signup" className="underline">
                Sign up
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
