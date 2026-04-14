import React from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const tribeFilters = ['ALL', 'SPORTS', 'ARTS', 'GREEK', 'TECH'];

const majors = ['Computer Science (BS)', 'Graphic Design', 'Mechanical Engineering', 'Business Analytics', 'Political Science'];

const sceneOptions = [
  { id: 'Varsity Football', category: 'SPORTS', accent: 'bg-neoCyan' },
  { id: 'Graphic Design', category: 'ARTS', accent: 'bg-neoPink text-white' },
  { id: 'Chess Society', category: 'ALL', accent: 'bg-neoSurface' },
  { id: 'Film Club', category: 'ARTS', accent: 'bg-neoSurface' },
  { id: 'Esports', category: 'TECH', accent: 'bg-neoCyan' },
  { id: 'Weekend Warriors', category: 'GREEK', accent: 'bg-neoSurface' },
  { id: 'Code Collective', category: 'TECH', accent: 'bg-neoYellow' },
  { id: 'Fine Arts Union', category: 'ARTS', accent: 'bg-neoPink text-white' },
];

export function ChooseTribe() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = React.useState('ALL');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedMajor, setSelectedMajor] = React.useState(majors[0]);
  const [selectedScenes, setSelectedScenes] = React.useState(['Varsity Football', 'Graphic Design', 'Chess Society']);
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
    // Navigates back to home since account is already created
    navigate('/');
  };

  const handleFinish = async () => {
    if (!selectedMajor || selectedScenes.length === 0) {
      return;
    }
    
    // Saarthak: Add your updateProfile workflow here to save tribes to Firestore
    navigate('/');
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
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 stroke-[3px] text-neoText" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Find clubs, majors..."
              className="h-16 w-full border-[3px] border-neoBorder bg-neoSurface pl-14 pr-4 text-xl font-bold text-neoText shadow-neo outline-none placeholder:text-neoMuted"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {tribeFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedFilter(filter)}
                className={`border-[3px] border-neoBorder px-4 py-3 text-sm font-black uppercase shadow-neo-sm ${
                  selectedFilter === filter
                    ? 'bg-neoText text-neoBg'
                    : 'bg-neoSurface text-neoText hover:bg-neoSurfaceMuted'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.95fr),minmax(0,1.05fr)]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-black uppercase">Your branch</h2>
                <span className="text-xs font-black uppercase text-neoMuted">Required</span>
              </div>

              <div className="relative border-[3px] border-neoBorder bg-neoCyan p-5 shadow-neo">
                <div className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-neoMuted">Selected major</div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-3xl font-black">{selectedMajor}</span>
                  <ChevronDown className="h-6 w-6 stroke-[3px]" />
                </div>
                <select
                  value={selectedMajor}
                  onChange={(event) => setSelectedMajor(event.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label="Choose your major"
                >
                  {majors.map((major) => (
                    <option key={major} value={major}>
                      {major}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-black uppercase">The scene</h2>
              <div className="flex flex-wrap gap-4">
                {visibleScenes.map((scene) => {
                  const selected = selectedScenes.includes(scene.id);

                  return (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => handleSceneToggle(scene.id)}
                      className={`rounded-full border-[3px] border-neoBorder px-6 py-4 text-xl font-black shadow-neo ${
                        selected ? scene.accent : 'bg-neoSurface'
                      }`}
                    >
                      {scene.id}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-4 mt-8 flex flex-col gap-2">
          {error && (
            <div className="bg-red-500 border-[3px] border-neoBorder text-white px-4 py-3 text-sm font-black uppercase text-center shadow-neo">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={handleFinish}
            className="flex w-full items-center justify-between border-[3px] border-neoBorder bg-neoText px-6 py-5 text-left text-neoBg shadow-neo"
          >
            <span className="text-2xl font-black uppercase">Continue</span>
            <span className="flex items-center gap-4">
              <span className="border-[3px] border-neoBorder bg-neoCyan px-4 py-2 text-base font-black uppercase text-neoText shadow-neo-sm">
                {selectedScenes.length} selected
              </span>
              <ArrowRight className="h-10 w-10 stroke-[3px]" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
