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
      
      <p className="text-xs text-gray-500">Final pricing confirmed upon inspection</p>
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
  const [scheduledPickups, setScheduledPickups] = useState([]);

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

  const confirmBooking = () => {
    const newPickup = {
      id: Date.now(),
      items: selectedItems,
      size: estimatedSize,
      date: pickupDate,
      time: pickupTime,
      address,
      contact: contactInfo,
      photos: uploadedPhotos
    };
    setScheduledPickups(prev => [...prev, newPickup]);
    setCurrentStep(7);
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

            <p className="text-xs text-amber-600">Special handling fees may apply for certain items.</p>

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

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Add photos</h2>
              <p className="text-gray-600">Optional, but helps us quote accurately</p>
            </div>

            <p className="text-sm text-amber-600">We'll only pick up items visible in photos.</p>

            <div className="space-y-4">
              <label className="w-full flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400">
                <Camera size={32} className="text-gray-400 mb-2" />
                <span className="font-semibold text-gray-600">Upload photos</span>
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
              </label>

              {uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {uploadedPhotos.map(photo => (
                    <div key={photo.id} className="relative">
                      <img src={photo.url} alt={photo.name} className="w-full h-24 object-cover rounded-lg" />
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute -top-2 -right-2 bg-black bg-opacity-50 rounded-full p-1"
                      >
                        <X size={14} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <NavigationButtons onBack={() => setCurrentStep(2)} onNext={() => setCurrentStep(4)} />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule pickup</h2>
              <p className="text-gray-600">Choose date, time & address</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="flex items-center">
                  <Calendar size={20} className="text-gray-400 mr-2" />
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={e => setPickupDate(e.target.value)}
                    className="w-full border rounded-lg p-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <div className="flex items-center">
                  <Clock size={20} className="text-gray-400 mr-2" />
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={e => setPickupTime(e.target.value)}
                    className="w-full border rounded-lg p-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="flex items-start">
                  <MapPin size={20} className="text-gray-400 mr-2 mt-2" />
                  <textarea
                    className="w-full border rounded-lg p-3"
                    rows="2"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Street, City, State"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500">Pickups are usually completed within 30-60 minutes of your selected time.</p>

            <NavigationButtons
              onBack={() => setCurrentStep(3)}
              onNext={() => setCurrentStep(5)}
              nextDisabled={!pickupDate || !pickupTime || !address}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact info</h2>
              <p className="text-gray-600">How can we reach you?</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center border rounded-xl p-3">
                <User size={20} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Name"
                  value={contactInfo.name}
                  onChange={e => setContactInfo({ ...contactInfo, name: e.target.value })}
                  className="w-full outline-none"
                />
              </div>
              <div className="flex items-center border rounded-xl p-3">
                <Phone size={20} className="text-gray-400 mr-2" />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={contactInfo.phone}
                  onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  className="w-full outline-none"
                />
              </div>
              <div className="flex items-center border rounded-xl p-3">
                <Mail size={20} className="text-gray-400 mr-2" />
                <input
                  type="email"
                  placeholder="Email"
                  value={contactInfo.email}
                  onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
                  className="w-full outline-none"
                />
              </div>
            </div>

            <NavigationButtons
              onBack={() => setCurrentStep(4)}
              onNext={() => setCurrentStep(6)}
              nextDisabled={!contactInfo.name || !contactInfo.phone || !contactInfo.email}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review</h2>
              <p className="text-gray-600">Confirm your details</p>
            </div>

            <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Items</h3>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {selectedItems.map(id => {
                    const item = trashTypes.find(t => t.id === id);
                    return <li key={id}>{item?.name}</li>;
                  })}
                </ul>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Load size</span>
                <span className="font-medium text-gray-900">{sizeOptions.find(s => s.id === estimatedSize)?.name}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Schedule</span>
                <div className="font-medium text-gray-900">{pickupDate} at {pickupTime}</div>
                <div className="text-gray-600">{address}</div>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Contact</span>
                <div className="font-medium text-gray-900">{contactInfo.name}</div>
                <div className="text-gray-600">{contactInfo.phone}</div>
                <div className="text-gray-600">{contactInfo.email}</div>
              </div>
              {uploadedPhotos.length > 0 && (
                <div>
                  <span className="text-gray-600 text-sm">Photos</span>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {uploadedPhotos.map(photo => (
                      <img key={photo.id} src={photo.url} alt={photo.name} className="h-16 w-full object-cover rounded-lg" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500">Final pricing upon inspection.</p>

            <NavigationButtons
              onBack={() => setCurrentStep(5)}
              onNext={confirmBooking}
              nextText="Confirm"
            />
          </div>
        );

      case 7:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pickup scheduled!</h2>
              <p className="text-gray-600">We'll be in touch with next steps.</p>
            </div>

            <button
              onClick={resetBooking}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
              Book Another Pickup
            </button>
          </div>
        );

      default:
        return null;
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
            onClick={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : resetBooking())}
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

  const PickupsTab = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 text-center">Scheduled Pickups</h1>
      {scheduledPickups.length === 0 ? (
        <p className="text-center text-gray-600">No pickups scheduled yet.</p>
      ) : (
        <div className="space-y-4">
          {scheduledPickups.map(pickup => (
            <div key={pickup.id} className="border border-gray-200 rounded-xl p-4">
              <div className="font-semibold text-gray-900">{pickup.date} at {pickup.time}</div>
              <div className="text-sm text-gray-600">{pickup.address}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const AccountTab = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
        <User size={32} className="text-emerald-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account</h2>
        <p className="text-gray-600">Manage your profile and settings</p>
      </div>
      <p className="text-gray-500">Account features coming soon.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-sm mx-auto">
        {/* Main Content */}
        <div className="px-5 py-6 pb-24">
          {currentTab === 'home' && <HomeTab />}
          {currentTab === 'pickups' && <PickupsTab />}
          {currentTab === 'account' && <AccountTab />}
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
            <button
              onClick={() => setCurrentTab('pickups')}
              className={`flex-1 py-4 px-4 text-center transition-colors ${
                currentTab === 'pickups'
                  ? 'text-emerald-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List size={22} className="mx-auto mb-1" />
              <span className="text-xs font-bold">Pickups</span>
            </button>
            <button
              onClick={() => setCurrentTab('account')}
              className={`flex-1 py-4 px-4 text-center transition-colors ${
                currentTab === 'account'
                  ? 'text-emerald-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <User size={22} className="mx-auto mb-1" />
              <span className="text-xs font-bold">Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrashPickupApp;
