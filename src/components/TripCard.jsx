/**
 * TripCard.jsx — Card component for displaying a trip in My Trips dashboard.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Wallet, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { getPlacePhoto, PLACEHOLDER_IMAGE } from '../service/GlobalApi';

const BUDGET_COLORS = {
  Budget: 'secondary',
  Moderate: 'outline',
  Luxury: 'accent',
};

export default function TripCard({ trip }) {
  const navigate = useNavigate();
  const [imgUrl, setImgUrl] = useState(PLACEHOLDER_IMAGE);
  const [imgLoading, setImgLoading] = useState(true);

  const { id, userSelection, tripData, createdAt } = trip;
  const destination = userSelection?.destination || tripData?.tripInfo?.destination || 'Unknown';
  const days = userSelection?.days;
  const budget = userSelection?.budget;
  const date = createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  useEffect(() => {
    let cancelled = false;
    getPlacePhoto(destination).then((url) => {
      if (!cancelled) {
        setImgUrl(url);
        setImgLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [destination]);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        {imgLoading && <div className="absolute inset-0 skeleton" />}
        <img
          src={imgUrl}
          alt={destination}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={() => { setImgUrl(PLACEHOLDER_IMAGE); setImgLoading(false); }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {budget && (
          <div className="absolute top-3 right-3">
            <Badge variant={BUDGET_COLORS[budget] || 'default'} className="text-xs">
              {budget}
            </Badge>
          </div>
        )}
        <div className="absolute bottom-3 left-3 text-white">
          <div className="flex items-center gap-1 text-sm font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>{destination}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          {days && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>{days} {days === 1 ? 'day' : 'days'}</span>
            </div>
          )}
          {userSelection?.companion && (
            <div className="flex items-center gap-1">
              <span className="text-[#0D9488]">👥</span>
              <span>{userSelection.companion}</span>
            </div>
          )}
        </div>

        {date && (
          <p className="text-xs text-gray-400">Created {date}</p>
        )}

        <Button
          onClick={() => navigate(`/view-trip/${id}`)}
          className="w-full group/btn"
          variant="default"
          size="sm"
        >
          View Trip
          <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}
