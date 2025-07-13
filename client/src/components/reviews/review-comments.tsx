import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageCircle, Heart, Send, User, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ReviewComment } from "@shared/schema";

interface ReviewCommentsProps {
  reviewId: number;
}

export function ReviewComments({ reviewId }: ReviewCommentsProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  // Buscar comentários da review
  const { data: comments = [], isLoading } = useQuery<ReviewComment[]>({
    queryKey: ["/api/reviews", reviewId, "comments"],
    queryFn: () => fetch(`/api/reviews/${reviewId}/comments`).then(res => res.json()),
    enabled: showComments
  });

  // Buscar likes do usuário em comentários
  const { data: userCommentLikes = [] } = useQuery<number[]>({
    queryKey: ["/api/user/comment-likes"],
    enabled: !!user
  });

  // Criar comentário
  const createCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      const res = await apiRequest("POST", `/api/reviews/${reviewId}/comments`, { comment });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", reviewId, "comments"] });
      setNewComment("");
      toast({
        title: "Comentário adicionado!",
        description: "Seu comentário foi publicado com sucesso."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao comentar",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Curtir/descurtir comentário
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const res = await apiRequest("POST", `/api/comments/${commentId}/like`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", reviewId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/comment-likes"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao curtir comentário",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      createCommentMutation.mutate(newComment.trim());
    }
  };

  const handleLikeComment = (commentId: number) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para curtir comentários",
        variant: "destructive"
      });
      return;
    }
    likeCommentMutation.mutate(commentId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="mt-4">
      {/* Botão para mostrar/esconder comentários */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="text-gray-600 hover:text-gray-800 mb-2"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        {comments.length > 0 ? `${comments.length} comentário${comments.length !== 1 ? 's' : ''}` : 'Comentar'}
        {showComments ? (
          <ChevronUp className="h-4 w-4 ml-2" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-2" />
        )}
      </Button>

      {/* Seção de comentários */}
      {showComments && (
        <div className="mt-3 pl-4 border-l-2 border-gray-200">
          {/* Formulário para novo comentário */}
          {user && (
            <form onSubmit={handleSubmitComment} className="mb-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escreva um comentário..."
                    className="min-h-[80px] resize-none"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {newComment.length}/500
                    </span>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newComment.trim() || createCommentMutation.isPending}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    >
                      {createCommentMutation.isPending ? (
                        "Enviando..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Comentar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Lista de comentários */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="h-16 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {comment.userName}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {comment.comment}
                      </p>
                    </div>
                    
                    {/* Botão de curtir comentário */}
                    <div className="flex items-center mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikeComment(comment.id)}
                        disabled={!user || likeCommentMutation.isPending}
                        className={`text-xs ${
                          userCommentLikes.includes(comment.id)
                            ? "text-red-600 hover:text-red-700"
                            : "text-gray-500 hover:text-red-600"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 mr-1 ${
                            userCommentLikes.includes(comment.id) ? "fill-current" : ""
                          }`}
                        />
                        {comment.likes > 0 && comment.likes}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                Seja o primeiro a comentar nesta avaliação!
              </p>
              {!user && (
                <p className="text-sm text-gray-400 mt-2">
                  Faça login para poder comentar.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}