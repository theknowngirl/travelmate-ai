/**
 * TripView.jsx — Full generated itinerary view page.
 * Shows destination header, hotels, day-by-day itinerary, and budget breakdown.
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Users, Wallet, Star, ExternalLink, ArrowLeft,
  Hotel, Map, Loader2, Info, DollarSign, Utensils, Bus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import ItineraryDay from '../components/ItineraryDay';
import { getTripById } from '../service/firebaseConfig';
import { getPlacePhoto, getMultiplePlacePhotos, PLACEHOLDER_IMAGE } from '../service/GlobalApi';
import { toast } from 'sonner';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating }) {
  const full = Math.floor(rating || 0);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < full ? 'text-[#F59E0B] fill-[#F59E0B]' :
            i === full && half ? 'text-[#F59E0B] fill-[#F59E0B]/50' :
            'text-gray-300'
          }`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating?.toFixed(1)}</span>
    </div>
  );
}

function HotelCard({ hotel, imageUrl }) {
  const [imgError, setImgError] = useState(false);
  const img = imgError ? PLACEHOLDER_IMAGE : (imageUrl || PLACEHOLDER_IMAGE);
  const mapsUrl = hotel.geoCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${hotel.geoCoordinates.lat},${hotel.geoCoordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.hotelName)}`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <img
          src={img}
          alt={hotel.hotelName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white font-semibold text-sm truncate">{hotel.hotelName}</p>
        </div>
      </div>
      <CardContent className="p-4 space-y-2">
        <StarRating rating={hotel.rating} />
        {hotel.pricePerNight && (
          <p className="text-sm font-semibold text-[#0D9488]">{hotel.pricePerNight} <span className="text-gray-400 font-normal">/ night</span></p>
        )}
        {hotel.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{hotel.description}</p>
        )}
        {hotel.address && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {hotel.address}
          </p>
        )}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[#0D9488] hover:text-[#0f766e] font-medium mt-1"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View on Google Maps
        </a>
      </CardContent>
    </Card>
  );
}

function BudgetRow({ icon: Icon, label, value, iconColor }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TripView() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [heroImage, setHeroImage] = useState(PLACEHOLDER_IMAGE);
  const [hotelImages, setHotelImages] = useState({});
  const [placeImages, setPlaceImages] = useState({});
  const [activeDay, setActiveDay] = useState('1');
  const [loadingImages, setLoadingImages] = useState(true);

  // Load trip data
  useEffect(() => {
    const data = getTripById(tripId);
    if (!data) {
      toast.error('Trip not found.');
      navigate('/my-trips');
      return;
    }
    setTrip(data);
  }, [tripId, navigate]);

  // Fetch images after trip loads
  useEffect(() => {
    if (!trip) return;
    let cancelled = false;

    const fetchImages = async () => {
      setLoadingImages(true);
      const tripInfo = trip.tripData?.tripInfo;
      const hotels = trip.tripData?.hotels || [];
      const itinerary = trip.tripData?.itinerary || [];

      // Hero image
      const dest = trip.userSelection?.destination || tripInfo?.destination;
      if (dest) {
        const heroUrl = await getPlacePhoto(`${dest} landmark`);
        if (!cancelled) setHeroImage(heroUrl);
      }

      // Hotel images
      if (hotels.length > 0) {
        const hotelNames = hotels.map((h) => h.hotelName);
        const imgs = await getMultiplePlacePhotos(hotelNames);
        if (!cancelled) setHotelImages(imgs);
      }

      // Place images for itinerary
      const allPlaceNames = itinerary.flatMap((day) => day.places?.map((p) => p.placeName) || []);
      if (allPlaceNames.length > 0) {
        const imgs = await getMultiplePlacePhotos(allPlaceNames);
        if (!cancelled) setPlaceImages(imgs);
      }

      if (!cancelled) setLoadingImages(false);
    };

    fetchImages();
    return () => { cancelled = true; };
  }, [trip]);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  const { tripData, userSelection } = trip;
  const info = tripData?.tripInfo || {};
  const hotels = tripData?.hotels || [];
  const itinerary = tripData?.itinerary || [];
  const budget = tripData?.budgetBreakdown || {};
  const destination = userSelection?.destination || info.destination;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero Section ── */}
      <div className="relative h-72 sm:h-96 overflow-hidden bg-gray-200">
        {loadingImages && <div className="absolute inset-0 skeleton" />}
        <img
          src={heroImage}
          alt={destination}
          className="w-full h-full object-cover"
          onError={() => setHeroImage(PLACEHOLDER_IMAGE)}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-2 text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Trip info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {info.country && (
              <p className="text-white/80 text-sm mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {info.country}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              {destination}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Calendar className="w-3 h-3 mr-1" />
                {userSelection?.days} {userSelection?.days === 1 ? 'Day' : 'Days'}
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Users className="w-3 h-3 mr-1" />
                {userSelection?.companion || 'Group'}
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Wallet className="w-3 h-3 mr-1" />
                {userSelection?.budget} Budget
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* ── Trip Info ── */}
        {(info.bestTimeToVisit || info.weatherInfo || info.generalTips?.length > 0) && (
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="w-5 h-5 text-[#0D9488]" />
                About {destination}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {info.bestTimeToVisit && (
                  <div className="bg-teal-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-[#0D9488] uppercase tracking-wide mb-1">Best Time to Visit</p>
                    <p className="text-sm text-gray-700">{info.bestTimeToVisit}</p>
                  </div>
                )}
                {info.weatherInfo && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Weather</p>
                    <p className="text-sm text-gray-700">{info.weatherInfo}</p>
                  </div>
                )}
              </div>
              {info.generalTips?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Travel Tips</p>
                  <ul className="space-y-1">
                    {info.generalTips.map((tip, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-[#0D9488] mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Hotels ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
              <Hotel className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Where to Stay</h2>
              <p className="text-sm text-gray-500">{hotels.length} recommended hotels</p>
            </div>
          </div>
          {hotels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {hotels.map((hotel, idx) => (
                <HotelCard
                  key={idx}
                  hotel={hotel}
                  imageUrl={hotelImages[hotel.hotelName]}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic text-sm">No hotel recommendations available.</p>
          )}
        </section>

        {/* ── Itinerary ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Map className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Day-by-Day Itinerary</h2>
              <p className="text-sm text-gray-500">{itinerary.length} days planned</p>
            </div>
          </div>

          {itinerary.length > 0 ? (
            <Tabs value={activeDay} onValueChange={setActiveDay}>
              {/* Day Tabs */}
              <div className="overflow-x-auto pb-2 mb-4">
                <TabsList className="h-auto bg-white border border-gray-200 shadow-sm p-1 w-max">
                  {itinerary.map((day) => (
                    <TabsTrigger
                      key={day.day}
                      value={String(day.day)}
                      className="text-xs sm:text-sm px-3 py-2 data-[state=active]:shadow-sm"
                    >
                      Day {day.day}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Day Content */}
              {itinerary.map((day) => (
                <TabsContent key={day.day} value={String(day.day)}>
                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <ItineraryDay day={day} placeImages={placeImages} />
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <p className="text-gray-400 italic text-sm">No itinerary available.</p>
          )}
        </section>

        {/* ── Budget Breakdown ── */}
        {Object.keys(budget).length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Budget Breakdown</h2>
                <p className="text-sm text-gray-500">Estimated costs for your trip</p>
              </div>
            </div>
            <Card className="shadow-sm max-w-md">
              <CardContent className="p-6">
                <BudgetRow icon={Hotel} label="Accommodation" value={budget.accommodation} iconColor="text-blue-500" />
                <BudgetRow icon={Map} label="Activities" value={budget.activities} iconColor="text-[#0D9488]" />
                <BudgetRow icon={Utensils} label="Food & Dining" value={budget.food} iconColor="text-orange-500" />
                <BudgetRow icon={Bus} label="Transport" value={budget.transport} iconColor="text-purple-500" />
                <div className="flex items-center justify-between pt-4 mt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-[#0D9488]" />
                    </div>
                    <span className="font-bold text-gray-900">Total Estimate</span>
                  </div>
                  <span className="font-bold text-[#0D9488] text-lg">{budget.total}</span>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* ── Action Buttons ── */}
        <div className="flex flex-wrap gap-3 pb-8">
          <Button onClick={() => navigate('/create-trip')} variant="outline">
            <Map className="w-4 h-4 mr-2" />
            Plan Another Trip
          </Button>
          <Button onClick={() => navigate('/chat')} variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Refine with AI Chat
          </Button>
        </div>
      </div>
    </div>
  );
}
