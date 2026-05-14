import React from 'react';
import { ArrowLeft, ArrowRight, Check, Crown, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const tribeFilters = ['ALL', 'TECH', 'CULTURAL', 'SPORTS', 'ACADEMIC', 'SERVICE', 'MEDIA'];

const majors = [
  { id: 'Computer Science', icon: 'CS', color: 'bg-neoCyan' },
  { id: 'Artificial Intelligence and Machine Learning', icon: 'AI', color: 'bg-neoYellow' },
  { id: 'Computer Science and Business Systems', icon: 'BS', color: 'bg-neoPink text-white' },
  { id: 'Electronics and Telecommunications', icon: 'ET', color: 'bg-neoCyan' },
  { id: 'Electrical', icon: 'EL', color: 'bg-neoYellow' },
  { id: 'Mechanical', icon: 'ME', color: 'bg-neoPink text-white' },
  { id: 'Civil', icon: 'CV', color: 'bg-neoCyan' },
  { id: 'Civil and Environmental', icon: 'CE', color: 'bg-neoYellow' },
  { id: 'Biotechnology', icon: 'BT', color: 'bg-neoPink text-white' },
];

const sceneOptions = [
  { id: 'Coding Club', category: 'TECH', accent: 'bg-neoCyan' },
  { id: 'AI and Robotics Society', category: 'TECH', accent: 'bg-neoYellow' },
  { id: 'Cyber Security Cell', category: 'TECH', accent: 'bg-neoPink text-white' },
  { id: 'Google Developer Student Club', category: 'TECH', accent: 'bg-neoCyan' },
  { id: 'IEEE Student Branch', category: 'ACADEMIC', accent: 'bg-neoYellow' },
  { id: 'Entrepreneurship Cell', category: 'ACADEMIC', accent: 'bg-neoPink text-white' },
  { id: 'Research and Innovation Club', category: 'ACADEMIC', accent: 'bg-neoCyan' },
  { id: 'Training and Placement Cell', category: 'ACADEMIC', accent: 'bg-neoYellow' },
  { id: 'Drama Club', category: 'CULTURAL', accent: 'bg-neoPink text-white' },
  { id: 'Dance Club', category: 'CULTURAL', accent: 'bg-neoCyan' },
  { id: 'Music Club', category: 'CULTURAL', accent: 'bg-neoYellow' },
  { id: 'Fine Arts Club', category: 'CULTURAL', accent: 'bg-neoPink text-white' },
  { id: 'Literary Society', category: 'CULTURAL', accent: 'bg-neoCyan' },
  { id: 'Debate Club', category: 'CULTURAL', accent: 'bg-neoYellow' },
  { id: 'Photography Club', category: 'MEDIA', accent: 'bg-neoPink text-white' },
  { id: 'Film and Media Club', category: 'MEDIA', accent: 'bg-neoCyan' },
  { id: 'College Magazine Team', category: 'MEDIA', accent: 'bg-neoYellow' },
  { id: 'Football Club', category: 'SPORTS', accent: 'bg-neoPink text-white' },
  { id: 'Cricket Club', category: 'SPORTS', accent: 'bg-neoCyan' },
  { id: 'Basketball Club', category: 'SPORTS', accent: 'bg-neoYellow' },
  { id: 'Badminton Club', category: 'SPORTS', accent: 'bg-neoPink text-white' },
  { id: 'NSS Volunteers', category: 'SERVICE', accent: 'bg-neoCyan' },
  { id: 'Rotaract Club', category: 'SERVICE', accent: 'bg-neoYellow' },
  { id: 'Eco Club', category: 'SERVICE', accent: 'bg-neoPink text-white' },
];

export function ChooseTribe() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore((state) => ({
    user: state.user,
    updateProfile: state.updateProfile,
  }));
  const [selectedFilter, setSelectedFilter] = React.useState('ALL');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedMajor, setSelectedMajor] = React.useState(majors[0].id);
  const [selectedScenes, setSelectedScenes] = React.useState([
    'Coding Club',
    'AI and Robotics Society',
    'Entrepreneurship Cell',
  ]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const visibleScenes = sceneOptions.filter((scene) => {
    const filterMatch = selectedFilter === 'ALL' || scene.category === selectedFilter;
    const searchMatch = !searchTerm || scene.id.toLowerCase().includes(searchTerm.toLowerCase());
    return filterMatch && searchMatch;
  });

  const handleSceneToggle = (sceneId) => {
    setSelectedScenes((current) =>
      current.includes(sceneId) ? current.filter((item) => item !== sceneId) : [...current, sceneId],
    );
  };

  const handleFinish = async () => {
    if (!selectedMajor || selectedScenes.length === 0) {
      setError('Please select your branch and at least one community.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateProfile({
        name: user?.name,
        prn: user?.prn || '',
        college: user?.college,
        phoneNumber: user?.phoneNumber || '',
        bio: user?.bio || '',
        avatar: user?.avatar || '',
        major: selectedMajor,
        tribes: selectedScenes,
        communities: selectedScenes,
        registrationCompleted: true,
        onboardingComplete: true,
        needsOnboarding: false,
      });
      navigate('/');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err?.message || 'Failed to finalize your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neoBg">
      <div className="bg-neoText px-4 py-3 text-center text-xs font-black uppercase tracking-[0.35em] text-neoBg">
        Choose your tribe
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-5 inline-flex h-10 w-10 items-center justify-center border-[3px] border-neoBorder bg-neoSurface shadow-neo-sm"
            >
              <ArrowLeft className="h-5 w-5 stroke-[3px]" />
            </button>
            <h1 className="text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
              Choose
              <br />
              your tribe
            </h1>
            <p className="mt-4 text-lg font-semibold text-neoText">
              Pick your branch and follow communities at {user?.college || 'your college'}.
            </p>
          </div>
        </div>

        <div className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo md:p-6">
          <div className="mt-4 space-y-10">
            <section>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black uppercase tracking-tight">Select your branch</h2>
                <span className="border-[2px] border-neoBorder bg-neoSurface px-2 py-1 text-xs font-black uppercase text-neoMuted">
                  Required
                </span>
              </div>

              <div className="sm:hidden">
                <div className="relative">
                  <select
                    value={selectedMajor}
                    onChange={(event) => setSelectedMajor(event.target.value)}
                    className="h-16 w-full appearance-none border-[3px] border-neoBorder bg-neoSurface px-4 pr-16 text-base font-black uppercase text-neoText shadow-neo outline-none"
                  >
                    {majors.map((major) => (
                      <option key={major.id} value={major.id}>
                        {major.id}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 border-l-[3px] border-neoBorder pl-4">
                    <ArrowRight className="h-6 w-6 rotate-90 stroke-[3px]" />
                  </div>
                </div>
              </div>

              <div className="hidden grid-cols-2 gap-5 sm:grid lg:grid-cols-3">
                {majors.map((major) => {
                  const isSelected = selectedMajor === major.id;
                  return (
                    <button
                      key={major.id}
                      type="button"
                      onClick={() => setSelectedMajor(major.id)}
                      className={`group relative flex min-h-40 flex-col items-start border-[3px] border-neoBorder p-5 text-left transition-all md:min-h-44 md:p-6 ${
                        isSelected
                          ? `${major.color} shadow-neo`
                          : 'bg-neoSurface hover:-translate-y-1 hover:bg-neoSurfaceMuted hover:shadow-neo-sm'
                      }`}
                    >
                      {isSelected ? (
                        <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center bg-neoText text-neoBg">
                          <Check className="h-5 w-5 stroke-[4px]" />
                        </span>
                      ) : null}

                      <span className={`flex h-14 w-14 items-center justify-center border-[3px] border-neoBorder bg-neoSurface text-base font-black text-neoText ${isSelected ? 'ml-2 mt-2' : ''}`}>
                        {major.icon}
                      </span>
                      <span className="mt-auto pt-6 text-base font-black uppercase leading-snug md:text-xl">{major.id}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <hr className="border-t-[3px] border-dashed border-neoBorder opacity-30" />

            <section>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 stroke-[3px] text-neoText" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Find sub communities..."
                  className="h-16 w-full border-[3px] border-neoBorder bg-neoSurface pl-14 pr-4 text-xl font-bold text-neoText shadow-neo outline-none placeholder:text-neoMuted"
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {tribeFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSelectedFilter(filter)}
                    className={`border-[3px] border-neoBorder px-4 py-3 text-sm font-black uppercase shadow-neo-sm transition-all ${
                      selectedFilter === filter
                        ? 'bg-neoText text-neoBg -translate-y-1'
                        : 'bg-neoSurface text-neoText hover:bg-neoSurfaceMuted'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4">
                <h2 className="text-xl font-black uppercase tracking-tight text-neoText md:text-2xl">Join sub communities</h2>
                <p className="mt-1 text-xs font-semibold text-neoMuted md:text-sm">
                  Start with common global societies. Approved college-specific societies will appear here later.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 md:gap-4">
                {visibleScenes.map((scene) => {
                  const selected = selectedScenes.includes(scene.id);
                  return (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => handleSceneToggle(scene.id)}
                      className={`group border-[3px] border-neoBorder px-4 py-2.5 text-base font-black transition-all md:px-6 md:py-4 md:text-xl ${
                        selected
                          ? `${scene.accent} shadow-neo -translate-y-1`
                          : 'bg-neoSurface hover:-translate-y-0.5 hover:shadow-neo-sm'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {scene.id}
                        {selected ? <Check className="h-4 w-4 stroke-[4px] md:h-5 md:w-5" /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled
                className="mt-6 flex w-full cursor-not-allowed items-center justify-between gap-4 border-[3px] border-neoBorder bg-neoSurfaceMuted px-4 py-4 text-left opacity-80 shadow-neo-sm md:px-6"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center border-[3px] border-neoBorder bg-neoYellow">
                    <Crown className="h-5 w-5 stroke-[3px]" />
                  </span>
                  <span>
                    <span className="block text-sm font-black uppercase md:text-base">Register yourself as society president</span>
                    <span className="mt-1 block text-xs font-bold uppercase text-neoMuted">
                      Coming soon: approved presidents can request societies for their own college.
                    </span>
                  </span>
                </span>
                <span className="border-[3px] border-neoBorder bg-neoPink px-3 py-1 text-[10px] font-black uppercase text-white">
                  Coming soon
                </span>
              </button>
            </section>
          </div>
        </div>

        <div className="sticky bottom-4 mt-8 flex flex-col gap-2 md:mt-12">
          {error ? (
            <div className="border-[3px] border-neoBorder bg-red-500 px-4 py-3 text-center text-sm font-black uppercase text-white shadow-neo md:border-[4px] md:py-4 md:text-base">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleFinish}
            disabled={loading}
            className={`flex w-full items-center justify-between border-[3px] border-neoBorder bg-neoText px-4 py-4 text-left text-neoBg shadow-neo transition-all active:translate-y-[4px] active:shadow-none md:border-[4px] md:px-8 md:py-6 ${
              loading ? 'cursor-wait opacity-70' : 'hover:-translate-y-1'
            }`}
          >
            <span className="text-xl font-black uppercase leading-none md:text-3xl">
              {loading ? 'Initializing Chaos...' : 'Bring the Chaos'}
            </span>
            <span className="flex items-center gap-3 md:gap-6">
              <span className="border-[2px] border-neoBorder bg-neoCyan px-3 py-1.5 text-xs font-black uppercase text-neoText shadow-neo-sm md:border-[3px] md:px-5 md:py-3 md:text-lg">
                {selectedScenes.length} Selected
              </span>
              <ArrowRight className={`h-8 w-8 stroke-[4px] md:h-12 md:w-12 ${loading ? 'animate-pulse' : ''}`} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
