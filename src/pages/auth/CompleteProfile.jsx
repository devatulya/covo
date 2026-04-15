import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, User, Smartphone, AlignLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';

// Temporary predefined list for colleges.
const DUMMY_COLLEGES = [
  'Select your college...',
  'Harvard University',
  'Kolhapur Institute of Technology',
  'Stanford University',
  'MIT',
  'Delhi University',
  'IIT Bombay',
  'University of Oxford'
];

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jude',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leah',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sheba',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Gizmo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi',
];

export function CompleteProfile() {
  const { user, setStagedProfile } = useAuthStore((state) => ({
    user: state.user,
    setStagedProfile: state.setStagedProfile
  }));
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(useLocation().search);
  const signupMethod = searchParams.get('method') || 'email';

  const [formData, setFormData] = useState({
    name: user?.name && user?.username && user.name.toLowerCase() !== user.username.toLowerCase() ? user.name : '',
    prn: user?.prn || '',  
    college: user?.college && user.college !== 'University' ? user.college : '',
    phone: user?.phoneNumber || '',
    bio: user?.bio || '',
  });

  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATARS[0]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = formData.name.trim() && formData.prn.trim() && formData.college && formData.college !== 'Select your college...' && formData.bio.trim();

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Check for duplicate PRN within the same college
      const q = query(collection(db, 'users'), where('prn', '==', formData.prn.trim()));
      const querySnapshot = await getDocs(q);
      const duplicateRecord = querySnapshot.docs.find(d => 
        d.data().college === formData.college && d.id !== user.uid
      );

      if (duplicateRecord) {
        setIsSubmitting(false);
        const dupData = duplicateRecord.data();
        
        // Mask credentials like atxxxxxxxxx54@gmail.com
        const maskEmail = (em) => {
          if(!em || !em.includes('@')) return '';
          const [local, dom] = em.split('@');
          if (local.length <= 4) return `xxxxx@${dom}`;
          return `${local.substring(0, 2)}${'x'.repeat(local.length - 4)}${local.substring(local.length - 2)}@${dom}`;
        };
        const maskPhone = (ph) => {
          if(!ph || ph.length < 10) return '';
          return `${ph.substring(0, 3)}${'x'.repeat(ph.length - 5)}${ph.substring(ph.length - 2)}`;
        };

        let errStr = `DUPLICATE_FOUND|This PRN for this college is already registered with email: ${maskEmail(dupData.email)}`;
        if (dupData.phoneNumber) errStr += ` and number: ${maskPhone(dupData.phoneNumber)}`;
        setError(errStr);
        return;
      }

      setStagedProfile({
        name: formData.name.trim(),
        prn: formData.prn.trim(),
        college: formData.college,
        phoneNumber: formData.phone.trim(),
        bio: formData.bio.trim(),
        avatar: selectedAvatar
      });
      // Route based on method
      if (signupMethod === 'id') {
        navigate('/upload-id');
      } else {
        navigate('/choose-tribe');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neoBg">
      <div className="bg-neoText px-4 py-3 text-center text-xs font-black uppercase tracking-[0.35em] text-neoBg">
        Complete your digital id
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col px-4 py-6 md:px-8 md:py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 md:flex-row md:items-start">
          <div className="md:w-[280px]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-10 w-10 items-center justify-center border-[3px] border-neoBorder bg-neoSurface shadow-neo-sm"
            >
              <ArrowLeft className="h-5 w-5 stroke-[3px]" />
            </button>

            <div className="mt-8 max-w-xs">
              <h1 className="text-4xl font-black uppercase leading-none tracking-tight md:text-6xl">
                Who
                <br />
                are you?
              </h1>
              <p className="mt-5 text-sm font-semibold leading-relaxed text-neoMuted">
                Flesh out your profile so people know who they are dealing with. Don't be boring.
              </p>
            </div>
          </div>

          <div className="surface-panel w-full flex-1 border-[3px] border-neoBorder p-5 shadow-neo md:p-8">
            <div className="mb-6">
              <label className="text-sm font-black uppercase tracking-[0.2em] mb-4 block">1. Pick an Avatar</label>
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {AVATARS.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`aspect-square overflow-hidden border-[3px] border-neoBorder shadow-neo-sm transition-transform active:scale-95 ${selectedAvatar === avatar ? 'bg-neoCyan ring-4 ring-neoPurple outline-none' : 'bg-neoSurface'
                      }`}
                  >
                    <img src={avatar} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Field label="2. Full Name" icon={<User className="h-5 w-5" />}>
                <Input value={formData.name} onChange={handleChange('name')} placeholder="Your real name (As printed on ID card)" className="h-14 font-bold" />
                <p className="text-xs font-semibold text-neoMuted uppercase mt-1 tracking-wider">Note: Ensure this exactly matches the name on your ID Card</p>
              </Field>

              <Field label="3. College PRN / Roll Number" icon={<AlignLeft className="h-5 w-5" />}>
                <Input value={formData.prn} onChange={handleChange('prn')} placeholder="e.g. 242500xxxx" className="h-14 font-bold uppercase" />
                <p className="text-xs font-semibold text-neoMuted uppercase mt-1 tracking-wider">Note: Include your full official university PRN or Roll No</p>
              </Field>

              <Field label="4. College/University" icon={<GraduationCap className="h-5 w-5" />}>
                <div className="relative">
                  <select
                    value={formData.college}
                    onChange={handleChange('college')}
                    className="h-14 w-full cursor-pointer appearance-none border-[3px] border-neoBorder bg-white px-4 font-bold text-neoText shadow-neo-sm outline-none placeholder:text-neoMuted focus:border-neoPurple"
                  >
                    {DUMMY_COLLEGES.map((college) => (
                      <option key={college} value={college === 'Select your college...' ? '' : college} disabled={college === 'Select your college...'}>
                        {college}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 stroke-[3px]" />
                </div>
              </Field>

              <Field label="5. Phone Number (Optional)" icon={<Smartphone className="h-5 w-5" />}>
                <Input type="tel" value={formData.phone} onChange={handleChange('phone')} placeholder="+1 (555) 000-0000" className="h-14 font-bold" />
              </Field>

              <Field label="6. Catchy Bio" icon={<AlignLeft className="h-5 w-5" />}>
                <textarea
                  value={formData.bio}
                  onChange={handleChange('bio')}
                  placeholder="Drop a wild fact or a boring hobby..."
                  className="min-h-[120px] w-full resize-none border-[3px] border-neoBorder bg-neoSurface p-4 font-bold text-neoText shadow-neo-sm outline-none placeholder:text-neoMuted focus:border-neoPurple focus:shadow-neo"
                />
              </Field>

              {error && !error.startsWith('DUPLICATE_FOUND') && (
                <div className="bg-red-500 border-[3px] border-neoBorder text-white px-4 py-3 text-sm font-black uppercase text-center shadow-neo">
                  {error}
                </div>
              )}

              {error && error.startsWith('DUPLICATE_FOUND') && (
                <div className="bg-neoYellow border-[3px] border-neoBorder text-neoText px-4 py-4 text-sm font-black uppercase text-center shadow-neo space-y-3">
                  <p>{error.split('|')[1]}</p>
                  <Link to="/login" className="inline-flex items-center gap-2 border-[3px] border-neoBorder bg-neoCyan px-4 py-2 hover:bg-white active:scale-95 transition-all w-full justify-center text-lg">
                    Proceed to Login
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="mt-8 flex w-full items-center justify-between border-[3px] border-neoBorder bg-neoPink px-6 py-5 text-left text-white shadow-neo hover:bg-neoPurple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-2xl font-black uppercase">Continue</span>
                <ArrowRight className="h-8 w-8 stroke-[3px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-neoText">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

// Ensure GraduationCap is available for icon
function GraduationCap(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.42 10.922a2 2 0 0 1-.01 3.167l-7.11 5.688a2 2 0 0 1-2.6 0l-7.11-5.688a2 2 0 0 1-.01-3.167l7.11-5.688a2 2 0 0 1 2.62 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </svg>
  );
}
