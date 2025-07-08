import { Link } from "wouter";
import { Service } from "@shared/schema";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="w-full h-56 bg-gray-200 flex items-center justify-center overflow-hidden">
        {service.imageUrl ? (
          <img 
            src={service.imageUrl} 
            alt={service.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <i className={`${service.icon} text-5xl text-gray-400`}></i>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h3>
        <p className="text-gray-700 mb-4">{service.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-blue-500 font-medium">A partir de R${service.minPrice.toFixed(2)}</span>
          <a href="#appointments" className="text-blue-500 hover:text-blue-700 font-medium flex items-center">
            Agendar <i className="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </div>
  );
}
