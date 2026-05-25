/**
 * ItineraryDay.jsx — A single day's itinerary tab/accordion panel.
 */
import React from 'react';
import { MapPin } from 'lucide-react';
import PlaceCard from './PlaceCard';

export default function ItineraryDay({ day, placeImages }) {
  return (
    <div className="space-y-3">
      {/* Day Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#0D9488] text-white text-sm font-bold flex items-center justify-center">
          {day.day}
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Day {day.day}</p>
          <p className="font-semibold text-gray-900">{day.theme}</p>
        </div>
      </div>

      {/* Places */}
      <div className="space-y-3">
        {day.places?.map((place, idx) => (
          <PlaceCard
            key={idx}
            place={place}
            imageUrl={placeImages?.[place.placeName]}
          />
        ))}
        {(!day.places || day.places.length === 0) && (
          <p className="text-sm text-gray-400 italic">No places listed for this day.</p>
        )}
      </div>
    </div>
  );
}
