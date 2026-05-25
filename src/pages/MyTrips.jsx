/**
 * MyTrips.jsx — Dashboard showing all saved trips for the current user.
 * Requires Google login. Fetches trips from localStorage.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Map, Plus, Plane, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import TripCard from '../components/TripCard';
import { useAuth } from '../context/AuthContext';
import { getAllTrips } from '../service/firebaseConfig';
import { toast } from 'sonner';

export default function MyTrips() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenResponse.access_token}`
        );
        const userInfo = await res.json();
        login(userInfo);
        toast.success(`Welcome, ${userInfo.name}!`);
      } catch {
        toast.error('Login failed.');
      }
    },
    onError: () => toast.error('Google login failed.'),
  });

  const loadTrips = () => {
    if (!user) return;
    setLoading(true);
    // Small delay to ensure localStorage is up to date
    setTimeout(() => {
      const userTrips = getAllTrips(user.email);
      setTrips(userTrips);
      setLoading(false);
    }, 100);
  };

  useEffect(() => {
    loadTrips();
  }, [user]);

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Map className="w-8 h-8 text-[#0D9488]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your trips</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your saved trip plans will appear here after signing in.
          </p>
          <Button onClick={() => googleLogin()} size="lg" className="w-full">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
              <p className="text-sm text-gray-500 mt-1">
                {loading ? 'Loading...' : `${trips.length} trip${trips.length !== 1 ? 's' : ''} saved`}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={loadTrips}>
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Refresh
              </Button>
              <Button onClick={() => navigate('/create-trip')} size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                New Trip
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          // Loading skeletons
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border bg-white shadow-sm">
                <div className="h-44 skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-4 skeleton rounded w-3/4" />
                  <div className="h-3 skeleton rounded w-1/2" />
                  <div className="h-8 skeleton rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          // Empty state
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Plane className="w-10 h-10 text-[#0D9488]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No trips yet!</h3>
            <p className="text-gray-500 text-sm mb-6">
              Start planning your dream trip with AI and it will appear here.
            </p>
            <Button onClick={() => navigate('/create-trip')} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Plan Your First Trip
            </Button>
          </div>
        ) : (
          // Trip grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
