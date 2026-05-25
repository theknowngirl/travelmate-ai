/**
 * Admin.jsx — Admin dashboard for TravelMate AI.
 * Protected by email allowlist. Shows trip stats, recent trips, feature flags, API status.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Map, Users, Zap, Mic, Globe, Eye, CheckCircle, XCircle,
  Loader2, ShieldAlert, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { getAllTripsAdmin, getTripCount } from '../service/firebaseConfig';
import { testGeminiConnection } from '../service/AIModal';
import { testPlacesApiConnection } from '../service/GlobalApi';

// Admin email whitelist — add your email here or use env variable
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());

// ─── Feature Flags ────────────────────────────────────────────────────────────

const FEATURE_FLAGS = [
  {
    icon: Mic,
    name: 'Voice Input',
    description: 'Allow users to dictate trip preferences using speech recognition.',
    status: 'coming-soon',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Eye,
    name: 'AR Preview',
    description: 'Augmented reality preview of destinations before booking.',
    status: 'coming-soon',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    icon: Globe,
    name: 'Multi-language',
    description: 'Generate itineraries and chat in 20+ languages.',
    status: 'coming-soon',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, iconColor, iconBg }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ApiStatusIndicator({ label, status }) {
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-700">{label}</span>
        <Badge variant="secondary" className="ml-auto text-xs">Checking...</Badge>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      {status ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
      <span className="text-sm text-gray-700">{label}</span>
      <Badge
        className={`ml-auto text-xs ${status ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
        variant="outline"
      >
        {status ? 'Operational' : 'Error / Not configured'}
      </Badge>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trips, setTrips] = useState([]);
  const [apiStatus, setApiStatus] = useState({ gemini: 'loading', places: 'loading' });
  const [featureToggles, setFeatureToggles] = useState({});

  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase());

  useEffect(() => {
    if (!isAdmin) return;

    // Load trips
    const allTrips = getAllTripsAdmin();
    setTrips(allTrips);

    // Test APIs
    const checkApis = async () => {
      const [gemini, places] = await Promise.all([
        testGeminiConnection(),
        testPlacesApiConnection(),
      ]);
      setApiStatus({ gemini, places });
    };
    checkApis();
  }, [isAdmin]);

  const toggleFeature = (name) => {
    setFeatureToggles((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-500 text-sm mb-6">Please sign in to access the admin dashboard.</p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm mb-2">
            You don't have permission to view this page.
          </p>
          <p className="text-xs text-gray-400 mb-6">Logged in as: {user.email}</p>
          <Button onClick={() => navigate('/')} variant="outline">Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <Badge className="bg-[#0D9488]/10 text-[#0D9488] border-0">
                  <ShieldAlert className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              </div>
              <p className="text-sm text-gray-500">Signed in as {user.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setTrips(getAllTripsAdmin()); }}
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── System Overview ── */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              icon={Map}
              label="Total Trips Generated"
              value={getTripCount()}
              iconColor="text-[#0D9488]"
              iconBg="bg-teal-50"
            />
            <StatCard
              icon={Users}
              label="Total Users (Simulated)"
              value={Math.max(1, new Set(trips.map((t) => t.userEmail)).size)}
              iconColor="text-blue-500"
              iconBg="bg-blue-50"
            />
            <StatCard
              icon={BarChart3}
              label="Trips This Month"
              value={trips.filter((t) => {
                const created = new Date(t.createdAt);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
              iconColor="text-[#F59E0B]"
              iconBg="bg-amber-50"
            />
          </div>
        </section>

        {/* ── Recent Trips Table ── */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Trips</h2>
          <Card className="shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Destination</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Days</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {trips.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                        No trips in localStorage yet.
                      </td>
                    </tr>
                  ) : (
                    trips.slice(0, 20).map((trip) => (
                      <tr key={trip.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {trip.userSelection?.destination || trip.tripData?.tripInfo?.destination || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{trip.userSelection?.days}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">{trip.userSelection?.budget}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[150px]">
                          {trip.userEmail}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(trip.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate(`/view-trip/${trip.id}`)}
                            className="text-xs text-[#0D9488] hover:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* ── Feature Flags ── */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Flags</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURE_FLAGS.map((flag) => {
              const Icon = flag.icon;
              const enabled = featureToggles[flag.name] || false;
              return (
                <Card key={flag.name} className="shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 ${flag.bg} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${flag.color}`} />
                      </div>
                      {/* Visual toggle */}
                      <button
                        onClick={() => toggleFeature(flag.name)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          enabled ? 'bg-[#0D9488]' : 'bg-gray-200'
                        }`}
                        aria-label={`Toggle ${flag.name}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{flag.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{flag.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="w-2.5 h-2.5 mr-1" />
                      Coming Soon
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ── API Status ── */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API Status</h2>
          <Card className="shadow-sm max-w-md">
            <CardContent className="p-5">
              <ApiStatusIndicator
                label="Google Gemini AI (gemini-1.5-flash)"
                status={apiStatus.gemini === 'loading' ? 'loading' : apiStatus.gemini}
              />
              <ApiStatusIndicator
                label="Google Places API (New)"
                status={apiStatus.places === 'loading' ? 'loading' : apiStatus.places}
              />
              <ApiStatusIndicator
                label="Google OAuth 2.0"
                status={!!import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID &&
                  import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID !== 'your_google_oauth_client_id'}
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
