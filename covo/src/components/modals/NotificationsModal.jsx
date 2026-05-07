import React from 'react';
import { BellRing } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useUiStore } from '../../store/uiStore';

export function NotificationsModal() {
  const {
    isNotificationsOpen,
    closeNotifications,
    notifications,
    markAllNotificationsRead,
  } = useUiStore((state) => ({
    isNotificationsOpen: state.isNotificationsOpen,
    closeNotifications: state.closeNotifications,
    notifications: state.notifications,
    markAllNotificationsRead: state.markAllNotificationsRead,
  }));

  return (
    <Modal
      open={isNotificationsOpen}
      onClose={closeNotifications}
      title="Notifications"
      subtitle="Campus pulse"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="max-w-md text-sm font-bold leading-relaxed text-neoMuted">
          Catch up on club updates, replies, and all the campus noise without losing the vibe.
        </p>
        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="shrink-0 border-[3px] border-neoBorder bg-neoYellow px-4 py-2 text-[10px] font-black uppercase shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          Mark all read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className="surface-panel flex items-start gap-4 border-[3px] border-neoBorder p-4 shadow-neo-sm"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center border-[3px] border-neoBorder ${notification.accent}`}
            >
              <BellRing className="h-5 w-5 stroke-[3px] text-neoText" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black uppercase tracking-wide">{notification.title}</h3>
                <span className="text-[10px] font-black uppercase text-neoMuted">{notification.time}</span>
              </div>
              <p className="text-sm font-semibold leading-relaxed text-neoMuted">{notification.body}</p>
            </div>

            {!notification.read ? (
              <span className="mt-1 h-3 w-3 shrink-0 border-2 border-neoBorder bg-neoPink" />
            ) : null}
          </article>
        ))}
      </div>
    </Modal>
  );
}
