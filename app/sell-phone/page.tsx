'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Smartphone, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  UploadCloud, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  MapPin, 
  ArrowLeft, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Percent,
  Star,
  Award
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/components/ProductCard';

// Brands & Models configuration
const BRANDS_MODELS = [
  {
    brand: 'Apple',
    models: [
      { name: 'iPhone 15 Pro Max', basePrice: 95000 },
      { name: 'iPhone 15 Pro', basePrice: 85000 },
      { name: 'iPhone 15', basePrice: 60000 },
      { name: 'iPhone 14 Pro Max', basePrice: 75000 },
      { name: 'iPhone 13', basePrice: 42000 }
    ]
  },
  {
    brand: 'Samsung',
    models: [
      { name: 'Galaxy S24 Ultra', basePrice: 88000 },
      { name: 'Galaxy S24+', basePrice: 68000 },
      { name: 'Galaxy S23 Ultra', basePrice: 62000 },
      { name: 'Galaxy S23', basePrice: 45000 },
      { name: 'Galaxy Z Fold5', basePrice: 78000 }
    ]
  },
  {
    brand: 'OnePlus',
    models: [
      { name: 'OnePlus 12', basePrice: 52000 },
      { name: 'OnePlus 12R', basePrice: 34000 },
      { name: 'OnePlus 11', basePrice: 38000 },
      { name: 'OnePlus Nord CE4', basePrice: 20000 }
    ]
  },
  {
    brand: 'Google',
    models: [
      { name: 'Pixel 8 Pro', basePrice: 65000 },
      { name: 'Pixel 8', basePrice: 50000 },
      { name: 'Pixel 7a', basePrice: 30000 }
    ]
  }
];

const STORAGE_OPTIONS = [
  { size: '128 GB', multiplier: 1.0 },
  { size: '256 GB', multiplier: 1.1 },
  { size: '512 GB', multiplier: 1.25 },
  { size: '1 TB', multiplier: 1.4 }
];

const CONDITIONS = [
  { 
    name: 'Like New', 
    description: 'Flawless body, zero scratches, fully operational, like new battery health.', 
    multiplier: 1.0 
  },
  { 
    name: 'Good', 
    description: 'Minor wear/scratches, no severe dents, screen completely intact.', 
    multiplier: 0.85 
  },
  { 
    name: 'Fair', 
    description: 'Visible scratches or minor dents, screen intact, fully operational.', 
    multiplier: 0.65 
  },
  { 
    name: 'Broken / Cracked', 
    description: 'Cracked screen or back glass, heavy dents, minor button faults.', 
    multiplier: 0.35 
  }
];

