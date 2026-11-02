# POP – Punto Móvil de Publicidad Turística Inteligente

## Qué incluye
- Interfaz responsive para pantalla de computador, tableta y móvil.
- Recomendaciones personalizadas mediante OpenAI Responses API (requiere clave API).
- Asistente para preguntas sobre el destino.
- Módulo de alojamiento: hoteles/hostales, Airbnb y búsqueda geográfica.
- Módulo de transporte: taxi local, Uber, inDrive y DiDi.
- Cuestionario de evaluación de 10 preguntas tipo Likert (1 a 5), más comentario opcional.
- Descarga de evidencia en JSON y CSV.

## Requisitos
- Node.js 18 o superior.
- Una clave de API de OpenAI con facturación/crédito y acceso al modelo configurado.
- Conexión a internet.

## Instalación
1. Descomprime el proyecto.
2. Abre una terminal dentro de la carpeta `POP_Turismo_Inteligente`.
3. Ejecuta `npm install`.
4. Copia `.env.example` como `.env`.
5. Abre `.env` y pega tu clave en `OPENAI_API_KEY`. No compartas ese archivo ni lo subas a repositorios.
6. Si el modelo indicado no está habilitado en tu proyecto, cambia `OPENAI_MODEL` por uno disponible en tu cuenta.
7. Ejecuta `npm start`.
8. Abre `http://localhost:3000` en tu navegador.

## Seguridad y límites del prototipo
- La clave de OpenAI se mantiene en el servidor y no se incluye en el navegador.
- La conexión usa `POST /v1/responses`. La documentación oficial indica que las claves deben mantenerse en el servidor y nunca exponerse en código cliente.
- Las recomendaciones no equivalen a información turística verificada ni garantizan disponibilidad.
- Los botones de hoteles, Airbnb, taxis, Uber, inDrive y DiDi abren búsquedas o páginas de los proveedores. No hay reserva, pago ni despacho de vehículos desde POP.
- El cuestionario se guarda temporalmente en memoria del navegador durante la sesión. Descarga JSON/CSV después de cada sesión de pruebas y guarda copias de respaldo.
- Para una operación pública se recomienda agregar base de datos, aviso de privacidad, consentimiento, control de abuso/rate limiting, registro de errores y revisión legal de proveedores/enlaces.

## Cuestionario incluido
1. Facilidad para iniciar y utilizar el aplicativo.
2. Claridad de la pantalla de inicio.
3. Facilidad para seleccionar intereses.
4. Pertinencia de las recomendaciones.
5. Claridad de la información de experiencias.
6. Utilidad de la consulta de hoteles y alojamientos.
7. Claridad de las alternativas tipo Airbnb.
8. Facilidad para encontrar opciones de transporte.
9. Confianza en la orientación de IA.
10. Satisfacción general.
11. Comentario abierto opcional.

Aplicar a tres participantes, sin solicitar nombres. Las respuestas y capturas de pantalla pueden anexarse al informe T2. No inventar resultados: recoger los datos reales de las pruebas.

## Referencia técnica
- OpenAI API Overview: https://developers.openai.com/api/reference/overview
- Responses API: https://developers.openai.com/api/reference/resources/responses/methods/create
- Quickstart: https://developers.openai.com/api/docs/quickstart
