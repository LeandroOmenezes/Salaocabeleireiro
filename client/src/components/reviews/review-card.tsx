import { Review } from "@shared/schema";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [likes, setLikes] = useState(review.likes);
  const [userLiked, setUserLiked] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Buscar likes do usuário
  const { data: userLikes } = useQuery<number[]>({
    queryKey: ['/api/user/likes'],
    enabled: !!user,
  });

  // Verificar se o usuário curtiu esta avaliação
  useEffect(() => {
    if (userLikes) {
      setUserLiked(userLikes.includes(review.id));
    }
  }, [userLikes, review.id]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/reviews/${review.id}/like`);
      return await res.json();
    },
    onSuccess: (response) => {
      setLikes(response.review.likes);
      setUserLiked(response.userLiked);
      setIsLikeAnimating(true);
      setTimeout(() => setIsLikeAnimating(false), 1000);
      
      // Atualiza a cache das queries
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/likes"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível processar o like",
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
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para curtir avaliações",
        variant: "destructive",
      });
      return;
    }
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
          className={`flex items-center gap-1 transition-colors duration-200 focus:outline-none ${
            userLiked 
              ? 'text-red-500 hover:text-red-600' 
              : 'text-gray-500 hover:text-red-500'
          }`}
          title={userLiked ? "Remover curtida" : "Curtir avaliação"}
        >
          <Heart 
            className={`${
              isLikeAnimating 
                ? 'animate-pulse text-red-500 fill-red-500' 
                : userLiked 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-gray-500'
            }`} 
            size={16} 
          />
          <span className="text-sm font-medium">{likes}</span>
        </button>
      </div>
    </div>
  );
}
