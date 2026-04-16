import React from 'react';
import { ArrowLeft, ArrowRight, Check, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const tribeFilters = ['ALL', 'SPORTS', 'ARTS', 'GREEK', 'TECH'];

const majors = [
  { id: 'Computer Science (BS)', icon: '💻', color: 'bg-neoCyan' },
  { id: 'Graphic Design', icon: '🎨', color: 'bg-neoPink' },
  { id: 'Mechanical Engineering', icon: '⚙️', color: 'bg-neoYellow' },
  { id: 'Business Analytics', icon: '📊', color: 'bg-neoCyan' },
  { id: 'Political Science', icon: '⚖️', color: 'bg-neoPink' }
];

const sceneOptions = [
  { id: 'Varsity Football', category: 'SPORTS', accent: 'bg-neoCyan' },
  { id: 'Graphic Design', category: 'ARTS', accent: 'bg-neoPink text-white' },
  { id: 'Chess Society', category: 'ALL', accent: 'bg-neoYellow' },
  { id: 'Film Club', category: 'ARTS', accent: 'bg-neoPink text-white' },
  { id: 'Esports', category: 'TECH', accent: 'bg-neoCyan' },
  { id: 'Weekend Warriors', category: 'GREEK', accent: 'bg-neoYellow' },
  { id: 'Code Collective', category: 'TECH', accent: 'bg-neoYellow' },
  { id: 'Fine Arts Union', category: 'ARTS', accent: 'bg-neoPink text-white' },
];

export function ChooseTribe() {
  const navigate = useNavigate();
  const { updateProfile, user } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = React.useState('ALL');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedMajor, setSelectedMajor] = React.useState(majors[0].id);
  const [selectedScenes, setSelectedScenes] = React.useState(['Varsity Football', 'Graphic Design', 'Chess Society']);
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

  const handleBack = () => {
    navigate('/');
  };

  const handleFinish = async () => {
    if (!selectedMajor || selectedScenes.length === 0) {
      setError('Please select your major and at least one scene!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateProfile({
        major: selectedMajor,
        scenes: selectedScenes,
        onboardingComplete: true
      });
      navigate('/');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to save your tribes. Please try again.');
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
              onClick={handleBack}
              className="mb-5 inline-flex h-10 w-10 items-center justify-center border-[3px] border-neoBorder bg-neoSurface shadow-neo-sm"
            >
              <ArrowLeft className="h-5 w-5 stroke-[3px]" />
            </button>
            <h1 className="text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
              Choose
              <br />
              your tribe
            </h1>
            <p className="mt-4 text-lg font-semibold text-neoText">Where do you belong at State University?</p>
          </div>
        </div>

        <div className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo md:p-6">
          <div className="mt-4 space-y-10">
            {/* Major Selection Grid */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black uppercase tracking-tight">Select your branch</h2>
                <span className="text-xs font-black uppercase text-neoMuted border-[2px] border-neoBorder px-2 py-1 bg-neoSurface">Required</span>
              </div>
              {/* Mobile Dropdown (Compact) */}
              <div className="sm:hidden">
                <div className="relative">
                  <select
                    value={selectedMajor}
                    onChange={(e) => setSelectedMajor(e.target.value)}
                    className="h-16 w-full appearance-none border-[3px] border-neoBorder bg-neoSurface px-4 text-lg font-black uppercase text-neoText shadow-neo outline-none"
                  >
                    {majors.map((major) => (
                      <option key={major.id} value={major.id}>
                        {major.icon} {major.id}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 border-l-[3px] border-neoBorder pl-4">
                    <ArrowRight className="h-6 w-6 rotate-90 stroke-[3px]" />
                  </div>
                </div>
              </div>

              {/* Desktop Selection Grid */}
              <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4">
                {majors.map((major) => {
                  const isSelected = selectedMajor === major.id;
                  return (
                    <button
                      key={major.id}
                      type="button"
                      onClick={() => setSelectedMajor(major.id)}
                      className={`group relative flex flex-row items-center sm:flex-col sm:items-start p-3 md:p-5 border-[3px] border-neoBorder transition-all text-left ${
                        isSelected 
                          ? `${major.color} shadow-neo translate-y-[-4px]` 
                          : 'bg-neoSurface hover:bg-neoSurfaceMuted hover:translate-y-[-2px] hover:shadow-neo-sm'
                      }`}
                    >
                      <div className="text-xl sm:text-3xl md:text-4xl mr-3 sm:mr-0 sm:mb-4">{major.icon}</div>
                      <div className="text-sm sm:text-lg md:text-xl font-black uppercase leading-none">{major.id}</div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 bg-neoText text-neoBg p-1 border-[2px] border-neoBorder">
                          <Check className="h-3 w-3 md:h-4 md:w-4 stroke-[4px]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-t-[3px] border-neoBorder border-dashed opacity-30" />

            {/* Search and Filters */}
            <div>
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
            </div>

            {/* Scenes Selection */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-neoText">Join sub communities</h2>
                <p className="text-xs md:text-sm font-semibold text-neoMuted mt-1">Select the communities you want to follow</p>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-4">
                {visibleScenes.map((scene) => {
                  const selected = selectedScenes.includes(scene.id);

                  return (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => handleSceneToggle(scene.id)}
                      className={`group rounded-full border-[3px] border-neoBorder px-4 py-2.5 md:px-6 md:py-4 text-base md:text-xl font-black transition-all ${
                        selected 
                          ? `${scene.accent} shadow-neo -translate-y-1` 
                          : 'bg-neoSurface hover:translate-y-[-2px] hover:shadow-neo-sm'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {scene.id}
                        {selected && <Check className="h-4 w-4 md:h-5 md:w-5 stroke-[4px]" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-4 mt-8 md:mt-12 flex flex-col gap-2">
          {error && (
            <div className="bg-red-500 border-[3px] md:border-[4px] border-neoBorder text-white px-4 py-3 md:py-4 text-sm md:text-base font-black uppercase text-center shadow-neo animate-in fade-in slide-in-from-bottom-2">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={handleFinish}
            disabled={loading}
            className={`flex w-full items-center justify-between border-[3px] md:border-[4px] border-neoBorder bg-neoText px-4 py-4 md:px-8 md:py-6 text-left text-neoBg shadow-neo transition-all active:translate-y-[4px] active:shadow-none ${
              loading ? 'opacity-70 cursor-wait' : 'hover:-translate-y-1'
            }`}
          >
            <span className="text-xl md:text-3xl font-black uppercase leading-none">
              {loading ? 'Initializing Chaos...' : 'Bring the Chaos'}
            </span>
            <span className="flex items-center gap-3 md:gap-6">
              <span className="border-[2px] md:border-[3px] border-neoBorder bg-neoCyan px-3 py-1.5 md:px-5 md:py-3 text-xs md:text-lg font-black uppercase text-neoText shadow-neo-sm">
                {selectedScenes.length} Selected
              </span>
              <ArrowRight className={`h-8 w-8 md:h-12 md:w-12 stroke-[4px] ${loading ? 'animate-pulse' : ''}`} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
