import React from 'react';
import { ArrowLeft, Camera, GraduationCap, IdCard } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';

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

  const handleFieldChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleContinue = async () => {
    if (!canContinueProfile) return;

    const normalizedUsername = formData.username.trim().toLowerCase();

    try {
      setSignupError('');
      // We will now create the user right away with the Step 1 data!
      await signup({
        email: formData.email.trim(),
        password: formData.password,
        username: normalizedUsername || 'new_user',
        name: titleCase(formData.username.trim() || 'New User'),
        bio: formData.bio.trim(),
      });
      // Route user to Saarthak's page!
      navigate('/choose-tribe');
    } catch (err) {
      console.error('Error signing up:', err);
      setSignupError(err.message || 'Failed to sign up. Please try again.');
    }
  };

  return (
    <ProfileSetupStep
      signupMethod={signupMethod}
      formData={formData}
      passwordMismatch={passwordMismatch}
      onChange={handleFieldChange}
      onContinue={handleContinue}
      canContinueProfile={canContinueProfile}
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
  error,
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
              
              {error && (
                <div className="bg-red-500 border-[3px] border-neoBorder text-white px-4 py-3 text-sm font-black uppercase text-center shadow-neo">
                  {error}
                </div>
              )}

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

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-black uppercase tracking-[0.2em]">{label}</label>
      {children}
    </div>
  );
}
