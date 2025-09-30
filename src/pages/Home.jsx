import React from "react";

function Home() {
  return (
    <div className="flex h-screen">
      <div className="flex flex-col justify-center items-start w-1/2 px-16 bg-gradient-to-r from-gray-100 to-white">
        <h1 className="text-4xl font-bold mb-4">Consorcios organizados y eficientes</h1>
        <p className="text-gray-600 mb-8">Gestión simplificada para tu comunidad</p>
        
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white border rounded-xl shadow hover:bg-gray-100">
            Regístrate
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700">
            Inicia sesión
          </button>
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center">
        <img 
          src="/src/assets/images/landing.png"  
          alt="Edificios" 
          className="max-h-[80%] object-contain"
        />
      </div>
    </div>
  );
}

export default Home;