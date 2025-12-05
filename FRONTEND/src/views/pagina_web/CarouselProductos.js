//  Importaciones necesarias para crear nuestro carousel de productos
import { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';

export default function CarouselProductos() {
    const [products, setProducts] = useState([]);

    // 📱 Configuración para que el carousel se vea bien en todos los dispositivos
    const responsiveOptions = [
        {
            breakpoint: '1400px', // Pantallas: mostramos 4 productos
            numVisible: 4,
            numScroll: 1
        },
        {
            breakpoint: '1199px', // 🖥️ Pantallas medianas: 3 productos
            numVisible: 3,
            numScroll: 1
        },
        {
            breakpoint: '767px', // 📱 Tablets: 2 productos
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '575px', // 📱 Móviles: 1 producto
            numVisible: 1,
            numScroll: 1
        }
    ];

    //  Catálogo completo de productos
    const petProducts = [
        {
            id: 1,
            name: "Multivitaminas Premium",
            price: 450,
            image: "producto1.jpg",
            inventoryStatus: "INSTOCK",
            category: "Vitaminas"
        },
        {
            id: 2,
            name: "Shampoo Especializado",
            price: 280,
            image: "producto2.jpg",
            inventoryStatus: "INSTOCK",
            category: "Cuidado"
        },
        {
            id: 3,
            name: "Jabón Medicinal",
            price: 150,
            image: "producto3.png",
            inventoryStatus: "LOWSTOCK",
            category: "Cuidado"
        },

        {
            id: 4,
            name: "Platos ",
            price: 180,
            image: "producto4.jpg",
            inventoryStatus: "INSTOCK",
            category: "Accesorios"
        },
        {
            id: 5,
            name: "Camas",
            price: 890,
            image: "producto5.jpg",
            inventoryStatus: "INSTOCK",
            category: "Descanso"
        },
        {
            id: 6,
            name: "Juguetes Interactivos",
            price: 320,
            image: "producto6.jpg",
            inventoryStatus: "INSTOCK",
            category: "Entretenimiento"
        },
        {
            id: 7,
            name: "Accesorios Premium",
            price: 250,
            image: "producto7.jpg",
            inventoryStatus: "INSTOCK",
            category: "Accesorios"
        },
        {
            id: 8,
            name: "Casas",
            price: 1200,
            image: "producto8.jpg",
            inventoryStatus: "LOWSTOCK",
            category: "Hogar"
        },
        {
            id: 9,
            name: "Rascadores para Gatos",
            price: 550,
            image: "producto9.jpg",
            inventoryStatus: "INSTOCK",
            category: "Gatos"
        },
        {
            id: 10,
            name: "Transportadores",
            price: 750,
            image: "producto10.jpg",
            inventoryStatus: "INSTOCK",
            category: "Transporte"
        },
        {
            id: 11,
            name: "Alimento Premium",
            price: 980,
            image: "producto11.jpg",
            inventoryStatus: "INSTOCK",
            category: "Alimentación"
        },
        {
            id: 12,
            name: "Alimento para Aves",
            price: 85,
            image: "producto12.jpg",
            inventoryStatus: "INSTOCK",
            category: "Alimentación"
        },
        {
            id: 13,
            name: "Peceras Completas",
            price: 1500,
            image: "producto13.jpg",
            inventoryStatus: "LOWSTOCK",
            category: "Acuarios"
        },

        {
            id: 14,
            name: "Alimento para Peces",
            price: 120,
            image: "producto14.jpg",
            inventoryStatus: "INSTOCK",
            category: "Alimentación"
        },

        {
            id: 15,
            name: "Arena para gatos",
            price: 190,
            image: "producto15.png",
            inventoryStatus: "INSTOCK",
            category: "Higiene"
        },
        {
            id: 16,
            name: "Plaquitas Identificadoras",
            price: 95,
            image: "producto16.jpg",
            inventoryStatus: "INSTOCK",
            category: "Identificación"
        }
    ];


    // 🚀 Se ejecuta cuando el componente se carga por primera vez
    useEffect(() => {
        // 📦 Cargamos TODOS los productos disponibles en el carousel
        setProducts(petProducts);
    }, []);

    // 🎨 Esta función crea la tarjeta visual de cada producto - ¡Como una vitrina digital!
    const productTemplate = (product) => {
        return (
            // 🏪 Contenedor principal: una tarjeta elegante que se anima al pasar el mouse
            <div className="bg-white rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 m-3 group h-80 flex flex-col">
                {/* 🖼️ Área de la imagen del producto */}
                <div className="relative h-48 overflow-hidden shrink-0">
                    <img
                        src={`/images_LP/${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                            // 🛟 Si la imagen no se encuentra, mostramos una imagen por defecto
                            e.target.src = '/images_LP/producto-default.jpg';
                        }}
                    />
                    {/* 🏷️ Etiqueta flotante con la categoría del producto */}
                    <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {product.category}
                    </div>
                </div>
                {/* 📝 Información del producto: solo nombre */}
                <div className="p-4 text-center flex-1 flex flex-col justify-center">
                    <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">{product.name}</h4>
                </div>
            </div>
        );
    };

    return (
        // 🏪 Sección principal del carousel de productos
        <section className="poppins-font py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-transparent">
            <div className="max-w-7xl mx-auto">
                {/* 📢 Encabezado de la sección - Presentamos nuestros productos */}
                <div className="text-center mb-10 sm:mb-12 lg:mb-16 animate-fade-in">
                    <h3 className="text-4xl !font-black text-poppins-800 mb-3 sm:mb-4 tracking-tight">
                        NUESTROS PRODUCTOS
                    </h3>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Descubre nuestra amplia gama de productos de alta calidad para el cuidado y bienestar de tu mascota.
                    </p>
                </div>

                {/* 🎠 El carousel mágico que muestra nuestros productos */}
                <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
                    <Carousel
                        value={products}                    // 📦 Los productos a mostrar
                        numScroll={1}                      // 🔄 Cuántos productos mover por vez
                        numVisible={3}                     // 👀 Productos visibles por defecto
                        responsiveOptions={responsiveOptions}  // 📱 Configuración para móviles/tablets
                        itemTemplate={productTemplate}     // 🎨 Cómo se ve cada producto
                        autoplayInterval={4000}           // ⏱️ Cambia automáticamente cada 4 segundos
                        circular                          // 🔄 Vuelve al inicio cuando llega al final
                        showNavigators                    // ⬅️➡️ Botones para navegar manualmente
                        showIndicators={false}            // 🚫 Sin puntos indicadores (más limpio)
                        className="custom-carousel"       // 🎨 Estilos personalizados
                    />
                </div>
            </div>

            {/* Estilos aplicados via useEffect para evitar errores de styled-jsx */}

            {/* Estilos globales aplicados via useEffect */}
        </section>
    );
}