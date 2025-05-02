import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

type RatingStarsProps = {
  value: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  showValue?: boolean;
  className?: string;
};

export default function RatingStars({
  value = 0,
  onChange,
  size = "md",
  readOnly = false,
  showValue = false,
  className,
}: RatingStarsProps) {
  const [rating, setRating] = useState(value);
  const [hoverRating, setHoverRating] = useState(0);
  
  useEffect(() => {
    setRating(value);
  }, [value]);
  
  const handleClick = (newRating: number) => {
    if (readOnly) return;
    
    setRating(newRating);
    if (onChange) {
      onChange(newRating);
    }
  };
  
  const getSizeClass = () => {
    switch (size) {
      case "sm": return "w-4 h-4";
      case "lg": return "w-6 h-6";
      default: return "w-5 h-5";
    }
  };
  
  const stars = Array(5).fill(0).map((_, index) => {
    const starNumber = index + 1;
    const isFilled = hoverRating ? starNumber <= hoverRating : starNumber <= rating;
    
    return (
      <Star
        key={index}
        className={cn(
          getSizeClass(),
          "cursor-pointer transition-colors",
          isFilled ? "text-accent fill-accent" : "text-gray-300",
          !readOnly && "hover:text-accent",
          className
        )}
        onClick={() => handleClick(starNumber)}
        onMouseEnter={() => !readOnly && setHoverRating(starNumber)}
        onMouseLeave={() => !readOnly && setHoverRating(0)}
      />
    );
  });
  
  return (
    <div className="flex items-center">
      <div className="flex">{stars}</div>
      {showValue && rating > 0 && (
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
