
import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));

const RULES = {
  naturaleza: {
    title: "Naturaleza y paisajes",
    general: "Prioriza parques naturales, senderos señalizados, miradores y recorridos de observación de fauna y flora. Confirma permisos, clima y condiciones antes de salir.",
    cities: {
      bogota: "Explora los cerros orientales y el Jardín Botánico.",
      cali: "Considera el Ecoparque Río Pance y senderos habilitados de los Farallones.",
      medellin: "Visita el Parque Arví y sus senderos señalizados.",
      cartagena: "Incluye una salida a las Islas del Rosario con operador formal.",
      santamarta: "Consulta las condiciones de acceso al Parque Tayrona.",
      leticia: "Busca recorridos de naturaleza en la Amazonía con guías locales."
    }
  },
  gastronomia: {
    title: "Gastronomía local",
    general: "Prueba platos tradicionales en restaurantes locales y pregunta por ingredientes de temporada.",
    cities: {
      bogota: "Prueba ajiaco santafereño, chocolate con queso y cocina de plazas de mercado.",
      cali: "Busca sancocho de gallina, arroz atollado, champús y lulada.",
      medellin: "Prueba bandeja paisa y arepa antioqueña.",
      cartagena: "Explora pescado frito, arroz con coco, patacón y arepa de huevo.",
      santamarta: "Prueba pescado fresco, cayeye y preparaciones tradicionales del Caribe.",
      leticia: "Conoce la gastronomía amazónica en establecimientos locales."
    }
  },
  cultura: {
    title: "Cultura e historia",
    general: "Incluye museos, centros históricos, arquitectura, música y experiencias culturales locales.",
    cities: {
      bogota: "Visita el Museo del Oro, el Museo Botero y La Candelaria.",
      cali: "Conoce el centro histórico, el Museo La Tertulia y espacios dedicados a la salsa.",
      medellin: "Explora la Comuna 13 con guías locales, el Museo de Antioquia y la Plaza Botero.",
      cartagena: "Recorre la Ciudad Amurallada, el Castillo de San Felipe y Getsemaní.",
      santamarta: "Visita el centro histórico y la Quinta de San Pedro Alejandrino.",
      leticia: "Busca experiencias culturales comunitarias y centros de interpretación amazónica."
    }
  },
  aventura: {
    title: "Aventura y actividad",
    general: "Elige actividades acordes con tu condición física y contrata prestadores formales.",
    cities: {
      bogota: "Considera ciclorutas, caminatas urbanas y recorridos guiados.",
      cali: "Consulta actividades de río y caminatas con operadores autorizados.",
      medellin: "Explora rutas de bicicleta, parapente u otras actividades con empresas certificadas.",
      cartagena: "Consulta actividades náuticas con operadores autorizados.",
      santamarta: "Pregunta por caminatas y actividades acuáticas con operadores formales.",
      leticia: "Considera recorridos fluviales y caminatas guiadas."
    }
  },
  familia: {
    title: "Planes familiares",
    general: "Prefiere recorridos moderados, lugares con servicios básicos y actividades apropiadas para las edades del grupo.",
    cities: {
      bogota: "Considera el Jardín Botánico, Maloka y parques urbanos.",
      cali: "Incluye el Zoológico de Cali, parques y actividades culturales.",
      medellin: "Considera el Parque Explora, el Planetario y el Jardín Botánico.",
      cartagena: "Combina recorridos cortos por el centro histórico con descansos.",
      santamarta: "Busca playas y recorridos familiares con servicios adecuados.",
      leticia: "Elige experiencias educativas y de naturaleza apropiadas para niños."
    }
  },
  descanso: {
    title: "Descanso y bienestar",
    general: "Organiza un itinerario tranquilo, con pausas, espacios verdes y servicios de bienestar.",
    cities: {
      bogota: "Alterna cafés, parques urbanos, jardines y espacios culturales.",
      cali: "Busca parques, cafés y espacios de bienestar.",
      medellin: "Considera jardines, cafés y recorridos suaves por barrios tradicionales.",
      cartagena: "Camina temprano por el centro histórico y reserva tiempo para descansar.",
      santamarta: "Prioriza alojamientos y playas con acceso claro y servicios adecuados.",
      leticia: "Planea tiempos de descanso y experiencias de naturaleza de baja exigencia."
    }
  }
};

