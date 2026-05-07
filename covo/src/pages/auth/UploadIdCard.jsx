import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, ScanLine, CheckCircle2, ShieldCheck, RefreshCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';
import stringSimilarity from 'string-similarity';
import { useAuthStore } from '../../store/authStore';

export function UploadIdCard() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState(''); // 'idle', 'scanning', 'success', 'failed'
  const [errorMessage, setErrorMessage] = useState('');
  const [scanResults, setScanResults] = useState(null);

  // Safety Redirection: If user manually lands here or refreshes without data
  useEffect(() => {
    if (!loading && (!user || !user.uid)) {
      navigate('/signup');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neoBg">
        <div className="text-xl font-black uppercase text-neoText animate-pulse">Initializing Scanner...</div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please strictly upload an image file (JPEG, PNG).');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanStatus('idle');
    setErrorMessage('');
  };

  const calculateMatchScore = (extractedText) => {
    const cleanExtracted = extractedText.toLowerCase().replace(/\s+/g, ' ');
    const nameStr = (user?.name || '').toLowerCase();
    const collegeStr = (user?.college || '').toLowerCase();
    const prnStr = (user?.prn || '').toLowerCase();

    // Normalization patterns for OCR character confusion
    const normalizeForOCR = (str) => {
      return str.replace(/[^a-z0-9]/gi, '')
                .replace(/[oO]/g, '0')
                .replace(/[bB]/g, '8')
                .replace(/[iIlL]/g, '1')
                .replace(/[sS]/g, '5')
                .replace(/[gG]/g, '6')
                .replace(/[zZ]/g, '2');
    };

    // 1. PRN Match (Strict OCR-Normalized Inclusion)
    let prnMatch = 0.0;
    if (prnStr) {
      const normalizedPrn = normalizeForOCR(prnStr);
      const targetLen = normalizedPrn.length;
      const tokens = cleanExtracted.split(/[\s|:]+/).map(normalizeForOCR).filter(t => t.length > 0);
      
      for (const token of tokens) {
        if (token.length >= targetLen - 1 && normalizedPrn.includes(token)) {
           prnMatch = 1.0;
           break;
        }
      }
    }
    
    // 2. College Match (Fuzzy Inclusion)
    let collegeScore = 0;
    if (collegeStr) {
      const collegeWords = collegeStr.split(' ').filter(w => w.length > 2);
      const matches = collegeWords.filter(w => cleanExtracted.includes(w.toLowerCase())).length;
      collegeScore = collegeWords.length > 0 ? matches / collegeWords.length : 0;
    }

    // 3. Name Match (Word combination sliding window)
    let nameScore = 0;
    if (nameStr) {
      const allExtractedWords = cleanExtracted.split(' ');
      const targetWords = nameStr.split(' ');
      const targetLength = targetWords.length;
      let highestSimilarity = 0;

      for (let i = 0; i <= allExtractedWords.length - targetLength; i++) {
        const windowText = allExtractedWords.slice(i, i + targetLength).join(' ');
        const score = stringSimilarity.compareTwoStrings(nameStr, windowText);
        if (score > highestSimilarity) highestSimilarity = score;
      }
      nameScore = highestSimilarity;
    }

    // Weighting: PRN (50%), Name (30%), College (20%)
    // Since PRN is the unique identifier, we weigh it heaviest.
    const finalScore = (prnMatch * 0.5) + (nameScore * 0.3) + (collegeScore * 0.2);
    
    return {
      score: Math.round(finalScore * 100),
      nameScore: Math.round(nameScore * 100),
      collegeScore: Math.round(collegeScore * 100),
      prnMatch: prnMatch === 1.0,
      reasons: {
        prn: prnMatch === 1.0 ? 'Valid' : 'Not Matched',
        name: nameScore > 0.6 ? 'Valid' : 'Low Similarity',
        college: collegeScore > 0.5 ? 'Valid' : 'Unconfirmed'
      }
    };
  };

   const preprocessImage = (file) => {
     return new Promise((resolve) => {
       const img = new Image();
       img.src = URL.createObjectURL(file);
       img.onload = () => {
         const canvas = document.createElement('canvas');
         canvas.width = img.width;
         canvas.height = img.height;
         const ctx = canvas.getContext('2d');
         // Aggressive filter for high-contrast OCR
         ctx.filter = 'grayscale(100%) contrast(180%) brightness(105%)';
         ctx.drawImage(img, 0, 0);
         resolve(canvas.toDataURL('image/jpeg', 0.9));
       };
     });
   };

   const handleScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setScanStatus('scanning');
    setErrorMessage('');
    setScanResults(null);

    try {
      const processedImage = await preprocessImage(selectedFile);
      
      const [rawResult, processedResult] = await Promise.all([
        Tesseract.recognize(selectedFile, 'eng'),
        Tesseract.recognize(processedImage, 'eng')
      ]);

      const combinedText = `[RAW]\n${rawResult.data.text}\n[PROC]\n${processedResult.data.text}`;
      const results = calculateMatchScore(combinedText);
      setScanResults(results);

      // Pass threshold: 75% total OR 100% PRN + 60% Name
      const isPass = results.score >= 75 || (results.prnMatch && results.nameScore >= 60);

      if (isPass) {
        setScanStatus('success');
        // Persist the verification status to Firestore
        await updateProfile({
          idVerified: true,
          verificationStatus: 'verified',
          verificationAttemptAt: new Date().toISOString(),
          // Note: Image is not stored in Storage as per request, only verification status is confirmed.
        });
      } else {
        setScanStatus('failed');
        setErrorMessage('Verification failed. Please ensure your ID card is clearly visible and well-lit.');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setScanStatus('failed');
      setErrorMessage('Verification engine encountered an error. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-neoBg">
      <div className="bg-neoText px-4 py-3 text-center text-xs font-black uppercase tracking-[0.35em] text-neoBg flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4" /> Identity Verification Check
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-10 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-10 w-10 items-center justify-center border-[3px] border-neoBorder bg-neoSurface shadow-neo-sm"
          >
            <ArrowLeft className="h-5 w-5 stroke-[3px]" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <h1 className="text-4xl font-black uppercase leading-none md:text-5xl">
              Upload <span className="text-neoPurple">ID Card</span>
            </h1>
            <p className="text-sm font-semibold leading-relaxed text-neoMuted border-l-4 border-neoYellow pl-3">
              To enter the campus grid smoothly, our Tesseract OCR Engine will scan your ID to verify the Name and PRN you submitted match. 
            </p>
            
            <div className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo bg-white">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 text-neoMuted">Looking For:</h3>
               <ul className="space-y-2 text-sm font-bold uppercase">
                 <li className="flex justify-between border-b-[2px] border-neoBg pb-1"><span>Name:</span> <span>{user?.name}</span></li>
                 <li className="flex justify-between border-b-[2px] border-neoBg pb-1"><span>PRN:</span> <span>{user?.prn || 'Not Provided'}</span></li>
                 <li className="flex justify-between pb-1"><span>College:</span> <span className="truncate flex-1 text-right ml-4">{user?.college}</span></li>
               </ul>
            </div>
          </div>

          <div className="surface-panel w-full border-[3px] border-neoBorder p-6 shadow-neo space-y-6 flex flex-col h-full bg-neoText text-neoBg">
            
             {!previewUrl ? (
              <div 
                className="flex-1 min-h-[250px] border-[3px] border-dashed border-neoMuted bg-neoBg flex flex-col items-center justify-center cursor-pointer hover:bg-neoSurface transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
                <Upload className="w-12 h-12 stroke-[2px] text-neoPurple mb-3" />
                <p className="font-black uppercase text-center text-neoText">Tap to Upload Image</p>
                <p className="text-xs font-semibold text-neoMuted mt-1">JPEG, PNG only</p>
              </div>
            ) : (
              <div className="relative flex-1 min-h-[250px] border-[3px] border-neoBorder bg-neoBg flex items-center justify-center p-2 group overflow-hidden">
                 <img src={previewUrl} alt="ID Card Preview" className="max-h-[250px] w-auto border-[3px] border-neoBorder" />
                 
                 {isScanning && (
                   <div className="absolute inset-0 bg-neoCyan/40 animate-pulse flex items-center justify-center backdrop-blur-sm">
                     <ScanLine className="w-16 h-16 stroke-[3px] text-neoPurple animate-bounce" />
                   </div>
                 )}

                 {!isScanning && (
                   <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute top-2 right-2 bg-neoYellow border-[3px] border-neoBorder p-2 shadow-neo-sm text-neoText hover:bg-white"
                   >
                     <RefreshCcw className="w-4 h-4 stroke-[3px]" />
                   </button>
                 )}
                 <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
              </div>
            )}

            {scanResults && (
              <div className="bg-white border-[3px] border-neoBorder shadow-neo p-4 text-neoText">
                <div className="flex items-center justify-between border-b-[3px] border-neoBorder pb-2 mb-3">
                  <h3 className="font-black uppercase tracking-widest text-lg">Scan Results</h3>
                  <div className={`px-3 py-1 font-black uppercase text-sm border-[3px] border-neoBorder ${scanStatus === 'success' ? 'bg-neoCyan' : 'bg-red-400 text-white'}`}>
                    {scanResults.score}% Match
                  </div>
                </div>
                
                <ul className="space-y-3 text-sm font-bold uppercase">
                  <li className="flex flex-col gap-1 border-b-[2px] border-neoBg pb-2">
                    <div className="flex justify-between items-center text-xs text-neoMuted">
                      <span>Target Name</span> 
                      <span className={`px-2 py-0.5 border-[2px] border-neoBorder ${scanResults.nameScore > 60 ? 'bg-neoCyan' : 'bg-red-200'}`}>
                        {scanResults.reasons.name}
                      </span>
                    </div>
                    <div className="text-base">{user?.name}</div>
                  </li>
                  <li className="flex flex-col gap-1 border-b-[2px] border-neoBg pb-2">
                    <div className="flex justify-between items-center text-xs text-neoMuted">
                      <span>Target PRN</span> 
                      <span className={`px-2 py-0.5 border-[2px] border-neoBorder ${scanResults.prnMatch ? 'bg-neoCyan' : 'bg-red-200'}`}>
                        {scanResults.reasons.prn}
                      </span>
                    </div>
                    <div className="text-base">{user?.prn || 'Not Provided'}</div>
                  </li>
                  <li className="flex flex-col gap-1 pb-1">
                    <div className="flex justify-between items-center text-xs text-neoMuted">
                      <span>Target College</span> 
                      <span className={`px-2 py-0.5 border-[2px] border-neoBorder ${scanResults.collegeScore > 0.5 ? 'bg-neoCyan' : 'bg-red-200'}`}>
                        {scanResults.reasons.college}
                      </span>
                    </div>
                    <div className="truncate text-base">{user?.college}</div>
                  </li>
                </ul>
              </div>
            )}

            <div className="space-y-3">
              {errorMessage && (
                <div className="bg-red-500 border-[3px] border-neoBorder text-white px-3 py-2 text-xs font-black uppercase text-center shadow-neo">
                  {errorMessage}
                </div>
              )}

              {scanStatus === 'success' ? (
                  <button
                    type="button"
                    className="w-full py-4 text-xl font-black uppercase text-neoText shadow-neo border-[3px] border-neoBorder bg-neoYellow hover:bg-neoCyan active:scale-95 transition-all flex items-center justify-center gap-2"
                    onClick={() => navigate('/choose-tribe')}
                  >
                    <CheckCircle2 className="w-6 h-6" /> Proceed to Campus
                  </button>
              ) : scanStatus === 'failed' ? (
                  <button
                    type="button"
                    className="w-full py-4 text-xl font-black uppercase text-white shadow-neo border-[3px] border-neoBorder bg-red-500 hover:bg-neoYellow hover:text-neoText active:scale-95 transition-all flex items-center justify-center gap-2"
                    onClick={handleScan}
                  >
                    <RefreshCcw className="w-6 h-6" /> Rescan Image
                  </button>
              ) : (
                <button
                  type="button"
                  className={`w-full py-4 text-xl font-black uppercase text-neoText shadow-neo border-[3px] border-neoBorder transition-all flex items-center justify-center gap-2
                    ${!selectedFile || isScanning ? 'bg-neoMuted/50 cursor-not-allowed text-neoMuted' : 'bg-neoCyan active:scale-95'}`}
                  disabled={!selectedFile || isScanning}
                  onClick={handleScan}
                >
                  {isScanning ? (
                    <>Scanning...</>
                  ) : (
                    <><ScanLine className="w-6 h-6" /> Run Verification</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
