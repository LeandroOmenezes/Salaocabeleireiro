import { Review } from "@shared/schema";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [likes, setLikes] = useState(review.likes);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const { toast } = useToast();

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/reviews/${review.id}/like`);
      return await res.json();
    },
    onSuccess: (updatedReview) => {
      setLikes(updatedReview.likes);
      setIsLikeAnimating(true);
      setTimeout(() => setIsLikeAnimating(false), 1000);
      
      // Atualiza a cache da query
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível curtir essa avaliação",
        variant: "destructive",
      });
    }
  });

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }
    
    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }
    
    return stars;
  };

  const handleLikeClick = () => {
    likeMutation.mutate();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center mb-4">
        <div className="w-14 h-14 bg-blue-100 rounded-full mr-4 flex items-center justify-center text-blue-500">
          <i className="fas fa-user text-xl"></i>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{review.clientName}</h3>
          <div className="flex text-yellow-400">
            {renderStars(review.rating)}
          </div>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4">{review.comment}</p>
      
      <div className="flex items-center justify-end mt-2">
        <button 
          onClick={handleLikeClick}
          disabled={likeMutation.isPending}
          className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors duration-200 focus:outline-none"
        >
          <Heart 
            className={`${isLikeAnimating ? 'animate-heartbeat text-red-500 fill-red-500' : likes > 0 ? 'text-red-500 fill-red-500' : ''}`} 
            size={16} 
          />
          <span className="text-sm font-medium">{likes}</span>
        </button>
      </div>
    </div>
  );
}