const REGION_HINTS = [
  { terms: ["cartagena", "barranquilla", "santamarta", "riohacha", "sincelejo", "monteria", "valledupar"], name: "Gran Caribe", hint: "Combina patrimonio, playas, música y gastronomía. Ten en cuenta el clima y las condiciones del mar." },
  { terms: ["medellin", "antioquia", "cali", "pereira", "manizales", "armenia", "quindio", "risaralda", "caldas"], name: "Andes Occidentales", hint: "Combina ciudades, cultura cafetera, naturaleza y gastronomía regional." },
  { terms: ["quibdo", "nuqui", "bahia solano", "buenaventura", "pasto", "popayan"], name: "Pacífico y suroccidente", hint: "Destaca por su biodiversidad y riqueza cultural. Planea con guías locales." },
  { terms: ["bogota", "tunja", "villavicencio", "bucaramanga", "cucuta", "santander", "boyaca"], name: "Andes Orientales", hint: "Ofrece centros históricos, paisajes de montaña y gastronomía." },
  { terms: ["leticia", "amazonas", "mitu", "vaupes", "guaviare", "puerto carreno", "vichada"], name: "Amazonía y Orinoquía", hint: "Requiere planificación responsable y respeto por los ecosistemas y comunidades." }
];

function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function regionFor(destination) {
  const dest = normalize(destination);
  return REGION_HINTS.find(region =>
    region.terms.some(term => dest.includes(normalize(term)))
  ) || null;
}

function findCityKey(destination) {
  const dest = normalize(destination).replace(/\s+/g, "");
  const keys = ["bogota", "cali", "medellin", "cartagena", "santamarta", "leticia"];
  return keys.find(key => dest.includes(key)) || null;
}

function buildRecommendations(destination, interests = []) {
  const dest = String(destination || "Colombia").trim().slice(0, 160);
  const cityKey = findCityKey(dest);
  const region = regionFor(dest);

  const valid = (Array.isArray(interests) ? interests : [])
    .map(item => normalize(item))
    .filter(item => Object.prototype.hasOwnProperty.call(RULES, item));

  const chosen = valid.length ? [...new Set(valid)] : ["naturaleza", "gastronomia", "cultura"];

  const intro = `Recomendaciones para ${dest}:`;
  const items = chosen.slice(0, 5).map((key, index) => {
    const rule = RULES[key];
    const cityText = cityKey && rule.cities[cityKey] ? rule.cities[cityKey] : rule.general;
    return `${index + 1}. ${rule.title}: ${cityText}`;
  });

  if (region) {
    items.push(`Contexto regional (${region.name}): ${region.hint}`);
  } else {
    items.push("Confirma qué atractivos están abiertos y cuáles son las condiciones de acceso en fuentes oficiales.");
  }

  items.push("Antes de desplazarte: verifica horarios, tarifas, disponibilidad, vías, clima y condiciones de seguridad. POP no realiza reservas ni confirma servicios.");

  return `${intro}\n\n${items.join("\n\n")}`;
}

