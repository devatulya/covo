import React from 'react';
import { ArrowLeft, LogOut, Mail, MapPin, Moon, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

export function Settings() {
  const { user, logout, toggleNotifications } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout,
    toggleNotifications: state.toggleNotifications,
  }));
  const { theme, toggleTheme, openNotifications } = useUiStore((state) => ({
    theme: state.theme,
    toggleTheme: state.toggleTheme,
    openNotifications: state.openNotifications,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-neoBg">
      <div className="surface-panel sticky top-0 z-30 border-b-[3px] border-neoBorder px-4 py-4">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
          <Link
            to={`/profile/${user?.id ?? 'me'}`}
            className="flex h-10 w-10 items-center justify-center border-[3px] border-neoBorder bg-neoSurface shadow-neo-sm"
          >
            <ArrowLeft className="h-5 w-5 stroke-[3px]" />
          </Link>

          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">Control room</p>
            <h1 className="text-lg font-black uppercase tracking-tight">Settings</h1>
          </div>

          <div className="w-10" />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 md:p-8">
        <section className="grid gap-8 md:grid-cols-[1.2fr,0.8fr]">
          <div className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo">
            <h2 className="mb-4 border-b-[3px] border-neoBorder pb-3 text-lg font-black uppercase">App preferences</h2>

            <div className="space-y-4">
              <SettingsRow
                title="Dark mode"
                description="Turn on the darker theme while keeping the same bold campus poster style."
                action={<ToggleSwitch checked={theme === 'dark'} onChange={toggleTheme} aria-label="Toggle dark mode" />}
                icon={<Moon className="h-5 w-5 stroke-[3px]" />}
              />

              <SettingsRow
                title="Notifications"
                description="Enable alerts and jump straight into the modal whenever you need a clean overview."
                action={
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
                icon={<Mail className="h-5 w-5 stroke-[3px]" />}
              />
            </div>
          </div>

          <div className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo">
            <h2 className="mb-4 border-b-[3px] border-neoBorder pb-3 text-lg font-black uppercase">Quick links</h2>

            <div className="space-y-4">
              <LinkCard to={`/profile/${user?.id ?? 'me'}`} label="Edit profile" />
              <LinkCard to="/explore" label="Find communities" />
              <LinkCard to="/create" label="Start a draft" />
            </div>
          </div>
        </section>

        <section className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo">
          <h2 className="mb-4 border-b-[3px] border-neoBorder pb-3 text-lg font-black uppercase">Contact us</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <ContactCard
              icon={<Mail className="h-5 w-5 stroke-[3px]" />}
              accent="bg-neoCyan"
              title="Email support"
              copy="Got a bug, feature request, or a spicy idea? Drop us a line."
              action="support@covo.app"
            />
            <ContactCard
              icon={<Phone className="h-5 w-5 stroke-[3px]" />}
              accent="bg-neoYellow"
              title="Phone line"
              copy="Weekdays, 9am to 5pm. Real people. Real campus fixes."
              action="+1 555 010 2026"
            />
            <ContactCard
              icon={<MapPin className="h-5 w-5 stroke-[3px]" />}
              accent="bg-neoPink"
              title="HQ"
              copy="123 University Ave, Tech District. The walls are covered in sticky notes."
              action="Find us"
            />
          </div>
        </section>

        <button
          type="button"
          onClick={logout}
          className="surface-panel flex w-full items-center justify-center gap-3 border-[3px] border-neoBorder py-4 text-sm font-black uppercase shadow-neo"
        >
          <LogOut className="h-5 w-5 stroke-[3px] text-red-500" />
          Log out
        </button>
      </div>
    </div>
  );
}

function SettingsRow({ title, description, action, icon }) {
  return (
    <div className="surface-panel flex flex-col gap-4 border-[3px] border-neoBorder p-4 shadow-neo-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center border-[3px] border-neoBorder bg-neoSurfaceMuted">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-black uppercase">{title}</h3>
          <p className="mt-1 max-w-md text-sm font-semibold leading-relaxed text-neoMuted">{description}</p>
        </div>
      </div>

      <div className="shrink-0">{action}</div>
    </div>
  );
}

function LinkCard({ to, label }) {
  return (
    <Link
      to={to}
      className="surface-panel flex items-center justify-between border-[3px] border-neoBorder px-4 py-4 text-sm font-black uppercase shadow-neo-sm hover:bg-neoSurfaceMuted"
    >
      <span>{label}</span>
      <span aria-hidden="true">+</span>
    </Link>
  );
}

function ContactCard({ icon, accent, title, copy, action }) {
  return (
    <article className="surface-panel border-[3px] border-neoBorder p-4 shadow-neo-sm">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center border-[3px] border-neoBorder ${accent}`}>
        {icon}
      </div>
      <h3 className="text-base font-black uppercase">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-neoMuted">{copy}</p>
      <div className="mt-4 inline-flex border-[3px] border-neoBorder bg-neoYellow px-3 py-2 text-[10px] font-black uppercase shadow-neo-sm">
        {action}
      </div>
    </article>
  );
}
