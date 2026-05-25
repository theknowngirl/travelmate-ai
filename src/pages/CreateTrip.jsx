/**
 * CreateTrip.jsx — Multi-field trip preference form for TravelMate AI.
 * Collects destination, days, budget, companion, interests, and mood.
 * Calls Gemini API and saves trip to localStorage.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import {
  MapPin, Calendar, Wallet, Users, Heart, Sparkles, Loader2,
  ChevronRight, Plane,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { generateTripPlan } from '../service/AIModal';
import { saveTrip } from '../service/firebaseConfig';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

const BUDGET_OPTIONS = [
  { value: 'Budget', label: '🎒 Budget', desc: 'Hostels, street food, free attractions' },
  { value: 'Moderate', label: '✈️ Moderate', desc: 'Mid-range hotels, mix of dining' },
  { value: 'Luxury', label: '💎 Luxury', desc: '5-star hotels, fine dining, VIP experiences' },
];

const COMPANION_OPTIONS = [
  { value: 'Solo', label: '🧳 Solo', count: 1 },
  { value: 'Couple', label: '💑 Couple', count: 2 },
  { value: 'Family', label: '👨‍👩‍👧‍👦 Family', count: 4 },
  { value: 'Friends', label: '🎉 Friends', count: 4 },
];

const INTEREST_OPTIONS = [
  'Adventure', 'Culture', 'Food', 'Nature', 'Shopping', 'Relaxation', 'History',
  'Photography', 'Nightlife', 'Sports',
];

const MOOD_OPTIONS = [
  { value: 'Excited', emoji: '🤩' },
  { value: 'Relaxed', emoji: '😌' },
  { value: 'Adventurous', emoji: '🏔️' },
  { value: 'Romantic', emoji: '💕' },
  { value: 'Curious', emoji: '🔍' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateTrip() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // Form state
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [budget, setBudget] = useState('');
  const [companion, setCompanion] = useState('');
  const [interests, setInterests] = useState([]);
  const [mood, setMood] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const destInputRef = useRef(null);

  // Destination autocomplete using a simple API approach
  // (We use a debounced search to Google's Geocoding or just let user type freely)
  const handleDestinationInput = (e) => {
    const val = e.target.value;
    setDestination(val);
    // Clear suggestions on empty
    if (!val) setSuggestions([]);
  };

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const validate = () => {
    if (!destination.trim()) return 'Please enter a destination.';
    if (!days || Number(days) < 1 || Number(days) > 15) return 'Please enter a valid number of days (1–15).';
    if (!budget) return 'Please select a budget level.';
    if (!companion) return 'Please select your travel companion type.';
    if (interests.length === 0) return 'Please select at least one interest.';
    return null;
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenResponse.access_token}`
        );
        const userInfo = await res.json();
        login(userInfo);
        setShowLoginDialog(false);
        toast.success(`Welcome, ${userInfo.name}!`);
        // Proceed with generation after login
        await generateTrip(userInfo);
      } catch {
        toast.error('Login failed.');
      }
    },
    onError: () => toast.error('Google login failed.'),
  });

  const generateTrip = async (currentUser = user) => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    if (!currentUser) {
      setShowLoginDialog(true);
      return;
    }

    setLoading(true);
    try {
      const companionData = COMPANION_OPTIONS.find((c) => c.value === companion);
      const tripParams = {
        destination: destination.trim(),
        days: Number(days),
        budget,
        companion,
        companionCount: companionData?.count || 1,
        interests,
        mood: mood || 'Curious',
      };

      toast.info('TravelMate AI is crafting your perfect trip...', { duration: 8000 });
      const tripData = await generateTripPlan(tripParams);

      const tripId = saveTrip(
        { destination: destination.trim(), days: Number(days), budget, companion, interests, mood },
        tripData,
        currentUser
      );

      toast.success('Your trip plan is ready! 🎉');
      navigate(`/view-trip/${tripId}`);
    } catch (err) {
      console.error('[CreateTrip] Generation error:', err);
      toast.error('Failed to generate trip plan. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateTrip();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0D9488] to-[#0f766e] text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Plane className="w-6 h-6" />
            <Badge className="bg-white/20 text-white border-0 text-xs">AI-Powered Planning</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Plan Your Perfect Trip</h1>
          <p className="text-teal-100">
            Share your preferences and our AI will craft a complete personalized itinerary.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ─ Destination ─ */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#0D9488]" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Where do you want to go?</h2>
                  <p className="text-xs text-gray-500">Enter a city, country, or region</p>
                </div>
              </div>
              <div className="relative">
                <Input
                  ref={destInputRef}
                  placeholder="e.g. Paris, France · Tokyo · Bali"
                  value={destination}
                  onChange={handleDestinationInput}
                  className="text-base h-12"
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* ─ Number of Days ─ */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">How many days?</h2>
                  <p className="text-xs text-gray-500">Between 1 and 15 days</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="1"
                  max="15"
                  placeholder="e.g. 5"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="text-base h-12 w-32"
                  disabled={loading}
                />
                {days && (
                  <span className="text-gray-500 text-sm">
                    {Number(days) === 1 ? '1 day' : `${days} days`}
                  </span>
                )}
              </div>
              {/* Quick day selectors */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[3, 5, 7, 10, 14].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(String(d))}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      days === String(d)
                        ? 'bg-[#0D9488] text-white border-[#0D9488]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#0D9488] hover:text-[#0D9488]'
                    }`}
                    disabled={loading}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ─ Budget ─ */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">What's your budget?</h2>
                  <p className="text-xs text-gray-500">Select the spending level that fits you</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBudget(opt.value)}
                    disabled={loading}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      budget === opt.value
                        ? 'border-[#0D9488] bg-teal-50 ring-1 ring-[#0D9488]/30'
                        : 'border-gray-200 hover:border-[#0D9488]/40 bg-white'
                    }`}
                  >
                    <p className="font-semibold text-gray-900 mb-0.5">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ─ Travel Companion ─ */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Who are you traveling with?</h2>
                  <p className="text-xs text-gray-500">This helps personalize recommendations</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {COMPANION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCompanion(opt.value)}
                    disabled={loading}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      companion === opt.value
                        ? 'border-[#0D9488] bg-teal-50 ring-1 ring-[#0D9488]/30'
                        : 'border-gray-200 hover:border-[#0D9488]/40 bg-white'
                    }`}
                  >
                    <p className="text-xl mb-1">{opt.label.split(' ')[0]}</p>
                    <p className="text-sm font-medium text-gray-900">{opt.value}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ─ Interests ─ */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">What are your interests?</h2>
                  <p className="text-xs text-gray-500">Select all that apply</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      interests.includes(interest)
                        ? 'bg-[#0D9488] text-white border-[#0D9488]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#0D9488] hover:text-[#0D9488]'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              {interests.length > 0 && (
                <p className="text-xs text-[#0D9488] mt-3">{interests.length} selected</p>
              )}
            </CardContent>
          </Card>

          {/* ─ Mood (Optional) ─ */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    What's your travel mood?
                    <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                  </h2>
                  <p className="text-xs text-gray-500">Helps AI fine-tune the vibe of your trip</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {MOOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMood(mood === opt.value ? '' : opt.value)}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      mood === opt.value
                        ? 'bg-[#F59E0B] text-white border-[#F59E0B]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#F59E0B] hover:text-[#F59E0B]'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.value}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ─ Submit ─ */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="px-10 py-3 text-base rounded-xl shadow-lg shadow-teal-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Crafting your trip...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate My Trip
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* ─ Loading Overlay ─ */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center mx-4">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane className="w-8 h-8 text-[#0D9488] animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              TravelMate AI is crafting your perfect trip...
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Analyzing preferences, finding hotels, building your itinerary...
            </p>
            <div className="flex items-center justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#0D9488] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─ Login Dialog ─ */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-[#0D9488]" />
              Sign in to Continue
            </DialogTitle>
            <DialogDescription>
              Sign in with Google to save your trip plan and access it anytime from My Trips.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => googleLogin()} className="w-full mt-2" size="lg">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
