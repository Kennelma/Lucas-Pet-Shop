import React from 'react';

const DecoracionClientes = () => {
  return (
    <div className="w-full rounded-xl mb-3 overflow-hidden" style={{boxShadow: '0 0 8px #D9770640, 0 0 0 1px #D9770633'}}>
      <div className="w-full h-48 bg-gradient-to-r from-yellow-50 to-orange-50 flex items-center justify-center">
        {/* Video decorativo horizontal */}
        <video 
          className="w-full h-full object-cover"
          autoPlay 
          loop 
          muted
          playsInline
        >
          <source src="/v.mp4" type="video/mp4" />
          
        </video>
      </div>
    </div>
  );
};

export default DecoracionClientes;