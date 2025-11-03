

export default function MapaGoogle() {
  // 🔗 Aquí cambias el link de Google Maps
  const ubicacionLink = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3869.73868728014!2d-87.1569169!3d14.092597099999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f6fa3016d904471%3A0x7bb3ae3a728f511!2sLucas%20Pet%20Shop!5e0!3m2!1ses-419!2shn!4v1762141430775!5m2!1ses-419!2shn";
        

  return (
    <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-lg">
      <iframe
        src={ubicacionLink}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        title="Ubicación de la tienda"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}
