import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <i className="fas fa-cut mr-2 text-blue-500"></i> Salão de Beleza
            </h3>
            <p className="text-gray-400 mb-4">Transformando sua beleza e elevando sua autoestima desde 2010.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-instagram"></i></a>
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-whatsapp"></i></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li><a href="#services" className="text-gray-400 hover:text-white">Serviços</a></li>
              <li><a href="#prices" className="text-gray-400 hover:text-white">Preços</a></li>
              <li><a href="#appointments" className="text-gray-400 hover:text-white">Agendamentos</a></li>
              <li><a href="#reviews" className="text-gray-400 hover:text-white">Avaliações</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Contato</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-2"></i>
                <span>Rua das Flores, 123<br/>Centro, Cidade - Estado</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone-alt mr-2"></i>
                <span>(99) 9999-9999</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-2"></i>
                <span>contato@salaodebeleza.com</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Horário de Funcionamento</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex justify-between">
                <span>Segunda a Sexta:</span>
                <span>09:00 - 19:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sábado:</span>
                <span>09:00 - 18:00</span>
              </li>
              <li className="flex justify-between">
                <span>Domingo:</span>
                <span>Fechado</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Salão de Beleza. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
