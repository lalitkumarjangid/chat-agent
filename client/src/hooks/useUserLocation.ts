import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  loading: boolean;
  error?: string;
}

export function useUserLocation(): Location {
  const [location, setLocation] = useState<Location>({
    latitude: 0,
    longitude: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchLocationFromIP = async () => {
      try {
        // Using IP-based geolocation (no permission required)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        setLocation({
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          city: data.city || 'Unknown',
          country: data.country_name || 'Unknown',
          loading: false,
        });
      } catch (error) {
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: 'Could not fetch location',
        }));
      }
    };

    fetchLocationFromIP();
  }, []);

  return location;
}
