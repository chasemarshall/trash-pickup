import React, { useState } from 'react';
import { Calendar, MapPin, Truck, Package, Clock, CheckCircle2, User, List, Plus, ArrowLeft, Phone, Mail, Camera, X, DollarSign } from 'lucide-react';

// ===== COMPONENTS =====

// Trailer Visualization Component
const TrailerVisualization = ({ size }) => {
  const sizeOptions = [
    { id: 'small', name: 'Small Load', description: 'Pickup truck bed', trailers: 1 },
    { id: 'medium', name: 'Medium Load', description: 'Small trailer', trailers: 1 },
    { id: 'large', name: 'Large Load', description: 'Large trailer', trailers: 1 },
    { id: 'extra-large', name: 'Extra Large', description: 'Multiple trailers', trailers: 2 }
  ];

  const selectedSize = sizeOptions.find(s => s.id === size);
  
  return (
    <div className="flex flex-col items-center space-y-4 py-6">        
      <div className="flex items-center space-x-3">
        {/* Main Truck */}
        <div className="relative">
          <div className="w-16 h-8 bg-gray-800 rounded-sm flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
          </div>
          <div className="absolute -left-4 top-1 w-6 h-6 bg-gray-900 rounded-l-sm" />
        </div>

        {/* Trailers */}
        {Array.from({ length: selectedSize?.trailers || 1 }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div className="w-3 h-0.5 bg-gray-400" />
            <div className={`ml-2 h-8 rounded-sm flex items-center justify-center ${
              size === 'small' ? 'w-12 bg-emerald-100' :
              size === 'medium' ? 'w-16 bg-emerald-100' :
              size === 'large' ? 'w-20 bg-emerald-100' : 'w-24 bg-emerald-100'
            }`}>
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <p className="font-semibold text-gray-900">{selectedSize?.name}</p>
        <p className="text-sm text-gray-600">{selectedSize?.description}</p>
      </div>
    </div>
  );
};

// Price Estimate Component
const PriceEstimate = ({ selectedItems, estimatedSize, trashTypes, sizeOptions }) => {
  if (selectedItems.length === 0) return null;
  
  const selectedSizeData = sizeOptions.find(s => s.id === estimatedSize);
  const itemsCost = selectedItems.reduce((total, itemId) => {
    const item = trashTypes.find(t => t.id === itemId);
    return total + (item ? item.basePrice : 0);
  }, 0);
  
  const totalItemsCost = itemsCost * selectedSizeData.multiplier;
  const total = selectedSizeData.baseFee + totalItemsCost;
  
  const estimate = {
    baseFee: selectedSizeData.baseFee,
    itemsCost: Math.round(totalItemsCost),
    total: Math.round(total)
  };
  
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center space-x-2">
        <DollarSign size={18} className="text-emerald-600" />
        <h4 className="font-semibold text-gray-900">Price Estimate</h4>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Base pickup fee</span>
          <span className="font-medium">${estimate.baseFee}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Items & size</span>
          <span className="font-medium">${estimate.itemsCost}</span>
        </div>
        <div className="border-t border-emerald-200 pt-2 flex justify-between">
          <span className="font-semibold text-gray-900">Estimated total</span>
          <span className="font-bold text-emerald-600">${estimate.total}</span>
        </div>
      </div>
      
      <p className="text-xs text-gray-500">Final price may vary based on exact items and location</p>
    </div>
  );
};

// Navigation Buttons Component
const NavigationButtons = ({ onBack, onNext, nextDisabled = false, nextText = "Continue", backText = "Back" }) => {
  return (
    <div className="flex space-x-3">
      <button
        onClick={onBack}
        className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl font-bold hover:bg-gray-300 transition-colors"
      >
        {backText}
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-bold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
      >
        {nextText}
      </button>
    </div>
  );
};

// ===== MAIN APP COMPONENT =====
const TrashPickupApp = () => {
  // State
  const [currentTab, setCurrentTab] = useState('home');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [estimatedSize, setEstimatedSize] = useState('small');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [address, setAddress] = useState('');
  const [contactInfo, setContactInfo] = useState({ name: '', phone: '', email: '' });
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  // Data
  const trashTypes = [
    { id: 'furniture', name: 'Furniture', icon: '🪑', basePrice: 25 },
    { id: 'mattresses', name: 'Mattresses', icon: '🛏️', basePrice: 30 },
    { id: 'paint-cans', name: 'Paint Cans', icon: '🎨', basePrice: 15 },
    { id: 'building-debris', name: 'Building Debris', icon: '🧱', basePrice: 40 },
    { id: 'appliances', name: 'Appliances', icon: '📺', basePrice: 35 },
    { id: 'electronics', name: 'Electronics', icon: '💻', basePrice: 20 },
    { id: 'yard-waste', name: 'Yard Waste', icon: '🌿', basePrice: 20 },
    { id: 'general-junk', name: 'General Junk', icon: '🗑️', basePrice: 15 }
  ];

  const sizeOptions = [
    { 
      id: 'small', 
      name: 'Small Load', 
      description: 'Pickup truck bed',
      trailers: 1,
      examples: 'Few furniture pieces, small appliances',
      multiplier: 1.0,
      baseFee: 50
    },
    { 
      id: 'medium', 
      name: 'Medium Load', 
      description: 'Small trailer',
      trailers: 1,
      examples: 'Room cleanout, multiple pieces',
      multiplier: 1.5,
      baseFee: 75
    },
    { 
      id: 'large', 
      name: 'Large Load', 
      description: 'Large trailer',
      trailers: 1,
      examples: 'House cleanout, renovation debris',
      multiplier: 2.0,
      baseFee: 100
    },
    { 
      id: 'extra-large', 
      name: 'Extra Large', 
      description: 'Multiple trailers',
      trailers: 2,
      examples: 'Construction debris, estate cleanout',
      multiplier: 3.0,
      baseFee: 150
    }
  ];

  // Event Handlers
  const toggleItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedPhotos(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (photoId) => {
    setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const resetBooking = () => {
    setCurrentStep(1);
    setSelectedItems([]);
    setEstimatedSize('small');
    setPickupDate('');
    setPickupTime('');
    setAddress('');
    setContactInfo({ name: '', phone: '', email: '' });
    setUploadedPhotos([]);
  };

  // Render Booking Steps (simplified for length)
  const renderBookingStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What needs pickup?</h2>
              <p className="text-gray-600">Select all that apply</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {trashTypes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedItems.includes(item.id)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-sm font-semibold text-gray-800">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-1">from ${item.basePrice}</div>
                </button>
              ))}
            </div>

            <PriceEstimate 
              selectedItems={selectedItems}
              estimatedSize={estimatedSize}
              trashTypes={trashTypes}
              sizeOptions={sizeOptions}
            />

            <button
              onClick={() => setCurrentStep(2)}
              disabled={selectedItems.length === 0}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
            >
              Continue
              {selectedItems.length > 0 && (
                <span className="ml-2 font-medium">({selectedItems.length} selected)</span>
              )}
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Estimate size</h2>
              <p className="text-gray-600">How much stuff do you have?</p>
            </div>

            <TrailerVisualization size={estimatedSize} />

            <div className="space-y-3">
              {sizeOptions.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setEstimatedSize(size.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    estimatedSize === size.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900">{size.name}</div>
                      <div className="text-sm text-gray-600">{size.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{size.examples}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600">${size.baseFee}+</div>
                      <div className="flex space-x-1 mt-1 justify-end">
                        {Array.from({ length: size.trailers }).map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-gray-400 rounded-sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <PriceEstimate 
              selectedItems={selectedItems}
              estimatedSize={estimatedSize}
              trashTypes={trashTypes}
              sizeOptions={sizeOptions}
            />

            <NavigationButtons onBack={() => setCurrentStep(1)} onNext={() => setCurrentStep(3)} />
          </div>
        );

      // Add other steps here...
      default:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">More steps coming!</h2>
              <p className="text-gray-600">This is step {currentStep}</p>
            </div>

            <button
              onClick={resetBooking}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
              Start Over
            </button>
          </div>
        );
    }
  };

  const HomeTab = () => (
    <div className="space-y-6">
      {currentStep === 1 ? (
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">TrashPick</h1>
          <p className="text-gray-600">Simple junk removal</p>
        </div>
      ) : (
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : resetBooking()}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={22} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">New Pickup</h1>
            <p className="text-sm text-gray-500">Step {currentStep} of 7</p>
          </div>
        </div>
      )}

      {renderBookingStep()}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-sm mx-auto">
        {/* Main Content */}
        <div className="px-5 py-6 pb-24">
          {currentTab === 'home' && <HomeTab />}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
          <div className="flex">
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex-1 py-4 px-4 text-center transition-colors ${
                currentTab === 'home' 
                  ? 'text-emerald-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Plus size={22} className="mx-auto mb-1" />
              <span className="text-xs font-bold">Book</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrashPickupApp;
