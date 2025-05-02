import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RatingStars from "@/components/rating-stars";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type StoreCardProps = {
  id: number;
  name: string;
  address: string;
  averageRating: number;
  ratingCount: number;
  userRating?: number;
};

export default function StoreCard({
  id,
  name,
  address,
  averageRating,
  ratingCount,
  userRating = 0,
}: StoreCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(userRating);
  const [hasRated, setHasRated] = useState(userRating > 0);
  
  const ratingMutation = useMutation({
    mutationFn: async (rating: number) => {
      const res = await apiRequest("POST", `/api/stores/${id}/rate`, { rating });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this store!",
      });
      setHasRated(true);
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Rating failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleRateStore = () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }
    
    ratingMutation.mutate(rating);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-2">{name}</h3>
        <p className="text-slate-600 mb-3 text-sm">{address}</p>
        
        <div className="flex items-center mb-4">
          <div className="mr-2">
            <RatingStars value={averageRating} readOnly size="sm" />
          </div>
          <span className="text-slate-700 font-bold">{averageRating.toFixed(1)}</span>
          <span className="text-slate-500 text-sm ml-1">({ratingCount} reviews)</span>
        </div>
        
        <div className="border-t border-slate-200 pt-4 mt-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">Your Rating:</p>
            <RatingStars 
              value={rating} 
              onChange={setRating} 
              size="sm" 
              readOnly={ratingMutation.isPending}
            />
          </div>
          
          <Button
            className="mt-4 w-full"
            onClick={handleRateStore}
            disabled={ratingMutation.isPending}
          >
            {hasRated ? "Update rating" : "Rate this store"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
