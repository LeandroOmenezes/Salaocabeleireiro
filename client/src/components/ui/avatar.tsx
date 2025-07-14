import { User } from "lucide-react";

interface AvatarProps {
  userId: number;
  userName: string;
  imageUrl?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ userId, userName, imageUrl, size = "md", className = "" }: AvatarProps) {
  const sizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8", 
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  const iconSizes = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  };

  const finalImageUrl = imageUrl;
  const initials = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden border border-gray-200 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ${className}`}>
      {finalImageUrl ? (
        <img
          key={`${userId}-${Date.now()}`}
          src={`${finalImageUrl}?cache=${Math.random()}`}
          alt={`Foto de ${userName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            
            // Fallback para iniciais se a imagem falhar
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<span class="text-white font-medium text-xs">${initials}</span>`;
            }
          }}
        />
      ) : (
        <span className="text-white font-medium text-xs">{initials}</span>
      )}
    </div>
  );
}