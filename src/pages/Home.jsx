/**
 * Home.jsx — Landing page for TravelMate AI
 * Features hero section, features grid, and how-it-works steps.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import {
  Plane, Brain, Map, Wallet, BarChart3, ArrowRight,
  Star, Users, Globe, Sparkles, MessageSquare, ChevronRight,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Recommendations',
    description: 'Personalized destination and activity suggestions powered by Google Gemini.',
    color: 'text-[#0D9488]',
    bg: 'bg-teal-50',
  },
  {
    icon: Map,
    title: 'Smart Itinerary',
    description: 'Day-by-day schedules tailored to your interests, pace, and travel style.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Wallet,
    title: 'Budget Planner',
    description: 'Transparent cost breakdowns for accommodation, food, activities, and transport.',
    color: 'text-[#F59E0B]',
    bg: 'bg-amber-50',
  },
  {
    icon: Globe,
    title: 'Map Visualization',
    description: 'All your locations pinned on Google Maps with one-click navigation.',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Enter Preferences',
    description: 'Tell us your destination, budget, travel companions, interests, and trip duration.',
    icon: Users,
  },
  {
    step: '02',
    title: 'AI Generates Plan',
    description: 'Our Gemini-powered AI crafts a complete itinerary with hotels, activities, and costs.',
    icon: Sparkles,
  },
  {
    step: '03',
    title: 'Explore Your Trip',
    description: 'View your personalized plan, save it, and refine it with our AI chat assistant.',
    icon: Map,
  },
];

const STATS = [
  { value: '50+', label: 'Destinations' },
  { value: 'AI-Powered', label: 'Planning' },
  { value: '100%', label: 'Personalized' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenResponse.access_token}`
        );
        const userInfo = await res.json();
        login(userInfo);
        toast.success(`Welcome, ${userInfo.name}! 🌍`);
        navigate('/create-trip');
      } catch {
        toast.error('Login failed.');
      }
    },
    onError: () => toast.error('Google login failed.'),
  });

  const handleGetStarted = () => {
    if (user) {
      navigate('/create-trip');
    } else {
      googleLogin();
    }
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50 pt-16 pb-20 lg:pt-24 lg:pb-32">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#0D9488]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#0D9488]/10 text-[#0D9488] rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Google Gemini AI</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 animate-fade-in">
            Plan Your Dream Trip
            <span className="block text-[#0D9488]">with AI</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed">
            Tell us your preferences and let TravelMate AI build your perfect itinerary —
            hotels, activities, budget, and day-by-day plans all in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="text-base px-8 py-3 rounded-xl shadow-lg shadow-teal-200 hover:shadow-teal-300 transition-shadow"
            >
              <Plane className="w-5 h-5 mr-2" />
              Get Started — It's Free
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/chat')}
              className="text-base px-8 py-3 rounded-xl"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Try AI Chat
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-[#0D9488]">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-[#0D9488] border-[#0D9488]/30">
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Travel Smarter
            </h2>
            <p className="max-w-xl mx-auto text-gray-500">
              From intelligent recommendations to detailed budgets, TravelMate AI handles every aspect of your trip planning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-teal-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-[#0D9488] border-[#0D9488]/30">
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Your Perfect Trip in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative text-center">
                  {/* Connector line */}
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#0D9488]/30 to-transparent" />
                  )}
                  <div className="relative">
                    <div className="w-20 h-20 bg-white border-2 border-[#0D9488]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Icon className="w-9 h-9 text-[#0D9488]" />
                    </div>
                    <Badge className="mb-3 text-xs">{step.step}</Badge>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-20 bg-[#0D9488]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-teal-100 text-lg mb-8">
            Join thousands of travelers planning smarter with AI.
          </p>
          <Button
            size="lg"
            variant="accent"
            onClick={handleGetStarted}
            className="text-base px-10 py-3 rounded-xl bg-white text-[#0D9488] hover:bg-gray-50 font-semibold"
          >
            <Plane className="w-5 h-5 mr-2" />
            Plan My Trip Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Plane className="w-5 h-5 text-[#0D9488]" />
            TravelMate AI
          </div>
          <p className="text-sm">© {new Date().getFullYear()} TravelMate AI. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
