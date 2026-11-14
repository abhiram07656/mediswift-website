import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserLocation } from '../types';

interface LocationContextType {
  location: UserLocation;
  isLocating: boolean;
  locationError: string | null;
  detectLocation: () => void;
  updateLocation: (newLocation: Partial<UserLocation>) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
}

const defaultLocation: UserLocation = {
  city: 'Bengaluru',
  area: 'Koramangala 4th Block',
  pincode: '560034',
  address: 'Koramangala 4th Block, Bengaluru, Karnataka 560034',
  lat: 12.9352,
  lng: 77.6245,
  isCustom: false
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<UserLocation>(() => {
    const saved = localStorage.getItem('mediswift_user_location');
    return saved ? JSON.parse(saved) : defaultLocation;
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('mediswift_user_location', JSON.stringify(location));
  }, [location]);

  const detectLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // In real app reverse geocodes lat/lng. Using detected coords with Bengaluru fallback text.
        const detected: UserLocation = {
          city: 'Bengaluru',
          area: 'Detected Location',
          pincode: '560034',
          address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
          lat: latitude,
          lng: longitude,
          isCustom: true
        };
        setLocation(detected);
        setIsLocating(false);
      },
      (error) => {
        let msg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please select your address manually.';
        }
        setLocationError(msg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const updateLocation = (newLoc: Partial<UserLocation>) => {
    setLocation(prev => ({ ...prev, ...newLoc, isCustom: true }));
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        isLocating,
        locationError,
        detectLocation,
        updateLocation,
        isLocationModalOpen,
        setIsLocationModalOpen
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
