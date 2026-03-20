import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  interactive?: boolean;
}

export default function StarRating({ 
  rating, 
  maxRating = 5, 
  onRatingChange, 
  size = 16, 
  interactive = false 
}: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[...Array(maxRating)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;
        
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onRatingChange?.(starValue)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              size={size}
              className={`${isFilled ? 'fill-gold text-gold' : 'text-forest/20'}`}
            />
          </button>
        );
      })}
    </div>
  );
}
