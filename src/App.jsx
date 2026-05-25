/**
 * App.jsx — Root application component for TravelMate AI.
 * Sets up routing, auth context, and Sonner toast notifications.
 */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import CreateTrip from './pages/CreateTrip';
import Chat from './pages/Chat';
import TripView from './pages/TripView';
import MyTrips from './pages/MyTrips';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ duration: 4000 }}
        />

        {/* Sticky header shown on all pages */}
        <Header />

        {/* Page routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-trip" element={<CreateTrip />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/view-trip/:tripId" element={<TripView />} />
          <Route path="/my-trips" element={<MyTrips />} />
          <Route path="/admin" element={<Admin />} />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-[#0D9488] mb-4">404</h1>
                  <p className="text-gray-600 mb-6">Page not found.</p>
                  <a href="/" className="text-[#0D9488] underline">Go Home</a>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

