import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({limit:'30kb'}));
app.use(express.static(path.join(__dirname,'public')));

// Motor de recomendaciones por reglas: funciona sin claves API ni servicios de pago.
const RULES = {
  naturaleza: {
    title:'Naturaleza y paisajes', emoji:'🌿',
    text:'Prioriza parques naturales, senderos señalizados, miradores y reservas de la zona. Elige recorridos acordes con tu condición física y consulta previamente cierres, clima, permisos y recomendaciones de conservación.'
  },
  gastronomia: {
    title:'Gastronomía local', emoji:'🍽️',
    text:'Explora plazas de mercado, restaurantes tradicionales y rutas de cocina regional. Pregunta por platos típicos, ingredientes de temporada y opciones para necesidades alimentarias; confirma horarios directamente con cada establecimiento.'
  },
  cultura: {
    title:'Cultura y patrimonio', emoji:'🏛️',
    text:'Incluye museos, centros históricos, arquitectura, talleres artesanales y recorridos guiados por la memoria local. Verifica días de apertura, tarifas y disponibilidad de visitas guiadas.'
  },
  aventura: {
    title:'Aventura y actividades', emoji:'🧗',
    text:'Consulta operadores formales para caminatas, ciclismo, rafting u otras actividades disponibles en el destino. Verifica certificaciones, equipos, seguros, condiciones climáticas y nivel de dificultad antes de reservar.'
  },
  familia: {
    title:'Planes para compartir en familia', emoji:'👨‍👩‍👧',
    text:'Busca parques, espacios interactivos, recorridos cortos y actividades aptas para distintas edades. Confirma accesibilidad, servicios sanitarios, tiempos de traslado y restricciones por edad.'
  },
  descanso: {
    title:'Descanso y bienestar', emoji:'🌅',
    text:'Considera playas tranquilas donde aplique, termales, jardines, alojamientos rurales o espacios de bienestar. Revisa condiciones de acceso, seguridad, servicios incluidos y políticas de reserva.'
  }
};
const REGION_HINTS = [
  {keys:['caribe','cartagena','santa marta','riohacha','guajira','barranquilla','san andres','san andrés','providencia','sincelejo','monteria','montería','valledupar'],name:'Gran Caribe',hint:'En la región Caribe puedes explorar playas, patrimonio histórico, música y gastronomía costera; en zonas naturales sigue las indicaciones de conservación y seguridad.'},
  {keys:['medellin','medellín','antioquia','eje cafetero','pereira','manizales','armenia','caldas','risaralda','quindio','quindío','cali','valle del cauca'],name:'Andes Occidentales',hint:'En los Andes Occidentales considera pueblos patrimoniales, paisajes cafeteros, miradores, rutas gastronómicas y experiencias culturales.'},
  {keys:['pacifico','pacífico','choco','chocó','nuqui','nuquí','bahia solano','bahía solano','buenaventura','tumaco','guapi'],name:'Pacífico',hint:'En el Pacífico puedes investigar experiencias de naturaleza, biodiversidad, cultura afrocolombiana y gastronomía local. Confirma temporadas, transporte y condiciones con operadores locales.'},
  {keys:['bogota','bogotá','boyaca','boyacá','santander','bucaramanga','tunja','cundinamarca','norte de santander','cucuta','cúcuta'],name:'Andes Orientales',hint:'En los Andes Orientales explora centros históricos, pueblos, museos, arquitectura, paisajes de montaña y cocina regional.'},
  {keys:['huila','san agustin','san agustín','tierradentro','cauca','popayan','popayán','nariño','pasto','putumayo'],name:'Macizo Colombiano',hint:'En el Macizo Colombiano puedes consultar sitios arqueológicos, paisajes andinos, termales y tradiciones culturales, verificando accesos y condiciones locales.'},
  {keys:['amazonas','leticia','amazonía','amazonia','orinoco','orinoquia','llanos','meta','villavicencio','vichada','guaviare','arauca','casanare'],name:'Amazonía–Orinoquía',hint:'En la Amazonía y Orinoquía prioriza turismo de naturaleza responsable, observación de fauna y experiencias comunitarias con guías y operadores autorizados.'}
];
function normalize(s=''){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function regionFor(destination){const d=normalize(destination);return REGION_HINTS.find(r=>r.keys.some(k=>d.includes(normalize(k))));}
function buildRecommendations(destination, interests){
  const dest=String(destination||'Colombia').trim().slice(0,160);
  const valid=(Array.isArray(interests)?interests:[]).map(x=>normalize(x)).filter(x=>RULES[x]);
  const chosen=valid.length?valid:['naturaleza','gastronomia','cultura'];
  const region=regionFor(dest);
  const intro=`Propuesta orientativa para ${dest}${region?` (referencia regional: ${region.name})`:''}. Se elaboró con reglas predefinidas a partir de tus intereses; no consulta datos en tiempo real.`;
  const items=chosen.slice(0,5).map((key,i)=>`${i+1}. ${RULES[key].emoji} ${RULES[key].title}\n${RULES[key].text}`);
  if(region) items.push(`${items.length+1}. 🧭 Contexto regional\n${region.hint}`);
  return `${intro}\n\n${items.join('\n\n')}\n\nAntes de desplazarte: verifica horarios, tarifas, disponibilidad, estado de las vías, clima y condiciones de seguridad en fuentes oficiales y con los prestadores. POP no realiza reservas ni confirma servicios.`;
}
function answerQuestion(destination, interests, question){
  const q=normalize(question);
  if(/hotel|aloj|hosped|dormir|airbnb/.test(q)) return `Para buscar alojamiento en ${destination}, compara hoteles, hostales y alojamientos turísticos. Revisa ubicación, opiniones recientes, política de cancelación, precio total, impuestos y condiciones de seguridad. Usa la sección “Alojamiento” de POP para abrir búsquedas externas; POP no verifica disponibilidad ni procesa reservas.`;
  if(/transporte|taxi|uber|indrive|didi|bus|como llegar|llegar/.test(q)) return `Para movilizarte en ${destination}, compara transporte público, taxi autorizado y aplicaciones disponibles en la ciudad. Confirma tarifa, punto de recogida, identificación del conductor y rutas en la aplicación oficial. La disponibilidad depende del municipio.`;
  if(/segur|clima|temporada|horario|precio|tarifa|disponib|reserva/.test(q)) return `No tengo acceso a información en tiempo real sobre ${destination}. Antes de viajar, consulta fuentes oficiales de turismo, autoridades locales, operadores y establecimientos para confirmar seguridad, clima, horarios, tarifas y disponibilidad.`;
  return buildRecommendations(destination, interests);
}

app.post('/api/survey', async (req,res) => {
  try {
    const endpoint = process.env.GOOGLE_SHEETS_WEB_APP_URL;
    if (!endpoint) return res.status(503).json({error:'Falta configurar GOOGLE_SHEETS_WEB_APP_URL en Render.'});
    const entry = req.body || {};
    if (!entry.respuestas || Object.keys(entry.respuestas).length !== 10) return res.status(400).json({error:'La encuesta debe incluir las 10 respuestas.'});
    const response = await fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(entry), redirect:'follow'});
    const text = await response.text();
    if (!response.ok) return res.status(502).json({error:'Google Sheets no aceptó el registro: '+response.status});
    let result; try { result=JSON.parse(text); } catch { result={}; }
    if (result.ok === false) return res.status(502).json({error:result.error || 'No se pudo guardar en Google Sheets.'});
    res.json({ok:true});
  } catch (err) { console.error('Error guardando encuesta:',err.message); res.status(500).json({error:'No fue posible guardar la encuesta.'}); }
});

app.get('/api/health', (_req,res) => res.json({configured:true, mode:'reglas', model:'motor-local-pop'}));
app.post('/api/recommend', (req,res) => {
  const {destination='', interests=[], question=''} = req.body || {};
  const safeDestination=String(destination||'Colombia').slice(0,160);
  const safeInterests=Array.isArray(interests)?interests.slice(0,10):[];
  const text=String(question).trim()?answerQuestion(safeDestination,safeInterests,String(question).slice(0,1800)):buildRecommendations(safeDestination,safeInterests);
  res.json({text,mode:'reglas'});
});

const port = Number(process.env.PORT || 3000);
app.listen(port,()=>console.log(`POP disponible en http://localhost:${port} (modo reglas, sin API de pago)`));