export default function SellPhonePage() {
  const { user } = useApp();
  const [step, setStep] = useState(1);
  const [activeRequest, setActiveRequest] = useState<any>(null);

  // Form Fields
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [selectedModel, setSelectedModel] = useState<any>(BRANDS_MODELS[0].models[0]);
  const [selectedStorage, setSelectedStorage] = useState(STORAGE_OPTIONS[0]);
  const [selectedCondition, setSelectedCondition] = useState(CONDITIONS[0]);
  
  // File Upload State
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Pickup Details
  const [pickupDate, setPickupDate] = useState('');
  const [pickupSlot, setPickupSlot] = useState('09:00 AM - 12:00 PM');
  const [addressName, setAddressName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressCity, setAddressCity] = useState('Mumbai');
  const [addressPincode, setAddressPincode] = useState('');

  // Payout Details
  const [payoutMethod, setPayoutMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');

  // Check Local Storage for active order on mount
  useEffect(() => {
    const saved = localStorage.getItem('apsara_sell_request');
    if (saved) {
      setActiveRequest(JSON.parse(saved));
      setStep(4); // Direct tracking
    }
  }, []);

  // Update selected model when brand changes
  const handleBrandChange = (brandName: string) => {
    setSelectedBrand(brandName);
    const brandData = BRANDS_MODELS.find(b => b.brand === brandName);
    if (brandData && brandData.models.length > 0) {
      setSelectedModel(brandData.models[0]);
    }
  };

  // Pricing calculator
  const calculateEstimate = () => {
    if (!selectedModel) return 0;
    const est = selectedModel.basePrice * selectedStorage.multiplier * selectedCondition.multiplier;
    return Math.round(est);
  };

  const currentEstimate = calculateEstimate();

  // Mock File Upload Handlers
  const handleMockUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      setTimeout(() => {
        const newPhotos = [...uploadedPhotos];
        for (let i = 0; i < (e.target.files?.length || 0); i++) {
          const file = e.target.files?.[i];
          if (file) {
            newPhotos.push(file.name);
          }
        }
        setUploadedPhotos(newPhotos);
        setIsUploading(false);
      }, 1200);
    }
  };

  // Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to schedule a pickup.');
      return;
    }

    const newRequest = {
      id: `APS-SELL-${Math.floor(100000 + Math.random() * 900000)}`,
      brand: selectedBrand,
      model: selectedModel.name,
      storage: selectedStorage.size,
      condition: selectedCondition.name,
      estimatedPrice: currentEstimate,
      pickupDate,
      pickupSlot,
      address: {
        name: addressName,
        phone: addressPhone,
        line1: addressLine1,
        line2: addressLine2,
        city: addressCity,
        pincode: addressPincode
      },
      payout: {
        method: payoutMethod,
        account: payoutMethod === 'UPI' ? upiId : `${bankAccount} (${bankName})`
      },
      status: 'scheduled',
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('apsara_sell_request', JSON.stringify(newRequest));
    setActiveRequest(newRequest);
    setStep(4);
  };

  const handleCancelRequest = () => {
    if (confirm('Are you sure you want to cancel this doorstep pickup request?')) {
      localStorage.removeItem('apsara_sell_request');
      setActiveRequest(null);
      setStep(1);
    }
  };

  const handleBookNew = () => {
    localStorage.removeItem('apsara_sell_request');
    setActiveRequest(null);
    setUploadedPhotos([]);
    setStep(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 py-8 md:px-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-pink-600 transition">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Sell Old Phone</span>
        </div>

        {/* Brand/Trust Section on Top (Only visible in early steps) */}
        {step < 4 && (
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <span className="bg-pink-100 text-pink-700 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full animate-pulse">
              Cash For Phones
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Sell Your Old Phone Instantly
            </h1>
            <p className="text-sm text-slate-500">
              Get best market price, free doorstep inspection within 24 hours, and secure instant payments directly to your account.
            </p>
          </div>
        )}

        {/* Step Indicator Progress Bar (Wizard Only) */}
        {step < 4 && (
          <div className="max-w-3xl mx-auto mb-10 px-2">
            <div className="flex items-center justify-between text-[11px] font-black text-slate-400">
              <span className={step >= 1 ? 'text-pink-600' : ''}>1. Device Info</span>
              <span className={step >= 2 ? 'text-pink-600' : ''}>2. Price Quote</span>
              <span className={step >= 3 ? 'text-pink-600' : ''}>3. Doorstep Pickup</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden flex">
              <div 
                className="bg-pink-600 h-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="max-w-4xl mx-auto px-2">
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Step 1 Form Options */}
              <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-pink-600" /> Specify Your Device
                  </h2>
                  <p className="text-xs text-slate-505">Choose accurate specifications to calculate the best estimate.</p>
                </div>

                {/* Brand selection bubbles */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Select Brand</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {BRANDS_MODELS.map(brandData => (
                      <button
                        key={brandData.brand}
                        type="button"
                        onClick={() => handleBrandChange(brandData.brand)}
                        className={`py-3 text-center border font-bold text-xs rounded-xl cursor-pointer transition ${
                          selectedBrand === brandData.brand
                            ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {brandData.brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model selection dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Select Model</label>
                  <select
                    value={selectedModel ? selectedModel.name : ''}
                    onChange={(e) => {
                      const brandData = BRANDS_MODELS.find(b => b.brand === selectedBrand);
                      const model = brandData?.models.find(m => m.name === e.target.value);
                      if (model) setSelectedModel(model);
                    }}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-slate-50 text-slate-800 font-semibold"
                  >
                    {BRANDS_MODELS.find(b => b.brand === selectedBrand)?.models.map(m => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Storage sizes */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Select Storage Size</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {STORAGE_OPTIONS.map(opt => (
                      <button
                        key={opt.size}
                        type="button"
                        onClick={() => setSelectedStorage(opt)}
                        className={`py-2 text-center border font-bold text-xs rounded-xl cursor-pointer transition ${
                          selectedStorage.size === opt.size
                            ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cosmetic Condition */}
                <div className="space-y-2.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Device Condition</label>
                  <div className="space-y-2">
                    {CONDITIONS.map(cond => (
                      <div 
                        key={cond.name}
                        onClick={() => setSelectedCondition(cond)}
                        className={`p-3.5 border rounded-xl cursor-pointer transition text-left flex items-start space-x-3.5 ${
                          selectedCondition.name === cond.name
                            ? 'border-pink-500 bg-pink-50/50 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type="radio" 
                          readOnly 
                          checked={selectedCondition.name === cond.name} 
                          className="mt-1 accent-pink-600 shrink-0" 
                        />
                        <div>
                          <p className={`font-bold text-xs ${selectedCondition.name === cond.name ? 'text-pink-700' : 'text-slate-800'}`}>
                            {cond.name}
                          </p>
                          <p className="text-[10.5px] text-slate-505 leading-relaxed mt-0.5">{cond.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload Photos mock area */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Upload Device Photos (Optional)</label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-pink-400 rounded-xl p-6 text-center transition cursor-pointer relative bg-slate-50">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleMockUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                      <UploadCloud className="h-8 w-8 text-pink-600" />
                      <p className="text-xs font-bold text-slate-700">Drag & drop files or click to upload</p>
                      <p className="text-[10px] text-slate-400">Front, back, and side angles help verify quality quickly</p>
                    </div>
                  </div>
                  {isUploading && (
                    <div className="flex items-center space-x-2 text-xs text-pink-600 font-bold justify-center pt-2">
                      <div className="h-3 w-3 border-2 border-pink-600 border-t-transparent animate-spin rounded-full"></div>
                      <span>Simulating photo verification...</span>
                    </div>
                  )}
                  {uploadedPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {uploadedPhotos.map((name, i) => (
                        <div key={i} className="flex items-center space-x-1 bg-pink-50 text-pink-700 border border-pink-100 rounded-lg px-2.5 py-1 text-[10px] font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[120px]">{name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs md:text-sm shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-99"
                  >
                    Get Instant Evaluation <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                </div>

              </div>

              {/* Step 1 Right Column: Core Trust parameters */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
                  <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                    Apsara Assurance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3.5">
                      <div className="bg-pink-50 border border-pink-100 p-2 rounded-lg text-pink-600 shrink-0">
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">Best Price Guaranteed</h4>
                        <p className="text-[10px] text-slate-550 leading-normal mt-0.5">We check live second-hand market listings to quote you the highest current valuation.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3.5">
                      <div className="bg-pink-50 border border-pink-100/80 p-2 rounded-lg text-pink-600 shrink-0">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">Free Doorstep Pickup</h4>
                        <p className="text-[10px] text-slate-550 leading-normal mt-0.5">No shipping fees. Our quality check agent visits your doorstep at your convenient time slot.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3.5">
                      <div className="bg-pink-50 border border-pink-100/80 p-2 rounded-lg text-pink-600 shrink-0">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">Fast Secure Payments</h4>
                        <p className="text-[10px] text-slate-550 leading-normal mt-0.5">The moment our agent approves the device condition, payment transfers instantly via UPI/Bank.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-100 border border-slate-200/60 p-4.5 rounded-2xl text-xs text-slate-600 space-y-2 text-left">
                  <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-pink-600" /> Read Checklist Before Sell
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[10.5px] leading-relaxed text-slate-500">
                    <li>Backup all personal data</li>
                    <li>Remove iCloud / Google Accounts</li>
                    <li>Ensure phone turns on & displays home screen</li>
                    <li>Chargers/Boxes are not required, but yield higher pay!</li>
                  </ul>
                </div>
              </div>

            </div>
          )}

          {step === 2 && (
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="space-y-2">
                <span className="text-xs uppercase font-extrabold text-pink-600 tracking-wider">Evaluation Result</span>
                <h2 className="text-2xl font-black text-slate-900">Your Phone's Instantly Quoted Value</h2>
                <div className="flex justify-center items-center py-1 font-bold text-xs text-slate-505 bg-slate-50 rounded-xl max-w-sm mx-auto border border-slate-100 mt-2">
                  <span>{selectedBrand} {selectedModel?.name} ({selectedStorage.size})</span>
                </div>
              </div>

              {/* Price display badge */}
              <div className="bg-pink-50/50 border border-pink-100 rounded-3xl p-6 md:p-8 max-w-md mx-auto space-y-2.5 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-pink-600 text-white font-extrabold uppercase text-[8px] tracking-widest px-3 py-1 rounded-bl-xl">
                  Best Price
                </div>
                <p className="text-[11px] text-slate-505 uppercase tracking-widest font-black">Instant Estimate Quote</p>
                <p className="text-4xl md:text-5xl font-black text-pink-700 tracking-tight">
                  {formatINR(currentEstimate)}
                </p>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Price is valid for 7 days. Quote includes free doorstep verification and immediate payment.
                </p>
              </div>

              {/* Highlight assurances */}
              <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-100 text-left max-w-lg mx-auto">
                <div className="text-center space-y-1">
                  <CheckCircle2 className="h-5 w-5 text-pink-600 mx-auto" />
                  <p className="font-extrabold text-[10px] text-slate-800">Best Price</p>
                  <p className="text-[9px] text-slate-400 leading-none">Guaranteed</p>
                </div>
                <div className="text-center space-y-1">
                  <Truck className="h-5 w-5 text-pink-600 mx-auto" />
                  <p className="font-extrabold text-[10px] text-slate-800">Free Pickup</p>
                  <p className="text-[9px] text-slate-400 leading-none">Within 24 hours</p>
                </div>
                <div className="text-center space-y-1">
                  <ShieldCheck className="h-5 w-5 text-pink-600 mx-auto" />
                  <p className="font-extrabold text-[10px] text-slate-800">Fast Payout</p>
                  <p className="text-[9px] text-slate-400 leading-none">Direct Instant Transfer</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="border border-slate-200 hover:bg-slate-550 text-slate-700 font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                >
                  <ArrowLeft className="h-4 w-4" /> Recalculate Quote
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      alert('Please sign in or register to complete the doorstep scheduling.');
                      return;
                    }
                    setStep(3);
                  }}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-extrabold px-8 py-3 rounded-xl text-xs md:text-sm shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Schedule Doorstep Pickup <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm space-y-8 animate-in fade-in duration-200">
              
              <div className="border-b border-slate-100 pb-4 text-left">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-pink-600" /> Doorstep Pickup Details
                </h2>
                <p className="text-xs text-slate-505">Provide address details and schedule the doorstep physical verification.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                
                {/* Left section: Scheduling & Address */}
                <div className="space-y-5">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-1">
                    1. Scheduling & Address
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Select Date</label>
                      <input 
                        type="date"
                        required
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50 text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Select Time Slot</label>
                      <select 
                        value={pickupSlot}
                        onChange={(e) => setPickupSlot(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50 text-slate-800"
                      >
                        <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM</option>
                        <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM</option>
                        <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Contact Name</label>
                      <input 
                        type="text"
                        required
                        placeholder="Ex: Rajesh Kumar"
                        value={addressName}
                        onChange={(e) => setAddressName(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50 text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Contact Phone</label>
                      <input 
                        type="tel"
                        required
                        placeholder="Ex: 9876543210"
                        value={addressPhone}
                        onChange={(e) => setAddressPhone(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Address Flat / House No / Building</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ex: Flat 402, Sunset Towers"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50 text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Street Name / Area / Locality</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ex: BKC, Bandra East"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50 text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">City</label>
                      <input 
                        type="text"
                        required
                        disabled
                        value={addressCity}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Pincode</label>
                      <input 
                        type="text"
                        required
                        placeholder="Ex: 400051"
                        value={addressPincode}
                        onChange={(e) => setAddressPincode(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50 text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Right section: Payout details */}
                <div className="space-y-5">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-1">
                    2. Payout Details
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase">Payment Option</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('UPI')}
                        className={`py-2 px-3 border font-bold text-xs rounded-lg transition ${
                          payoutMethod === 'UPI'
                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        UPI Transfer
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('BANK')}
                        className={`py-2 px-3 border font-bold text-xs rounded-lg transition ${
                          payoutMethod === 'BANK'
                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        Bank Account
                      </button>
                    </div>
                  </div>

                  {payoutMethod === 'UPI' ? (
                    <div className="space-y-3 animate-in fade-in duration-100">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-650 uppercase">UPI ID</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: name@upi"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50 text-slate-800"
                        />
                      </div>
                      <div className="bg-pink-50/50 border border-pink-100 p-3.5 rounded-xl text-[10px] text-slate-500 leading-normal flex items-start space-x-2">
                        <ShieldCheck className="h-4 w-4 text-pink-600 shrink-0 mt-0.5" />
                        <span>Instant transfer to this UPI address after conditions are verified on doorstep by the inspection agent.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5 animate-in fade-in duration-100">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Bank Name</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: HDFC Bank"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50 text-slate-800"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Account Number</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: 5010029384729"
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50 text-slate-800"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">IFSC Code</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: HDFC0000123"
                          value={bankIfsc}
                          onChange={(e) => setBankIfsc(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-slate-50 text-slate-800"
                        />
                      </div>
                    </div>
                  )}

                  {/* Summary Box */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 mt-4 text-left">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Order Summary</p>
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-extrabold text-slate-800">Phone Estimated Quote:</span>
                      <span className="font-black text-pink-700">{formatINR(currentEstimate)}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-[10px] text-slate-500">
                      <span>Doorstep Logistics Fee:</span>
                      <span className="font-bold text-emerald-600 uppercase">Free</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Navigation Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-100 justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer bg-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-extrabold px-8 py-2.5 rounded-xl text-xs md:text-sm shadow-md transition cursor-pointer"
                >
                  Schedule Doorstep Verification
                </button>
              </div>

            </form>
          )}

          {step === 4 && activeRequest && (
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm space-y-8 animate-in fade-in duration-200 text-left">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="h-5.5 w-5.5 text-pink-600 animate-pulse" /> Track Sell Request
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Order ID: <strong className="text-slate-800 font-black">{activeRequest.id}</strong> • Requested on {new Date(activeRequest.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={handleCancelRequest}
                    className="border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer bg-white"
                  >
                    Cancel Request
                  </button>
                  <button 
                    onClick={handleBookNew}
                    className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Sell Another Phone
                  </button>
                </div>
              </div>

              {/* Detail Summaries */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Device Valued</p>
                  <p className="font-extrabold text-sm text-slate-800">
                    {activeRequest.brand} {activeRequest.model}
                  </p>
                  <p className="text-[11px] text-slate-505">
                    {activeRequest.storage} • Condition: {activeRequest.condition}
                  </p>
                </div>
                <div className="space-y-1 border-y md:border-y-0 md:border-x border-slate-200/50 py-4 md:py-0 md:px-6">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Payout</p>
                  <p className="font-black text-base text-pink-700">
                    {formatINR(activeRequest.estimatedPrice)}
                  </p>
                  <p className="text-[10.5px] text-slate-505 truncate">
                    Method: {activeRequest.payout.method} ({activeRequest.payout.account})
                  </p>
                </div>
                <div className="space-y-1 md:pl-4">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pickup Scheduled</p>
                  <p className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-pink-600 shrink-0" /> {new Date(activeRequest.pickupDate).toLocaleDateString()}
                  </p>
                  <p className="text-[11px] text-slate-505">
                    Time slot: {activeRequest.pickupSlot}
                  </p>
                </div>
              </div>

              {/* Process timeline map */}
              <div className="space-y-4">
                <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">
                  Verification & Payout Timeline
                </h3>
                
                <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 overflow-hidden">
                  
                  {/* Timeline 1: Estimate generated */}
                  <div className="relative flex items-start space-x-4">
                    <div className="absolute -left-[30px] rounded-full bg-emerald-100 p-1 border border-emerald-200 text-emerald-600 shrink-0 z-10 bg-white">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Instant Estimate Generated</h4>
                      <p className="text-[10.5px] text-slate-500 leading-normal mt-0.5">
                        Valuation of {formatINR(activeRequest.estimatedPrice)} established successfully based on cosmetic specifications.
                      </p>
                      <p className="text-[9px] text-slate-400 font-semibold mt-1">Completed</p>
                    </div>
                  </div>

                  {/* Timeline 2: Pickup Scheduled */}
                  <div className="relative flex items-start space-x-4">
                    <div className="absolute -left-[30px] rounded-full bg-emerald-100 p-1 border border-emerald-200 text-emerald-600 shrink-0 z-10 bg-white">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Verification Agent Scheduled</h4>
                      <p className="text-[10.5px] text-slate-500 leading-normal mt-0.5">
                        Pickup agent will arrive on <span className="font-bold text-slate-800">{new Date(activeRequest.pickupDate).toLocaleDateString()}</span> during <span className="font-bold text-slate-800">{activeRequest.pickupSlot}</span>.
                      </p>
                      <p className="text-[9px] text-slate-400 font-semibold mt-1">Assigned & Confirmed</p>
                    </div>
                  </div>

                  {/* Timeline 3: Doorstep check */}
                  <div className="relative flex items-start space-x-4">
                    <div className="absolute -left-[30px] rounded-full bg-pink-50 p-1 border border-pink-200 text-pink-600 shrink-0 z-10 bg-white">
                      <Truck className="h-4.5 w-4.5 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Doorstep Evaluation & Verification</h4>
                      <p className="text-[10.5px] text-slate-500 leading-normal mt-0.5">
                        Apsara technician will physically inspect the device to match functional controls and cosmetic criteria.
                      </p>
                      <p className="text-[9px] text-pink-600 font-bold mt-1">Pending Agent Arrival</p>
                    </div>
                  </div>

                  {/* Timeline 4: Secure payout disbursement */}
                  <div className="relative flex items-start space-x-4">
                    <div className="absolute -left-[30px] rounded-full bg-slate-100 p-1 border border-slate-200 text-slate-400 shrink-0 z-10 bg-white">
                      <CreditCard className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400">Payment Disbursed Securely</h4>
                      <p className="text-[10.5px] text-slate-400 leading-normal mt-0.5">
                        Instant fund disbursement directly to {activeRequest.payout.method} account `{activeRequest.payout.account}` within 5 minutes of verification approval.
                      </p>
                      <p className="text-[9px] text-slate-400 font-semibold mt-1">Awaiting Inspection Approval</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Pickup Address Box */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider mb-3">
                  Verification Destination
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-start space-x-2.5">
                  <MapPin className="h-5 w-5 text-pink-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-slate-800">{activeRequest.address.name} ({activeRequest.address.phone})</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {activeRequest.address.line1}, {activeRequest.address.line2}, {activeRequest.address.city} - {activeRequest.address.pincode}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