function answerQuestion(destination, interests, question) {
  const q = normalize(question);

  if (/\b(hotel|alojamiento|hospedaje|dormir|airbnb)\b/.test(q)) {
    return `Para encontrar alojamiento en ${destination}, compara ubicación, comentarios recientes, políticas de cancelación y precio total. Verifica directamente con el establecimiento. POP no confirma disponibilidad ni realiza reservas.`;
  }

  if (/\b(transporte|taxi|uber|indrive|didi|bus|llegar|como llegar)\b/.test(q)) {
    return `Para movilizarte en ${destination}, compara transporte público, taxis autorizados y aplicaciones disponibles. Revisa tarifas y datos del conductor antes de iniciar el viaje.`;
  }

  if (/^(seguridad|clima|temporada|horarios?|precios?|tarifas?|disponibilidad|reservas?)$/.test(q)) {
    return `No tengo acceso a información en tiempo real sobre ${destination}. Verifica estos datos en fuentes oficiales y directamente con los prestadores.`;
  }

  return buildRecommendations(destination, interests);
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "POP Turismo Inteligente",
    recommendations: "locales-sin-costo",
    googleSheetsConfigured: Boolean(process.env.GOOGLE_SHEETS_WEB_APP_URL)
  });
});

app.post("/api/recommend", (req, res) => {
  try {
    const destination = String(req.body?.destination || "Colombia").trim();
    const interests = Array.isArray(req.body?.interests) ? req.body.interests : [];
    const question = String(req.body?.question || "");

    if (destination.length > 160 || question.length > 1000) {
      return res.status(400).json({ ok: false, error: "La consulta supera la longitud permitida." });
    }

    const text = answerQuestion(destination, interests, question);
    return res.json({ ok: true, text });
  } catch (error) {
    console.error("Error en /api/recommend:", error);
    return res.status(500).json({ ok: false, error: "No fue posible generar recomendaciones." });
  }
});

app.post("/api/survey", async (req, res) => {
  try {
    const sheetUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL;

    if (!sheetUrl) {
      return res.status(503).json({
        ok: false,
        error: "Falta configurar GOOGLE_SHEETS_WEB_APP_URL en Render."
      });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(sheetUrl);
    } catch {
      return res.status(500).json({ ok: false, error: "La URL de Google Sheets no es válida." });
    }

    const validHost = parsedUrl.hostname === "script.google.com" ||
      parsedUrl.hostname.endsWith(".googleusercontent.com");

    if (parsedUrl.protocol !== "https:" || !validHost) {
      return res.status(400).json({ ok: false, error: "La URL configurada no parece una URL segura de Google Apps Script." });
    }

    const entry = req.body || {};
    const answers = entry.respuestas;

    if (!answers || typeof answers !== "object" || Array.isArray(answers) || Object.keys(answers).length !== 10) {
      return res.status(400).json({ ok: false, error: "La encuesta debe contener exactamente 10 respuestas." });
    }

    const values = Object.values(answers);

    if (values.some(value => !Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 5)) {
      return res.status(400).json({ ok: false, error: "Cada respuesta debe ser un número entre 1 y 5." });
    }

    const payload = {
      destino: String(entry.destino || "").slice(0, 160),
      intereses: Array.isArray(entry.intereses)
        ? entry.intereses.map(x => String(x).slice(0, 80))
        : String(entry.intereses || "").slice(0, 500),
      respuestas: answers,
      promedio: Number(entry.promedio) || values.reduce((sum, value) => sum + Number(value), 0) / 10,
      comentario: String(entry.comentario || entry.observaciones || "").slice(0, 3000)
    };

    const response = await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow"
    });

    const responseText = await response.text();
    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error("Google Apps Script no devolvió una respuesta JSON válida. Revisa que la aplicación web esté publicada.");
    }

    if (!response.ok || result.ok !== true) {
      throw new Error(result.error || result.mensaje || `Google Sheets respondió con estado ${response.status}.`);
    }

    return res.json({ ok: true, message: "Encuesta guardada correctamente en Google Sheets." });
  } catch (error) {
    console.error("Error al guardar encuesta:", error);
    return res.status(502).json({
      ok: false,
      error: `No se pudo guardar la encuesta en Google Sheets: ${error.message}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`POP Turismo Inteligente escuchando en el puerto ${PORT}`);
});
