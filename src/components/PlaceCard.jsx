/**
 * PlaceCard.jsx — Card for displaying an attraction/place in the itinerary.
 */
import React, { useState } from 'react';
import { MapPin, Clock, Ticket, ExternalLink, Star } from 'lucide-react';
import { Badge } from './ui/badge';
import { PLACEHOLDER_IMAGE } from '../service/GlobalApi';

export default function PlaceCard({ place, imageUrl }) {
  const [imgError, setImgError] = useState(false);
  const img = imgError ? PLACEHOLDER_IMAGE : (imageUrl || PLACEHOLDER_IMAGE);

  const mapsUrl = place.geoCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${place.geoCoordinates.lat},${place.geoCoordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.placeName)}`;

  return (
    <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={img}
          alt={place.placeName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgError(true)}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 sm:truncate">{place.placeName}</h4>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-[#0D9488] hover:text-[#0f766e] transition-colors"
            title="Open in Google Maps"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{place.placeDetails}</p>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
          {place.timeToSpend && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3 text-[#0D9488]" />
              {place.timeToSpend}
            </span>
          )}
          {place.ticketPrice && place.ticketPrice !== 'Free' && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Ticket className="w-3 h-3 text-[#F59E0B]" />
              {place.ticketPrice}
            </span>
          )}
          {place.ticketPrice === 'Free' && (
            <Badge variant="secondary" className="text-xs py-0">Free</Badge>
          )}
          {place.bestTimeToVisit && (
            <span className="flex items-center gap-1 text-xs text-[#0D9488]">
              <Star className="w-3 h-3" />
              Best: {place.bestTimeToVisit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
