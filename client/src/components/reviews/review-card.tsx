import { Review } from "@shared/schema";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
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

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <div className="w-14 h-14 bg-gray-300 rounded-full mr-4 flex items-center justify-center text-gray-500">
          <i className="fas fa-user text-xl"></i>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{review.clientName}</h3>
          <div className="flex text-yellow-400">
            {renderStars(review.rating)}
          </div>
        </div>
      </div>
      <p className="text-gray-700">{review.comment}</p>
    </div>
  );
}
