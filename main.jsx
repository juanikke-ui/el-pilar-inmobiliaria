import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Building2, Home, KeyRound, CalendarDays, ShieldCheck, Phone, Mail, MapPin, ArrowRight, CheckCircle2, Menu, X, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import './styles.css';

const FACEBOOK_URL = 'https://www.facebook.com/Inmobiliariaelpilar';
const IDEALISTA_URL = 'https://www.idealista.com/pro/inmobiliaria-el-pilar/';
const WHATSAPP_URL = 'https://wa.me/34665569057?text=Hola%20Grupo%20El%20Pilar%2C%20quiero%20informaci%C3%B3n%20sobre%20vender%20mi%20vivienda%20en%20Toledo';
const CALENDAR_URL = 'https://calendar.app.google/otXJiiL9zJe5h1ut7';

const properties = [
  {
    title: 'Vivienda en Toledo capital',
    location: 'Toledo · Zona residencial',
    price: 'Ver en Idealista',
    detail: 'Inmueble publicado en Idealista · ficha actualizada',
    badge: 'Idealista',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Piso para entrar a vivir',
    location: 'Toledo capital',
    price: 'Ver en Idealista',
    detail: 'Fotografías, precio y disponibilidad desde Idealista',
    badge: 'Venta',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Oportunidades en Toledo',
    location: 'Casco urbano y alrededores',
    price: 'Ver cartera completa',
    detail: 'Acceso directo a todos los anuncios activos',
    badge: 'Cartera',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80'
  }
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(true);

  return (
    <div className="page">
      {showPopup && (
        <div className="popupOverlay">
          <div className="popupBox">
            <button className="popupClose" onClick={() => setShowPopup(false)} aria-label="Cerrar">×</button>
            <h3>Tenemos compradores buscando en Toledo</h3>
            <p>Si está pensando en vender su vivienda, podemos ayudarle a encontrar comprador con una valoración seria y una estrategia clara.</p>
            <div className="popupActions">
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn dark">Contactar por WhatsApp</a>
              <a href="#vender" onClick={() => setShowPopup(false)} className="btn outline">Valorar mi vivienda</a>
            </div>
          </div>
        </div>
      )}

      <a className="floatingWhatsapp" href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="WhatsApp directo">
        <MessageCircle size={24} />
      </a>

      <header className="header">
        <div className="headerInner">
          <div className="brand">
            <div className="brandIcon"><Building2 size={24} /></div>
            <div>
              <div className="brandName">INMOBILIARIA EL PILAR</div>
              <div className="brandTag">Inmobiliaria en Toledo · Venta · Alquiler · Valoración</div>
            </div>
          </div>
          <nav className="nav desktopNav">
            <a href="#propiedades">Propiedades</a>
            <a href="#vendidos">Casos vendidos</a>
            <a href="#vender">Vender vivienda</a>
            <a href="#contacto">Contacto</a>
          </nav>
          <a href={IDEALISTA_URL} target="_blank" rel="noreferrer" className="topButton desktopNav">Ver Idealista</a>
          <button className="mobileButton" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && (
          <div className="mobileNav">
            <a href="#propiedades">Propiedades</a>
            <a href="#vendidos">Casos vendidos</a>
            <a href="#vender">Vender vivienda</a>
            <a href="#contacto">Contacto</a>
          </div>
        )}
      </header>

      <main>
        <section className="hero">
          <div className="heroPattern" />
          <div className="heroInner">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="eyebrow">www.inmobiliariaelpilar.com · Inmobiliaria en Toledo capital</div>
              <h1>Vendemos su vivienda en Toledo con seriedad, cercanía y estrategia.</h1>
              <p>Inmobiliaria El Pilar centra su actividad en Toledo capital, ofreciendo una gestión profesional para propietarios que quieren vender o alquilar su vivienda con valoración realista, máxima visibilidad y acompañamiento completo hasta la firma.</p>
              <div className="heroButtons">
                <a href="#vender" className="btn light">Valorar mi vivienda gratis <ArrowRight size={18} /></a>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn ghost">WhatsApp directo</a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55, delay: 0.1 }} className="heroCardWrap">
              <div className="heroCard">
                <div className="heroImage" />
                <div className="stats">
                  <div className="stat"><Home /><strong>+30</strong><span>Inmuebles y oportunidades</span></div>
                  <div className="stat"><KeyRound /><strong>Toledo</strong><span>Especialistas locales</span></div>
                  <div className="stat"><ShieldCheck /><strong>24h</strong><span>Respuesta ágil</span></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="servicios" className="section">
          <p className="sectionLabel">Nuestros servicios</p>
          <h2>Especialistas en vender viviendas en Toledo capital.</h2>
          <div className="serviceGrid">
            {[
              ['Valoración gratuita', 'Estimación realista del precio de venta en Toledo capital y estrategia para salir al mercado con fuerza.'],
              ['Máxima visibilidad', 'Publicación en Idealista, redes sociales, Google y canales propios para atraer compradores cualificados.'],
              ['Venta acompañada', 'Filtro de interesados, visitas, negociación, documentación, arras y acompañamiento hasta notaría.'],
              ['Casos vendidos', 'Mostramos operaciones reales cerradas para generar confianza y demostrar resultados.']
            ].map(([title, text]) => (
              <div key={title} className="serviceCard">
                <CheckCircle2 />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="propiedades" className="section white">
          <div className="sectionHeader">
            <div>
              <p className="sectionLabel">Propiedades destacadas</p>
              <h2>Cartera conectada con Idealista.</h2>
            </div>
            <a href={IDEALISTA_URL} target="_blank" rel="noreferrer" className="btn outline small">Ver todos en Idealista <ArrowRight size={16} /></a>
          </div>
          <div className="propertyGrid">
            {properties.map((property) => (
              <article key={property.title} className="propertyCard">
                <div className="propertyImage" style={{ backgroundImage: `url(${property.image})` }}><span>{property.badge}</span></div>
                <div className="propertyBody">
                  <h3>{property.title}</h3>
                  <p className="muted">{property.location}</p>
                  <strong>{property.price}</strong>
                  <p>{property.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="vendidos" className="section soldSection">
          <p className="sectionLabel">Casos vendidos</p>
          <h2>Operaciones reales cerradas</h2>
          <p className="intro">Esta sección se podrá alimentar con inmuebles desactivados de Idealista para mostrar resultados reales y generar confianza en propietarios.</p>
          <div className="propertyGrid">
            {['Vendido en Toledo en 15 días', 'Reservado con múltiples ofertas', 'Venta cerrada al precio recomendado'].map((item, i) => (
              <div key={i} className="soldCard">
                <div className="soldImage" />
                <p className="soldTitle">{item}</p>
                <p className="muted">Datos importables desde Idealista: inmuebles desactivados.</p>
              </div>
            ))}
          </div>
        </section>

        <section id="vender" className="section leadSection">
          <div className="leadInfo">
            <p className="sectionLabel lightText">Captación de viviendas</p>
            <h2>¿Quiere vender su vivienda en Toledo?</h2>
            <p>Complete sus datos y Grupo El Pilar contactará para concertar una cita, valorar su inmueble y explicarle una estrategia de venta clara, seria y orientada a conseguir comprador.</p>
            <div className="leadList">
              <div><CalendarDays /> Cita presencial, telefónica o por WhatsApp</div>
              <div><ShieldCheck /> Datos tratados con confidencialidad</div>
              <div><Home /> Valoración gratuita basada en Toledo capital</div>
            </div>
          </div>

          <form className="leadForm" onSubmit={(e) => e.preventDefault()}>
            <label>Nombre y apellidos<input placeholder="Nombre completo" /></label>
            <label>Teléfono<input placeholder="Teléfono de contacto" /></label>
            <label className="full">Email<input placeholder="correo@ejemplo.com" /></label>
            <label className="full">Dirección del inmueble<input placeholder="Calle, número, zona de Toledo" /></label>
            <label>Tipo de vivienda<select><option>Piso</option><option>Casa / chalet</option><option>Local</option><option>Terreno</option></select></label>
            <label>Horario preferido<select><option>Mañana</option><option>Tarde</option><option>Indiferente</option></select></label>
            <label className="full">Mensaje<textarea placeholder="Cuéntenos brevemente su caso" /></label>
            <label className="privacy"><input type="checkbox" /> Acepto la política de privacidad y autorizo el contacto para gestionar mi solicitud.</label>
            <div className="formButtons">
              <a href={CALENDAR_URL} target="_blank" rel="noreferrer" className="btn dark">Solicitar cita (Google Calendar)</a>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn outline">Enviar por WhatsApp</a>
            </div>
          </form>
        </section>

        <section id="contacto" className="contact">
          <div>
            <h3>INMOBILIARIA EL PILAR</h3>
            <p>Inmobiliaria centrada principalmente en Toledo capital, especializada en compraventa y alquiler de inmuebles.</p>
          </div>
          <div className="contactLinks">
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"><Phone size={18} /> WhatsApp directo</a>
            <div><Mail size={18} /> jcebrian@elpilar.es</div>
            <div><MapPin size={18} /> Toledo capital</div>
            <a href={FACEBOOK_URL} target="_blank" rel="noreferrer"><Building2 size={18} /> Facebook Inmobiliaria El Pilar</a>
            <a href={IDEALISTA_URL} target="_blank" rel="noreferrer"><Home size={18} /> Idealista Inmobiliaria El Pilar</a>
          </div>
          <p className="smallText">Web preparada para Google Analytics, seguimiento de leads, formularios, RGPD, WhatsApp y Google Calendar.</p>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
