  'use client';
  import React from "react";
  import Menu from "./components/Menu"; 
  import Link from 'next/link';
  import Image from "next/image";
  import "@/app/Menu.css"
  import "@/app/servicios.css"
  import "@/app/Tarjetas.css"
  
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


  import { useEffect, useState } from 'react';
  import Slider from 'react-slick';

  import { Promocion, getPromociones } from '@/app/api/Promociones';
  import { agregarProductoAlCarrito } from '@/app/api/Carrito';
  import { getProductos,getProductoPorId, Producto } from '@/app/api/productos';
import toast,{Toaster} from 'react-hot-toast';



  import { ParallaxProvider, ParallaxBanner, BannerLayer, Parallax } from 'react-scroll-parallax';

  const HomePage = () => {




  const [promociones, setPromociones] = useState<(Promocion & { productosDetallados: Producto[] })[]>([]);
  const [loadingPromo, setLoadingPromo] = useState(true);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const promos = await getPromociones();

        const promocionesConProductos = await Promise.all(
          promos.map(async (promo) => {
            const productosDetallados = await Promise.all(
              promo.productos.map(async (id) => {
                try {
                  return await getProductoPorId(id);
                } catch {
                  return null; 
                }
              })
            );

            return {
              ...promo,
              productosDetallados: productosDetallados.filter((p): p is Producto => p !== null),
            };
          })
        );

        setPromociones(promocionesConProductos);
      } catch (error) {
        toast.error('Error al cargar promociones');
      } finally {
        setLoadingPromo(false);
      }
    };

    fetchPromos();
  }, []);

  const promocionesVigentes = promociones.filter((promo) => {
    const hoy = new Date();
    return new Date(promo.fech_ini) <= hoy && hoy <= new Date(promo.fecha_final);
  });

  const handleAgregarTodos = async (productos: Producto[]) => {
    for (const producto of productos) {
      try {
        await agregarProductoAlCarrito(
          producto.id,
          producto.nombre,
          producto.categoria,
          producto.precio,
          1
        );
      } catch (error) {
        console.error("Error al agregar producto:", producto.nombre);
      }
    }
   
  };

  const sliderSettings = {
    dots: true,
    infinite: promocionesVigentes.length > 1,
    speed: 500,
    slidesToShow: Math.min(3, promocionesVigentes.length),
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, promocionesVigentes.length),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

   

    
    const background: BannerLayer = {
      image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/105988/banner-background.jpg',
      translateY: [0, 50],
      opacity: [1, 0.3],
      scale: [1.05, 1, 'easeOutCubic'],
      shouldAlwaysCompleteAnimation: true,
    };


    //promociones

    const headline: BannerLayer = {
      translateY: [0, 30],
      scale: [1, 1.05, 'easeOutCubic'],
      shouldAlwaysCompleteAnimation: true,
      expanded: false,
      children: (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-6xl md:text-8xl text-white font-urwclassico">
            ENTRE AMIGOS
          </h1>
          <h2 className="text-2xl md:text-xl text-white font-urwclassico mt-4"> - cafeteria - </h2>

          
          <Link href="./MENU/Menu_prod.tsx" passHref>
          <button className="
          bg-white text-[#5D4037] font-urwclassico 
          py-3 px-8 rounded-full text-lg 
          hover:bg-[#5D4037] hover:text-white 
          transition-all duration-300 shadow-lg 
          hover:scale-105 z-10 relative
          ">
              Ver Menú
          </button>
          </Link>
          </div> 
        ),
    };

    const foreground: BannerLayer = {
      image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/105988/banner-foreground.png',
      translateY: [0, 15],
      scale: [1, 1.1, 'easeOutCubic'],
      shouldAlwaysCompleteAnimation: true,
    };

    const gradientOverlay: BannerLayer = {
      opacity: [0, 0.9],
      shouldAlwaysCompleteAnimation: true,
      expanded: false,
      children: (
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-blue-900" />
      ),
    };

    return (
      <div className="min-h-screen">
        <Toaster position="top-right" />
        {/* MENU */}
        <Menu />

        {/* HOLA MUNCO*/}
        <ParallaxProvider>
          <ParallaxBanner
            layers={[background, headline, foreground, gradientOverlay]}
            className="h-[100vh] w-full"
          />
        {/* GRANOS*/}
        <ParallaxBanner
          layers={[
          {
            image: "/fondo2.png",
            translateY: [0, 0],
            opacity: [1, 0.7],
            scale: [1.05, 1, 'easeOutCubic'],
            shouldAlwaysCompleteAnimation: true,
            expanded: false,
            style: {
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            },
          },


          {
            translateY: [0, 50],
            shouldAlwaysCompleteAnimation: true,
            children: (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Parallax
                translateX={['-500px', '0px']}
                translateY={['0px', '200px']}
                  scale={[0.75, 1]}
                  rotate={[-180, 0]}
                    easing="easeInQuad"
                  >
                  <img src="/grano6.png" alt="Logo animado" className="w-40 mx-auto" />
                </Parallax>


                  {/* Bloques animados */}
                  <GranoADiv />
                  <GranoADiv2 />
                  <GranoADiv3 />
                  <GranoADiv />
                  <GranoADiv2 />
                  <GranoADiv3 />
                  <GranoADiv3 />

          </div>
        ),
      },
    ]}
    className="w-full h-screen"
  />

  <ParallaxBanner 
          layers={[
            {
              image: "/fondo3.png",
              translateY: [0, 0],
              shouldAlwaysCompleteAnimation: true,
              expanded: false,
              style: {
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              },
            },
            {
              children: (

                <div className="clientes absolute inset-0 flex flex-col items-center justify-center">
                  <div className="clientes-container w-full max-w-6xl px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white"> ✧ ── ༻ CONOCENOS ༺ ── ✧ </h1>
                    
                    <div className="cards-container flex flex-col md:flex-row justify-center gap-8">
                      <div className="card">
                        <div className="face front">
                          <Image
                            src="/img10.jpg"
                            alt="MISION"
                            width={800}
                            height={400}
                            className="w-full h-full object-cover max-h-109"
                          />
                          <h3 className="text-2xl font-bold text-center p-4 text-white" >MISION</h3>
                        </div>
                        <div className="face back">
                          <h1>MISION</h1>
                          <p className="text-justify" >Nuestra misión es brindar a cada cliente una experiencia de café de la más alta calidad, elaborada con esmero y pasión, dentro de un entorno que irradia amabilidad y confort, fomentando así la conexión auténtica entre las personas. Para lograrlo, nos comprometemos a seleccionar con dedicación nuestros granos de café, priorizando proveedores locales siempre que sea posible para asegurar frescura y un sabor inigualable. Ofrecemos un servicio cálido, eficiente y atento a los detalles, anticipándonos a las necesidades de quienes nos visitan. Además, creamos un menú diverso y delicioso que complementa a la perfección nuestra oferta de café, utilizando ingredientes frescos y de temporada. </p>
                          <div className="link">
                            <Link href="Clientes/Registro"></Link>
                          </div>
                        </div>
                      </div>

                      {/* Tarjeta de Cliente Anterior */}
                      <div className="card">
                        <div className="face front">
                          <Image
                            src="/img5.jpg"
                            alt="VISION"
                            width={800}
                            height={400}
                            className="w-full h-full object-cover"
                          />
                          <h3 className="text-2xl font-bold text-center p-4 text-white" >VISION</h3>
                        </div>
                        <div className="face back">
                          <h1>VISION</h1>
                          <p className="text-justify">Aspiramos a ser la cafetería líder en Cochabamba, un referente reconocido por cultivar un ambiente de genuina amistad, conexión y bienestar. Buscamos lograr esto a través de una experiencia de café excepcional, acompañado de un servicio atento y profundamente personalizado. Nuestra meta es convertirnos en un pilar cultural y social dentro de la comunidad, un espacio donde cada persona se sienta inspirada, relajada y verdaderamente valorada en cada momento que comparte con nosotros.</p>
                          <div className="link">
                            <Link href="Clientes/Login"></Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          ]}
          className="w-full h-screen"
        />

        
<section id="servicios" className="servicios h-auto w-full py-16 bg-gray-100">
  <div className="text-center p-8">
    <h2 className="text-4xl font-bold mb-4">SERVICIOS</h2>
    <p className="text-xl max-w-2xl mx-auto mb-6">
      Explora en nuestra página todos los servicios que le ofrecemos.
    </p>

    <div className="services-container max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">

      <div className="service-item flex flex-col items-center">
        <div className="circle w-50 h-50 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg">
          <img 
            src="/desayunu.gif" 
            alt="Representación de Audiencia"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="service-title font-bold text-lg text-center">Desayunos</div>
      </div>
      
      <div className="service-item flex flex-col items-center">
        <div className="circle w-50 h-50 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg">
          <img 
            src="/bebidas.webp" 
            alt="Imputación de Cargos"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="service-title font-bold text-lg text-center">Jugos Frutales</div>
      </div>
      
      <div className="service-item flex flex-col items-center">
        <div className="circle w-50 h-50 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg">
          <img 
            src="/pasteleria.webp" 
            alt="Legalización de Captura"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="service-title font-bold text-lg text-center">Panederias y Pasteleria</div>
      </div>
      
      <div className="service-item flex flex-col items-center">
        <div className="circle w-50 h-50 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg">
          <img 
            src="/cafe.gif" 
            alt="Lectura de Fallo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="service-title font-bold text-lg text-center">Compras Online</div>
      </div>
      
      <div className="service-item flex flex-col items-center">
        <div className="circle w-50 h-50 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg">
          <img 
            src="/granocafe.gif" 
            alt="Aplicación Recurso de Casos"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="service-title font-bold text-lg text-center">Cafe en grano hecho en casa</div>
      </div>
      
      
      
      <div className="service-item flex flex-col items-center">
        <div className="circle w-50 h-50 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg">
          <img 
            src="/cocha.jpg" 
            alt="Apelación ante el Tribunal"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="service-title font-bold text-lg text-center">El mejor cafe de COCHABAMBA</div>
      </div>
    </div>
  </div>
</section>




          {/* Seccion de promociones */}
        <section id="prom" className="promociones w-full flex justify-center items-center py-12 bg-[#d1c1a8]">
      <div className="w-full max-w-6xl px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-center text-black mb-8">Promociones</h1>
        {loadingPromo ? (
          <p className="text-center text-gray-500 text-lg">Cargando promociones...</p>
        ) : promocionesVigentes.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No hay promociones disponibles actualmente.</p>
        ) : (
          <Slider {...sliderSettings}>
            {promocionesVigentes.map((promo, idx) => (
              <div key={idx} className="p-4">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden h-full flex flex-col">
                  {promo.full_image_url && (
                    <img
                      src={promo.full_image_url}
                      alt="Imagen promoción"
                      className="w-full h-64 object-cover"
                    />
                  )}
                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{promo.strategykey}</h3>
                      <p className="text-md text-gray-700 mt-2">{promo.descripcion}</p>
                      <p className="text-gray-600 mt-2">Descuento: <strong>{promo.descuento}%</strong></p>
                      <p className="text-sm text-gray-500 mt-1">
                        Válido del <strong>{new Date(promo.fech_ini).toLocaleDateString()}</strong> al{' '}
                        <strong>{new Date(promo.fecha_final).toLocaleDateString()}</strong>
                      </p>

                      <div className="mt-4 space-y-3">
                        {promo.productosDetallados.map((producto, i) => {
                          const precioPromo = (producto.precio * (1 - promo.descuento / 100)).toFixed(2);
                          return (
                            <div key={i} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                              <span className="text-gray-800 font-medium">
                                {producto.nombre}{' '}
                                <span className="text-red-600 line-through mr-1 text-sm">{producto.precio.toFixed(2)} Bs</span>
                                <span className="text-green-600 font-bold text-sm">{precioPromo} Bs</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                   <button
                          onClick={() => {
                            handleAgregarTodos(promo.productosDetallados);
                            const nombre = sessionStorage.getItem('nombreCliente');
                                if (!nombre) {
                                   toast.error("Debes iniciar sesión para agregar productos al carrito.");
                                    return;

                                }
                                 toast.success("¡Todos los productos de la promoción fueron agregados!");
                                }}
                          className="mt-4 w-full py-2 bg-amber-600 text-white font-semibold rounded hover:bg-amber-700 transition-all"
                        >
                          Agregar todos los productos
                        </button>

                  </div>
                </div>
              </div>
            ))}
          </Slider>
        )}
      </div>
    </section>






{/* footer - pie de pagina*/}
<footer className="w-full bg-[#5D4037] text-white py-12 px-4">
  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
    {/* Contacto */}
    <div className="text-center md:text-left">
      <h3 className="text-2xl font-bold mb-4">CONTÁCTANOS</h3>
      <div className="space-y-2">
        <p className="flex items-center justify-center md:justify-start">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          +591 759 208 85
        </p>
        <p className="flex items-center justify-center md:justify-start">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          contacto@entreamigos.com
        </p>
      </div>
    </div>

    {/* Horario */}
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-4">HORARIO</h3>
      <p>Lunes a Viernes: 7:00 - 22:00</p>
      <p>Sábados: 8:00 - 23:00</p>
      <p>Domingos: 8:00 - 21:00</p>
    </div>

    {/* Redes Sociales */}
    <div className="text-center md:text-right">
      <h3 className="text-2xl font-bold mb-4">SÍGUENOS</h3>
      <div className="flex justify-center md:justify-end space-x-4">
        <a href="https://www.facebook.com/capressobolivia/?locale=es_LA" className="hover:text-amber-300 transition">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
          </svg>
        </a>
        <a href="https://www.instagram.com/capressobolivia/" className="hover:text-amber-300 transition">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
          </svg>
        </a>

        
        <a href="/login" className="hover:text-amber-300 transition">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>

        <a href="https://maps.app.goo.gl/iqFDnEfThw3Z5RHp8" className="hover:text-amber-300 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
          </svg>
        </a>

      </div>
    </div>
  </div>

  {/* Derechos de autor */}
  <div className="border-t border-amber-300 mt-8 pt-8 text-center">
    <p>© {new Date().getFullYear()} Cafetería Entre Amigos. Todos los derechos reservados.</p>
  </div>
</footer>



      </ParallaxProvider>
      </div>
    );
  };

  export default HomePage;


  import { useParallax } from 'react-scroll-parallax';

  function GranoADiv() {
    const parallax = useParallax<HTMLDivElement>({
      easing: 'easeOutQuad',
      translateX: [-400, 0],  
      translateY: [0, 0],    
      rotate: [-180, 0],
      scale: [0.5, 1],        
      
    });

    return (
      <div
        ref={parallax.ref}
        className="absolute w-40 h-40"
        style={{
          top: `${Math.random() * 60 + 20}%`,
          left: `${Math.random() * 60 + 20}%`,
          zIndex: Math.floor(Math.random() * 3) + 1
        }}
      >
        <img 
          src="/grano5.png" 
          alt="Grano de café"
          className="w-full h-full object-contain animate-float"
        />
      </div>
    );
  }

  function GranoADiv2() {
    const parallax = useParallax<HTMLDivElement>({
      easing: 'easeOutQuad',
      translateX: [-400, 0],  
      translateY: [0, 0],    
      rotate: [-100, 0],
      scale: [0.8, 1],       
      
    });

    return (
      <div
        ref={parallax.ref}
        className="w-40 h-40 mx-auto mt-0.1"
      >
        {/* Reemplazamos el div por una imagen */}
        <img 
          src="/grano6.png" 
          alt="Grano de café animado"
          className="w-full h-full object-contain animate-float" 
        />
      </div>
    );
  }

  function GranoADiv3() {
    const parallax = useParallax<HTMLDivElement>({
      easing: 'easeOutQuad',
      translateX: [-90, 0],  
      translateY: [0, 0],    
      rotate: [-200, 0],
      scale: [0.8, 1],       
      
    });

    return (
      <div
        ref={parallax.ref}
        className="w-40 h-40 mx-auto mt-0.1"
      >
        {/* Reemplazamos el div por una imagen */}
        <img 
          src="/grano4.png" 
          alt="Grano de café animado"
          className="w-full h-full object-contain animate-float" 
        />
      </div>
    );
  }