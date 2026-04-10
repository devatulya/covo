import React from 'react';
import { ArrowLeft, Bell, Moon, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

const clubAccentMap = ['bg-neoYellow', 'bg-neoCyan', 'bg-neoPink', 'bg-neoSurface'];

export function Profile() {
  const { user, toggleNotifications } = useAuthStore((state) => ({
    user: state.user,
    toggleNotifications: state.toggleNotifications,
  }));
  const { theme, toggleTheme, openNotifications } = useUiStore((state) => ({
    theme: state.theme,
    toggleTheme: state.toggleTheme,
    openNotifications: state.openNotifications,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-neoBg pb-20 md:pb-0">
      <div className="surface-panel sticky top-0 z-30 border-b-[3px] border-neoBorder px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center border-[3px] border-neoBorder bg-neoSurface shadow-neo-sm hover:bg-neoSurfaceMuted md:hidden"
          >
            <ArrowLeft className="h-5 w-5 stroke-[3px]" />
          </Link>

          <div className="hidden md:block w-10" />

          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">Profile</p>
            <h1 className="text-lg font-black uppercase tracking-tight">Your page</h1>
          </div>

          <Link
            to="/settings"
            className="flex h-10 w-10 items-center justify-center border-[3px] border-neoBorder bg-neoYellow shadow-neo-sm"
          >
            <SettingsIcon className="h-5 w-5 stroke-[3px]" />
          </Link>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 md:p-8">
        <section className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo md:p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative w-max">
              <div className="h-28 w-28 overflow-hidden border-[3px] border-neoBorder bg-neoYellow shadow-neo md:h-36 md:w-36">
                {user?.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" /> : null}
              </div>
              <div className="absolute -bottom-3 -right-3 border-[3px] border-neoBorder bg-neoCyan px-3 py-1 text-[10px] font-black uppercase shadow-neo-sm">
                Online
              </div>
            </div>

            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">{user?.major}</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-none md:text-5xl">{user?.name}</h2>
              <p className="mt-2 text-sm font-bold text-neoMuted">@{user?.username}</p>

              <div className="mt-5 max-w-2xl border-[3px] border-dashed border-neoBorder bg-neoSurface p-4 shadow-neo-sm">
                <p className="text-sm font-bold leading-relaxed">{user?.bio}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <StatBox label="Connects" value="342" />
          <StatBox label="Posts" value="87" />
          <StatBox label="Year" value={user?.year ?? "'26"} />
        </section>

        <section className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo">
          <div className="mb-4 flex items-center justify-between border-b-[3px] border-neoBorder pb-3">
            <h3 className="text-lg font-black uppercase">Joined clubs</h3>
            <Link
              to="/explore"
              className="border-[3px] border-neoBorder bg-neoYellow px-3 py-2 text-[10px] font-black uppercase shadow-neo-sm"
            >
              Explore more
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {user?.communities?.map((community, index) => (
              <article
                key={community}
                className={`${clubAccentMap[index % clubAccentMap.length]} border-[3px] border-neoBorder p-4 shadow-neo-sm`}
              >
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">Scene</p>
                <h4 className="text-lg font-black uppercase leading-tight">{community}</h4>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo">
          <div className="mb-4 border-b-[3px] border-neoBorder pb-3">
            <h3 className="text-lg font-black uppercase">Preferences</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <PreferenceCard
              icon={<Moon className="h-5 w-5 stroke-[3px]" />}
              label="Dark mode"
              description="Shift the whole app into neon-after-dark mode without losing the graphic style."
              toggle={
                <ToggleSwitch checked={theme === 'dark'} onChange={toggleTheme} aria-label="Toggle dark mode" />
              }
            />

            <PreferenceCard
              icon={<Bell className="h-5 w-5 stroke-[3px]" />}
              label="Notifications"
              description="Control alerts here, then open the modal to review what campus has been shouting about."
              toggle={
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={openNotifications}
                    className="border-[3px] border-neoBorder bg-neoYellow px-3 py-2 text-[10px] font-black uppercase shadow-neo-sm"
                  >
                    Open
                  </button>
                  <ToggleSwitch
                    checked={Boolean(user?.notificationsEnabled)}
                    onChange={toggleNotifications}
                    aria-label="Toggle notifications"
                  />
                </div>
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="surface-panel border-[3px] border-neoBorder p-4 text-center shadow-neo hover:-translate-y-1">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">{label}</p>
      <p className="mt-2 text-3xl font-black uppercase">{value}</p>
    </div>
  );
}

function PreferenceCard({ icon, label, description, toggle }) {
  return (
    <article className="surface-panel flex flex-col gap-4 border-[3px] border-neoBorder p-4 shadow-neo-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center border-[3px] border-neoBorder bg-neoCyan">
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-black uppercase">{label}</h4>
            <p className="mt-1 max-w-xs text-xs font-semibold leading-relaxed text-neoMuted">{description}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end">{toggle}</div>
    </article>
  );
}
