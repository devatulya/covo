import React from 'react';
import { ArrowLeft, ArrowRight, Camera, ChevronDown, GraduationCap, IdCard, Search } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';

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

function titleCase(value) {
  return value
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function Signup() {
  const signup = useAuthStore((state) => state.signup);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signupMethod = searchParams.get('method') === 'id' ? 'id' : 'email';

  const [step, setStep] = React.useState(1);
  const [selectedFilter, setSelectedFilter] = React.useState('ALL');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedMajor, setSelectedMajor] = React.useState(majors[0]);
  const [selectedScenes, setSelectedScenes] = React.useState(['Varsity Football', 'Graphic Design', 'Chess Society']);
  const [formData, setFormData] = React.useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });
  const [signupError, setSignupError] = React.useState('');

  const passwordMismatch =
    formData.password.length > 0 &&
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  const canContinueProfile =
    formData.email.trim() &&
    formData.username.trim() &&
    formData.password.trim() &&
    formData.confirmPassword.trim() &&
    formData.bio.trim() &&
    !passwordMismatch;

  const visibleScenes = sceneOptions.filter((scene) => {
    const filterMatch = selectedFilter === 'ALL' || scene.category === selectedFilter;
    const searchMatch = !searchTerm || scene.id.toLowerCase().includes(searchTerm.toLowerCase());
    return filterMatch && searchMatch;
  });

  const handleFieldChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSceneToggle = (sceneId) => {
    setSelectedScenes((current) =>
      current.includes(sceneId) ? current.filter((item) => item !== sceneId) : [...current, sceneId],
    );
  };

  const handleContinue = () => {
    if (!canContinueProfile) {
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = async () => {
    if (!selectedMajor || selectedScenes.length === 0) {
      return;
    }

    const normalizedUsername = formData.username.trim().toLowerCase();

    try {
      setSignupError('');
      await signup({
        email: formData.email.trim(),
        password: formData.password,
        username: normalizedUsername || 'new_user',
        name: titleCase(formData.username.trim() || 'New User'),
        college: selectedMajor,
      });
      navigate('/');
    } catch (err) {
      console.error('Error signing up:', err);
      setSignupError(err.message || 'Failed to sign up. Please try again.');
    }
  };

  return step === 1 ? (
    <ProfileSetupStep
      signupMethod={signupMethod}
      formData={formData}
      passwordMismatch={passwordMismatch}
      onChange={handleFieldChange}
      onContinue={handleContinue}
      canContinueProfile={canContinueProfile}
    />
  ) : (
    <ChooseTribeStep
      signupMethod={signupMethod}
      selectedFilter={selectedFilter}
      setSelectedFilter={setSelectedFilter}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectedMajor={selectedMajor}
      setSelectedMajor={setSelectedMajor}
      selectedScenes={selectedScenes}
      visibleScenes={visibleScenes}
      onSceneToggle={handleSceneToggle}
      onBack={() => setStep(1)}
      onFinish={handleFinish}
      error={signupError}
    />
  );
}

function ProfileSetupStep({
  signupMethod,
  formData,
  passwordMismatch,
  onChange,
  onContinue,
  canContinueProfile,
}) {
  const methodIcon =
    signupMethod === 'email' ? (
      <GraduationCap className="h-5 w-5 stroke-[3px]" />
    ) : (
      <IdCard className="h-5 w-5 stroke-[3px]" />
    );

  const methodLabel = signupMethod === 'email' ? 'College email flow' : 'ID-card flow';

  return (
    <div className="min-h-screen bg-neoBg">
      <div className="bg-neoText px-4 py-3 text-center text-xs font-black uppercase tracking-[0.35em] text-neoBg">
        Complete profile setup
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col px-4 py-6 md:px-8 md:py-10">
        <div className="pointer-events-none absolute left-[-30px] top-[32%] h-28 w-28 rotate-[-12deg] border-[3px] border-neoBorder bg-neoCyan shadow-neo md:h-36 md:w-36" />
        <div className="pointer-events-none absolute right-[-16px] top-[12%] h-20 w-20 rotate-[12deg] border-[3px] border-neoBorder bg-neoCyan shadow-neo md:h-24 md:w-24" />

        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 md:flex-row md:items-start">
          <div className="md:w-[260px]">
            <Link
              to="/landing"
              className="inline-flex h-10 w-10 items-center justify-center border-[3px] border-neoBorder bg-neoSurface shadow-neo-sm"
            >
              <ArrowLeft className="h-5 w-5 stroke-[3px]" />
            </Link>

            <div className="mt-8 max-w-xs">
              <div className="mb-4 inline-flex items-center gap-2 border-[3px] border-neoBorder bg-neoYellow px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-neo-sm">
                {methodIcon}
                {methodLabel}
              </div>
              <h1 className="text-4xl font-black uppercase leading-none tracking-tight md:text-6xl">
                Complete
                <br />
                your setup
              </h1>
              <p className="mt-5 text-sm font-semibold leading-relaxed text-neoMuted">
                Set the essentials now so the rest of the onboarding can focus on the communities and scenes you want.
              </p>
            </div>
          </div>

          <div className="surface-panel w-full max-w-2xl border-[3px] border-neoBorder p-5 shadow-neo md:p-8">
            <div className="mb-8 flex justify-center md:justify-start">
              <button
                type="button"
                className="flex h-36 w-36 rotate-[-2deg] flex-col items-center justify-center gap-3 border-[3px] border-neoBorder bg-neoPink text-white shadow-neo"
              >
                <Camera className="h-10 w-10 stroke-[3px]" />
                <span className="text-sm font-black uppercase leading-none">Add photo</span>
              </button>
            </div>

            <div className="space-y-5">
              <Field label="College Email">
                <Input type="email" value={formData.email} onChange={onChange('email')} placeholder="you@university.edu" className="h-16 text-xl font-bold" />
              </Field>

              <Field label="Username">
                <Input value={formData.username} onChange={onChange('username')} placeholder="Enter username" className="h-16 text-xl font-bold" />
              </Field>

              <Field label="Password">
                <Input
                  type="password"
                  value={formData.password}
                  onChange={onChange('password')}
                  placeholder="........"
                  className="h-16 text-xl font-bold"
                />
              </Field>

              <Field label="Confirm password">
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={onChange('confirmPassword')}
                  placeholder="........"
                  className="h-16 text-xl font-bold"
                />
              </Field>

              {passwordMismatch ? (
                <p className="text-sm font-black uppercase text-red-500">Passwords need to match before you continue.</p>
              ) : null}

              <Field label="Bio">
                <textarea
                  value={formData.bio}
                  onChange={onChange('bio')}
                  placeholder="Tell us something about yourself..."
                  className="min-h-[180px] w-full resize-none border-[3px] border-neoBorder bg-neoSurface p-4 text-xl font-bold text-neoText shadow-neo outline-none placeholder:text-neoMuted"
                />
              </Field>

              <button
                type="button"
                onClick={onContinue}
                disabled={!canContinueProfile}
                className="mt-6 w-full border-[3px] border-neoBorder bg-neoYellow py-5 text-3xl font-black uppercase shadow-neo disabled:cursor-not-allowed disabled:opacity-50"
              >
                LFG
              </button>

              <div className="pt-2 text-center">
                <Link to="/login" className="text-sm font-black uppercase underline">
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChooseTribeStep({
  selectedFilter,
  setSelectedFilter,
  searchTerm,
  setSearchTerm,
  selectedMajor,
  setSelectedMajor,
  selectedScenes,
  visibleScenes,
  onSceneToggle,
  onBack,
  onFinish,
  error,
}) {
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
              onClick={onBack}
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
                      onClick={() => onSceneToggle(scene.id)}
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
            onClick={onFinish}
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

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-black uppercase tracking-[0.2em]">{label}</label>
      {children}
    </div>
  );
}
