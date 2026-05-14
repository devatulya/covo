import React from 'react';
import { ArrowLeft, Bell, Camera, Loader2, Moon, Settings as SettingsIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PostCard } from '../components/feed/PostCard';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { compressImage, uploadToImageKit } from '../utils/imageKit';
import { apiFetch } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

const clubAccentMap = ['bg-neoYellow', 'bg-neoCyan', 'bg-neoPink', 'bg-neoSurface'];

export function Profile() {
  const { id } = useParams();
  const { user, updateProfile } = useAuthStore((state) => ({
    user: state.user,
    updateProfile: state.updateProfile,
  }));
  const { theme, toggleTheme, openNotifications } = useUiStore((state) => ({
    theme: state.theme,
    toggleTheme: state.toggleTheme,
    openNotifications: state.openNotifications,
  }));

  const currentUserId = user?.uid || user?.id || user?.userId;
  const profileId = id === 'me' || !id ? currentUserId : id;
  const isOwnProfile = Boolean(currentUserId && profileId === currentUserId);

  const [profile, setProfile] = React.useState(null);
  const [profilePosts, setProfilePosts] = React.useState([]);
  const [connectProfiles, setConnectProfiles] = React.useState([]);
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [profileError, setProfileError] = React.useState('');
  const [activePanel, setActivePanel] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const displayProfile = profile || (isOwnProfile ? user : null);

  React.useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!profileId) {
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);
      setProfileError('');

      try {
        const [profileResult, postsResult] = await Promise.all([
          isOwnProfile ? Promise.resolve({ user }) : apiFetch(`/users/${profileId}`),
          apiFetch(`/users/${profileId}/posts?${new URLSearchParams({ viewerId: currentUserId || '' }).toString()}`),
        ]);

        if (cancelled) return;

        const nextProfile = {
          uid: profileId,
          id: profileId,
          ...(profileResult.user || {}),
        };
        const posts = postsResult.posts || [];
        const connects = await fetchConnectProfiles(nextProfile);

        if (cancelled) return;

        setProfile(nextProfile);
        setProfilePosts(posts);
        setConnectProfiles(connects);
      } catch (err) {
        console.error('Error loading profile:', err);
        if (!cancelled) {
          setProfile(null);
          setProfilePosts([]);
          setConnectProfiles([]);
          setProfileError('Unable to load profile data.');
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [currentUserId, isOwnProfile, profileId, user]);

  const sortedPosts = React.useMemo(() => {
    return [...profilePosts].sort((a, b) => getPostTime(b) - getPostTime(a));
  }, [profilePosts]);

  const mostLikedPosts = React.useMemo(() => {
    return [...profilePosts]
      .filter((post) => Number(post.likesCount || 0) > 0)
      .sort((a, b) => Number(b.likesCount || 0) - Number(a.likesCount || 0));
  }, [profilePosts]);

  const stats = React.useMemo(() => {
    const postCount = profilePosts.length;
    const likes = profilePosts.reduce((total, post) => total + Number(post.likesCount || 0), 0);
    const connects = getConnectsCount(displayProfile, connectProfiles);
    return { connects, postCount, likes };
  }, [connectProfiles, displayProfile, profilePosts]);

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !user || !isOwnProfile) return;

    setUploading(true);
    try {
      const compressedBlob = await compressImage(file, 400, 0.7);
      const imageUrl = await uploadToImageKit(compressedBlob, `avatar_${currentUserId}_${Date.now()}`);
      await updateProfile({ avatar: imageUrl, profilePic: imageUrl });
      setProfile((current) => (current ? { ...current, avatar: imageUrl, profilePic: imageUrl } : current));
    } catch (err) {
      console.error('Error updating avatar:', err);
      alert('Failed to update avatar. Check ImageKit config.');
    } finally {
      setUploading(false);
    }
  };

  const handleNotificationsChange = async (nextValue) => {
    if (!isOwnProfile) return;

    try {
      await updateProfile({ notificationsEnabled: nextValue });
      setProfile((current) => (current ? { ...current, notificationsEnabled: nextValue } : current));
    } catch (err) {
      console.error('Error updating notifications:', err);
      alert('Failed to update notifications. Please try again.');
    }
  };

  const avatarUrl = displayProfile?.avatar || displayProfile?.profilePic || '';
  const displayName = displayProfile?.name || displayProfile?.username || 'COVO Student';
  const username = displayProfile?.username ? `@${displayProfile.username}` : displayProfile?.email || 'No username yet';
  const headline = [displayProfile?.major, displayProfile?.year, displayProfile?.college].filter(Boolean).join(' / ');
  const bio = displayProfile?.bio || 'No bio added yet.';
  const communities = Array.isArray(displayProfile?.communities)
    ? displayProfile.communities
    : Array.isArray(displayProfile?.tribes)
      ? displayProfile.tribes
      : [];
  const joinedLabel = formatDate(displayProfile?.createdAt);
  const statusLabel = getProfileStatus(displayProfile);

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

          <div className="hidden w-10 md:block" />

          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">Profile</p>
            <h1 className="text-lg font-black uppercase tracking-tight">{isOwnProfile ? 'Your page' : 'Student page'}</h1>
          </div>

          {isOwnProfile ? (
            <Link
              to="/settings"
              className="flex h-10 w-10 items-center justify-center border-[3px] border-neoBorder bg-neoYellow shadow-neo-sm"
            >
              <SettingsIcon className="h-5 w-5 stroke-[3px]" />
            </Link>
          ) : (
            <div className="hidden w-10 md:block" />
          )}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 md:p-8">
        {loadingProfile ? (
          <section className="surface-panel flex min-h-64 items-center justify-center border-[3px] border-neoBorder p-5 shadow-neo">
            <Loader2 className="h-8 w-8 animate-spin stroke-[3px]" />
          </section>
        ) : profileError ? (
          <section className="surface-panel border-[3px] border-neoBorder p-5 text-center shadow-neo">
            <p className="text-sm font-black uppercase text-neoMuted">{profileError}</p>
          </section>
        ) : displayProfile ? (
          <>
            <section className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo md:p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="relative w-max">
                  <div className="group relative h-28 w-28 overflow-hidden border-[3px] border-neoBorder bg-neoYellow shadow-neo md:h-36 md:w-36">
                    {avatarUrl ? (
                      <img src={getOptimizedImageUrl(avatarUrl)} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neoSurfaceMuted text-2xl font-black">
                        {displayName.charAt(0)}
                      </div>
                    )}

                    {isOwnProfile ? (
                      <>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
                        >
                          {uploading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                          ) : (
                            <Camera className="h-8 w-8 text-white" />
                          )}
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleAvatarChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </>
                    ) : null}
                  </div>
                  <div className="absolute -bottom-3 -right-3 border-[3px] border-neoBorder bg-neoCyan px-3 py-1 text-[10px] font-black uppercase shadow-neo-sm">
                    {statusLabel}
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">{headline || 'Student profile'}</p>
                  <h2 className="mt-2 text-3xl font-black uppercase leading-none md:text-5xl">{displayName}</h2>
                  <p className="mt-2 text-sm font-bold text-neoMuted">{username}</p>

                  <div className="mt-5 max-w-2xl border-[3px] border-dashed border-neoBorder bg-neoSurface p-4 shadow-neo-sm">
                    <p className="text-sm font-bold leading-relaxed">{bio}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <StatBox
                label="Connects"
                value={stats.connects}
                action={isOwnProfile ? 'View my connects' : 'View connects'}
                active={activePanel === 'connects'}
                onClick={() => setActivePanel((current) => (current === 'connects' ? null : 'connects'))}
              />
              <StatBox
                label="Posts"
                value={stats.postCount}
                action={isOwnProfile ? 'View my posts' : 'View posts'}
                active={activePanel === 'posts'}
                onClick={() => setActivePanel((current) => (current === 'posts' ? null : 'posts'))}
              />
              <StatBox
                label="Likes"
                value={stats.likes}
                action="Most liked"
                active={activePanel === 'liked'}
                onClick={() => setActivePanel((current) => (current === 'liked' ? null : 'liked'))}
              />
            </section>

            {activePanel ? (
              <section className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo">
                <ProfilePanel
                  activePanel={activePanel}
                  connects={connectProfiles}
                  posts={sortedPosts}
                  likedPosts={mostLikedPosts}
                  isOwnProfile={isOwnProfile}
                />
              </section>
            ) : null}

            <section className="grid gap-4 md:grid-cols-3">
              <InfoBox label="College" value={displayProfile?.college || 'Not added'} />
              <InfoBox label="Joined" value={joinedLabel || 'Not available'} />
              <InfoBox label="Status" value={statusLabel} />
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
                {communities.map((community, index) => (
                  <article
                    key={community}
                    className={`${clubAccentMap[index % clubAccentMap.length]} border-[3px] border-neoBorder p-4 shadow-neo-sm`}
                  >
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">Scene</p>
                    <h4 className="text-lg font-black uppercase leading-tight">{community}</h4>
                  </article>
                ))}
                {communities.length === 0 ? (
                  <p className="text-sm font-black uppercase text-neoMuted">No joined clubs yet.</p>
                ) : null}
              </div>
            </section>

            {isOwnProfile ? (
              <section className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo">
                <div className="mb-4 border-b-[3px] border-neoBorder pb-3">
                  <h3 className="text-lg font-black uppercase">Preferences</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <PreferenceCard
                    icon={<Moon className="h-5 w-5 stroke-[3px]" />}
                    label="Dark mode"
                    description="Shift the whole app into neon-after-dark mode without losing the graphic style."
                    toggle={<ToggleSwitch checked={theme === 'dark'} onChange={toggleTheme} aria-label="Toggle dark mode" />}
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
                          checked={displayProfile?.notificationsEnabled !== false}
                          onChange={handleNotificationsChange}
                          aria-label="Toggle notifications"
                        />
                      </div>
                    }
                  />
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

function StatBox({ label, value, action, active, onClick }) {
  return (
    <div className={`surface-panel border-[3px] border-neoBorder p-4 text-center shadow-neo ${active ? 'bg-neoCyan' : ''}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">{label}</p>
      <p className="mt-2 text-3xl font-black uppercase">{value}</p>
      <button
        type="button"
        onClick={onClick}
        className={`mt-4 w-full border-[3px] border-neoBorder px-3 py-2 text-[10px] font-black uppercase shadow-neo-sm ${
          active ? 'bg-neoText text-neoBg' : 'bg-neoYellow text-neoText hover:bg-neoSurfaceMuted'
        }`}
      >
        {action}
      </button>
    </div>
  );
}

function ProfilePanel({ activePanel, connects, posts, likedPosts, isOwnProfile }) {
  if (activePanel === 'connects') {
    return (
      <>
        <PanelHeader title={isOwnProfile ? 'My connects' : 'Connects'} count={connects.length} />
        {connects.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {connects.map((connect) => (
              <Link
                key={connect.uid || connect.id || connect.username}
                to={`/profile/${connect.uid || connect.id}`}
                className="surface-panel flex items-center gap-3 border-[3px] border-neoBorder p-3 shadow-neo-sm hover:bg-neoSurfaceMuted"
              >
                <div className="h-12 w-12 overflow-hidden border-[3px] border-neoBorder bg-neoYellow">
                  {connect.avatar || connect.profilePic ? (
                    <img
                      src={getOptimizedImageUrl(connect.avatar || connect.profilePic)}
                      alt={connect.name || connect.username || 'Connect'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-black uppercase">
                      {(connect.name || connect.username || 'C').charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-black uppercase">{connect.name || connect.username || 'COVO Student'}</p>
                  <p className="truncate text-xs font-bold text-neoMuted">
                    {connect.username ? `@${connect.username}` : connect.college || 'Student'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyPanel copy="No connects yet." />
        )}
      </>
    );
  }

  if (activePanel === 'liked') {
    return (
      <>
        <PanelHeader title="Most liked posts" count={likedPosts.length} />
        <PostList posts={likedPosts} emptyCopy="No liked posts yet." />
      </>
    );
  }

  return (
    <>
      <PanelHeader title={isOwnProfile ? 'My posts' : 'Posts'} count={posts.length} />
      <PostList posts={posts} emptyCopy="No posts yet." />
    </>
  );
}

function PanelHeader({ title, count }) {
  return (
    <div className="mb-4 flex items-center justify-between border-b-[3px] border-neoBorder pb-3">
      <h3 className="text-lg font-black uppercase">{title}</h3>
      <span className="border-[3px] border-neoBorder bg-neoYellow px-3 py-1 text-[10px] font-black uppercase shadow-neo-sm">
        {count}
      </span>
    </div>
  );
}

function PostList({ posts, emptyCopy }) {
  if (!posts.length) {
    return <EmptyPanel copy={emptyCopy} />;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function EmptyPanel({ copy }) {
  return (
    <div className="border-[3px] border-dashed border-neoBorder bg-neoSurfaceMuted p-6 text-center">
      <p className="text-sm font-black uppercase text-neoMuted">{copy}</p>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="surface-panel border-[3px] border-neoBorder p-4 shadow-neo-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">{label}</p>
      <p className="mt-2 truncate text-sm font-black uppercase">{value}</p>
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

function formatDate(value) {
  if (!value) return '';

  const rawDate = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(rawDate.getTime())) return '';

  return rawDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getOptimizedImageUrl(url) {
  if (!url || url.includes('dicebear') || url.includes('?tr=')) {
    return url;
  }

  return `${url}?tr=w-300,h-300`;
}

function getConnectsCount(profile, hydratedConnects = []) {
  if (!profile) return hydratedConnects.length;

  const arrayValue = [profile.connects, profile.friends, profile.connections, profile.followers].find(Array.isArray);
  if (arrayValue) return Math.max(arrayValue.length, hydratedConnects.length);

  const countValue = profile.connectsCount ?? profile.friendsCount ?? profile.connectionsCount ?? profile.followersCount;
  const numericCount = Number(countValue);
  return Number.isFinite(numericCount) ? numericCount : hydratedConnects.length;
}

function getProfileStatus(profile) {
  if (!profile) return 'Active';

  if (profile.idVerified === true || profile.verificationStatus === 'verified') {
    return 'Verified';
  }

  if (profile.registrationCompleted === true || profile.onboardingComplete === true) {
    return 'Active';
  }

  return 'Incomplete';
}

function getPostTime(post) {
  const value = post.createdAt;
  if (!value) return 0;

  const rawDate = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(rawDate.getTime()) ? 0 : rawDate.getTime();
}

async function fetchConnectProfiles(profile) {
  const rawConnects = getConnectEntries(profile);
  if (!rawConnects.length) return [];

  const embeddedProfiles = rawConnects
    .filter((connect) => typeof connect === 'object' && connect !== null)
    .map((connect) => ({
      uid: connect.uid || connect.id || connect.userId,
      ...connect,
    }));

  const connectIds = rawConnects
    .map((connect) => {
      if (typeof connect === 'string') return connect;
      if (typeof connect === 'object' && connect !== null) {
        return connect.uid || connect.id || connect.userId;
      }
      return null;
    })
    .filter(Boolean);

  const missingIds = [...new Set(connectIds)].filter((connectId) => {
    return !embeddedProfiles.some((connect) => connect.uid === connectId || connect.id === connectId);
  });

  const hydratedProfiles = await Promise.all(
    missingIds.slice(0, 20).map((connectId) =>
      apiFetch(`/users/${connectId}`)
        .then(({ user }) => ({ uid: connectId, id: connectId, ...user }))
        .catch(() => null),
    ),
  );

  return [...embeddedProfiles, ...hydratedProfiles.filter(Boolean)];
}

function getConnectEntries(profile) {
  if (!profile) return [];

  return [profile.connects, profile.friends, profile.connections, profile.followers].find(Array.isArray) || [];
}
