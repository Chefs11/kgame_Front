import type { Question } from "../types";

/** Unidad IV: Aplicaciones de la ética y la legislación en las TIC */
export const UNIDAD_4: Question[] = [
  {
    id: "u4-investigacion",
    unitId: "u4",
    kind: "escenario",
    topic: "Ética y responsabilidad en la investigación en línea",
    difficulty: "intermedio",
    title: "Datos del foro",
    context:
      "Para tu proyecto final quieres analizar publicaciones de un foro de apoyo sobre salud mental. Con un script podrías descargar miles de mensajes.",
    prompt: "¿Cómo procedes?",
    options: [
      {
        id: "a",
        text: "Reviso las reglas del foro, pido aval a mi asesor, anonimizo y uso solo lo necesario.",
        quality: "responsable",
        consequence:
          "Tu análisis es defendible, proteges a personas vulnerables y reduces el riesgo de exponer datos sensibles.",
      },
      {
        id: "b",
        text: "Descargo todo con nombres de usuario y lo publico en un anexo para que sea verificable.",
        quality: "riesgosa",
        consequence:
          "Expones públicamente información de salud de personas identificables que nunca aceptaron participar.",
      },
      {
        id: "c",
        text: "Descargo todo, pero quito los nombres de usuario antes de empezar el análisis.",
        quality: "parcial",
        consequence:
          "Reduces un riesgo, pero recolectas más de lo necesario y los mensajes aún pueden permitir identificar a alguien.",
      },
      {
        id: "d",
        text: "Creo un perfil falso para entrar a los grupos privados y obtener más mensajes.",
        quality: "riesgosa",
        consequence:
          "Obtienes datos mediante engaño y traicionas la confianza de una comunidad de apoyo.",
      },
    ],
    responsibleAlternative:
      "Respetar las reglas del sitio, obtener aval académico, recolectar solo lo indispensable, anonimizar y no publicar mensajes que permitan identificar a nadie.",
    explanation:
      "Que algo sea visible en internet no significa que se pueda usar de cualquier forma. La información de salud es un dato personal sensible, y la investigación debe minimizar el daño a los participantes.",
    principle:
      "LFPDPPP, arts. 2 (fr. VI) y 5: la información de salud es un dato sensible y su tratamiento debe respetar los principios de licitud, consentimiento, proporcionalidad y responsabilidad. En investigación, eso significa recolectar lo mínimo y anonimizar.",
    sources: [{ sourceId: "lfpdppp", pinpoint: "art. 2, fr. VI; arts. 5 y 12" }, { sourceId: "temario" }],
    review: {
      status: "requiere-revision",
      note: "Vincular con los lineamientos de ética de investigación de la institución.",
    },
  },
  {
    id: "u4-redes",
    unitId: "u4",
    kind: "opcion-multiple",
    topic: "Ética en el uso de redes sociales",
    difficulty: "basico",
    title: "El video de la exposición",
    prompt:
      "Grabaste a un compañero que se equivocó al exponer y quieres subirlo a una red social. ¿Qué es lo más ético?",
    options: [
      {
        id: "a",
        text: "No subirlo sin su permiso, porque afecta su imagen y puede exponerlo a burlas.",
        correct: true,
      },
      {
        id: "b",
        text: "Subirlo con un filtro gracioso para que se entienda como una broma entre amigos.",
        correct: false,
      },
      {
        id: "c",
        text: "Subirlo sin etiquetarlo, porque así solo lo reconocerán quienes ya lo conocen.",
        correct: false,
      },
      {
        id: "d",
        text: "Subirlo y borrarlo después si alguien se queja en los comentarios del video.",
        correct: false,
      },
    ],
    explanation:
      "La imagen de una persona forma parte de su vida privada. Lo que para ti es una broma puede convertirse en burla masiva, y una vez publicado no controlas las copias. Borrar después no repara el daño.",
    principle:
      "Respeto a la privacidad y a la dignidad: pide permiso antes de publicar a otra persona. Lo que se sube a internet se copia y no se puede borrar del todo.",
    sources: [{ sourceId: "temario" }],
    review: { status: "requiere-revision", note: "Contenido conceptual de demostración." },
  },
  {
    id: "u4-propiedad-industrial",
    unitId: "u4",
    kind: "opcion-multiple",
    topic: "Propiedad industrial, licenciamiento y derechos de autor",
    difficulty: "intermedio",
    title: "¿Patentar la app?",
    prompt:
      "Tu equipo creó una app con código original. ¿Qué dice la LFPPI sobre los programas de computación?",
    options: [
      {
        id: "a",
        text: "No se consideran invenciones; el código se protege por derecho de autor.",
        correct: true,
      },
      {
        id: "b",
        text: "Se patentan de forma automática al publicarse en una tienda de apps.",
        correct: false,
      },
      {
        id: "c",
        text: "Se registran como marca para impedir que otros usen la misma idea.",
        correct: false,
      },
      {
        id: "d",
        text: "Solo se protegen si el código se publica como software de código abierto.",
        correct: false,
      },
    ],
    explanation:
      "El art. 47 de la LFPPI enumera lo que no se considera invención y su fracción V incluye a los programas de computación. El código se protege como obra mediante la LFDA. La propiedad industrial sí protege, por ejemplo, el nombre o logotipo de la app como marca, y las patentes para invenciones duran veinte años improrrogables (art. 53). La autoridad en la materia es el IMPI (art. 5).",
    principle:
      "LFPPI, art. 47, fr. V: los programas de computación no se consideran invenciones. El código se protege por derecho de autor (LFDA, art. 102) y el nombre o logotipo de la app, como marca ante el IMPI.",
    sources: [
      { sourceId: "lfppi", pinpoint: "arts. 5, 47 fr. V y 53" },
      { sourceId: "lfda", pinpoint: "art. 102" },
    ],
    review: {
      status: "requiere-revision",
      note: "Artículos cotejados. El análisis de soluciones técnicas implementadas con software corresponde al IMPI; no se incluye en el juego.",
    },
  },
  {
    id: "u4-copyleft",
    unitId: "u4",
    kind: "opcion-multiple",
    topic: "Copyright, Copyleft y licencias de software",
    difficulty: "intermedio",
    title: "¿Qué es copyleft?",
    prompt: "¿Qué caracteriza a una licencia copyleft como la GNU GPL?",
    options: [
      {
        id: "a",
        text: "Permite usar, modificar y distribuir, si las obras derivadas conservan la licencia.",
        correct: true,
      },
      {
        id: "b",
        text: "Prohíbe modificar el código y solo permite usarlo en un equipo a la vez.",
        correct: false,
      },
      {
        id: "c",
        text: "Elimina los derechos de autor y deja el código en el dominio público.",
        correct: false,
      },
      {
        id: "d",
        text: "Permite cerrar el código derivado si se menciona a la persona autora.",
        correct: false,
      },
    ],
    explanation:
      "Copyleft usa el derecho de autor para garantizar libertades: puedes usar, estudiar, modificar y distribuir el software, pero si distribuyes una versión modificada debes hacerlo con la misma licencia. No es dominio público: la persona autora conserva sus derechos y los ejerce mediante la licencia. Una licencia permisiva (como MIT) sí permite incorporar el código en software cerrado.",
    principle:
      "Una licencia es el permiso que da quien tiene los derechos de autor (LFDA, art. 106). El copyleft usa ese permiso para que el software y sus versiones derivadas sigan siendo libres.",
    sources: [{ sourceId: "gnuGpl" }, { sourceId: "lfda", pinpoint: "art. 106" }],
    review: {
      status: "requiere-revision",
      note: "El texto de la GNU GPL no se consultó en esta sesión. Verificar la descripción con la fuente oficial.",
    },
  },
  {
    id: "u4-sin-licencia",
    unitId: "u4",
    kind: "escenario",
    topic: "Copyright, Copyleft y licencias de software",
    difficulty: "intermedio",
    title: "Repositorio sin licencia",
    context:
      "Encontraste en un repositorio público una librería que resuelve justo lo que necesitas para tu proyecto. No tiene archivo de licencia.",
    prompt: "¿Qué haces?",
    options: [
      {
        id: "a",
        text: "Busco una alternativa con licencia clara o pido permiso por escrito al autor.",
        quality: "responsable",
        consequence:
          "Tu proyecto queda libre de riesgos legales y respetas el trabajo de quien escribió el código.",
      },
      {
        id: "b",
        text: "La copio; si está publicada, cualquiera puede usarla de forma libre.",
        quality: "riesgosa",
        consequence:
          "Que algo sea visible no significa que tengas permiso: sin licencia, no hay autorización para reproducirlo.",
      },
      {
        id: "c",
        text: "La uso tal cual y pongo el nombre del autor en los créditos del proyecto.",
        quality: "parcial",
        consequence:
          "Reconocer la autoría es correcto, pero dar crédito no sustituye el permiso de uso.",
      },
      {
        id: "d",
        text: "Copio el código, cambio los nombres de las variables y lo presento como mío.",
        quality: "riesgosa",
        consequence:
          "Además de usarlo sin permiso, cometes plagio: modificar una obra también requiere autorización.",
      },
    ],
    responsibleAlternative:
      "Usar software con una licencia que permita tu uso, o pedir permiso por escrito. Siempre da crédito, pero recuerda que el crédito no reemplaza la licencia.",
    explanation:
      "El derecho patrimonial sobre un programa incluye autorizar o prohibir su reproducción, su modificación y su distribución (LFDA, art. 106). Sin una licencia, nadie te ha dado esa autorización.",
    principle:
      "LFDA, art. 106: el titular decide si autoriza reproducir, modificar o distribuir su programa. Sin licencia no hay autorización, aunque el código esté publicado.",
    classification: [
      {
        type: "falta-etica",
        text: "Presentar código ajeno como propio es plagio, una falta ética y académica.",
      },
    ],
    sources: [{ sourceId: "lfda", pinpoint: "arts. 102 y 106" }],
    review: { status: "texto-verificado" },
  },
  {
    id: "u4-comercio",
    unitId: "u4",
    kind: "opcion-multiple",
    topic: "Comercio electrónico y protección al consumidor",
    difficulty: "basico",
    title: "Antes de pagar",
    prompt:
      "Según el art. 76 bis de la Ley Federal de Protección al Consumidor, ¿qué debe darte una tienda en línea antes de celebrar la compra?",
    options: [
      {
        id: "a",
        text: "Su domicilio físico, teléfonos y medios para presentar reclamaciones.",
        correct: true,
      },
      {
        id: "b",
        text: "Un formulario para escribir la contraseña de tu banca en línea.",
        correct: false,
      },
      {
        id: "c",
        text: "La lista de otras tiendas con las que compartirá tus datos.",
        correct: false,
      },
      {
        id: "d",
        text: "Publicidad aunque hayas pedido no recibir avisos comerciales.",
        correct: false,
      },
    ],
    explanation:
      "El art. 76 bis (Capítulo VIII bis, sobre transacciones por medios electrónicos) obliga al proveedor a darte, antes de la transacción, su domicilio físico, teléfonos y medios para reclamar (fr. III). También debe usar tu información de forma confidencial y no transmitirla a proveedores ajenos sin tu autorización (fr. I), y respetar tu decisión de no recibir avisos comerciales (fr. VI).",
    principle:
      "LFPC, art. 76 bis: en compras por medios electrónicos, el proveedor debe proteger tu información (frs. I y II), darte antes de la compra sus datos para reclamar (fr. III) y respetar tu decisión de no recibir publicidad (fr. VI).",
    sources: [{ sourceId: "lfpc", pinpoint: "Capítulo VIII bis, art. 76 bis, frs. I, III y VI" }],
    review: { status: "texto-verificado" },
  },
  {
    id: "u4-sesgo",
    unitId: "u4",
    kind: "escenario",
    topic: "Inteligencia artificial, sesgos algorítmicos, discriminación y privacidad",
    difficulty: "avanzado",
    title: "El filtro de candidatos",
    context:
      "Tu equipo entrenó un modelo para filtrar solicitudes de empleo. En las pruebas notas que rechaza a más mujeres, porque aprendió de contrataciones pasadas.",
    prompt: "¿Qué decides?",
    options: [
      {
        id: "a",
        text: "Detengo el despliegue, analizo el sesgo, ajusto el modelo y mantengo revisión humana.",
        quality: "responsable",
        consequence:
          "El lanzamiento se retrasa, pero evitas discriminar a cientos de personas y el equipo aprende a medir la equidad.",
      },
      {
        id: "b",
        text: "Lo despliego; el modelo solo repite los datos históricos, así que es objetivo.",
        quality: "riesgosa",
        consequence:
          "Automatizas una discriminación del pasado y la aplicas a escala, con apariencia de neutralidad.",
      },
      {
        id: "c",
        text: "Elimino la variable «sexo» y lo despliego sin volver a medir los resultados.",
        quality: "parcial",
        consequence:
          "Otras variables (nombre, escuela, pausas laborales) pueden seguir delatando el sexo, y no sabrás si el sesgo continúa.",
      },
      {
        id: "d",
        text: "Lo despliego y no informo del hallazgo para no retrasar el proyecto.",
        quality: "riesgosa",
        consequence:
          "Ocultas un daño conocido; cuando se descubra, la responsabilidad será tuya y de la organización.",
      },
    ],
    responsibleAlternative:
      "No desplegar hasta medir y corregir el sesgo con métricas por grupo, documentar las decisiones, informar a los responsables y conservar la revisión humana en decisiones que afectan a personas.",
    explanation:
      "Un modelo aprende patrones de sus datos, incluidas las injusticias. Que una decisión la tome un algoritmo no la vuelve neutral. La Constitución prohíbe toda discriminación motivada, entre otras razones, por el género.",
    principle:
      "Art. 1o. constitucional: queda prohibida toda discriminación motivada, entre otras causas, por el género. Un algoritmo que discrimina repite esa conducta a gran escala; medir y corregir el sesgo es parte del trabajo.",
    classification: [
      {
        type: "falta-etica",
        text: "Desplegar un sistema que se sabe sesgado es una falta ética grave hacia las personas afectadas.",
      },
    ],
    sources: [{ sourceId: "cpeum", pinpoint: "art. 1o., último párrafo" }, { sourceId: "temario" }],
    review: {
      status: "requiere-revision",
      note: "Cotejado el texto del art. 1o. Verificar con el docente si deben citarse leyes secundarias contra la discriminación.",
    },
  },
  {
    id: "u4-ia-privacidad",
    unitId: "u4",
    kind: "opcion-multiple",
    topic: "Inteligencia artificial, sesgos algorítmicos, discriminación y privacidad",
    difficulty: "intermedio",
    title: "Resumir expedientes",
    prompt:
      "Te piden resumir expedientes de clientes con nombres y diagnósticos médicos usando un chatbot público de IA. ¿Qué es lo más responsable?",
    options: [
      {
        id: "a",
        text: "No cargar datos personales; anonimizar o usar una herramienta autorizada.",
        correct: true,
      },
      {
        id: "b",
        text: "Cargar todo, porque el chatbot promete no guardar las conversaciones.",
        correct: false,
      },
      {
        id: "c",
        text: "Cargar solo los diagnósticos más graves para ahorrar tiempo de lectura.",
        correct: false,
      },
      {
        id: "d",
        text: "Cargar todo y borrar el historial del chat cuando termine el resumen.",
        correct: false,
      },
    ],
    explanation:
      "Un diagnóstico es un dato personal sensible. Cargarlo en un servicio externo implica entregarlo a un tercero sin el consentimiento ni las garantías que exige la ley; borrar el historial después no deshace esa entrega. La alternativa es anonimizar o usar herramientas aprobadas por la organización.",
    principle:
      "LFPDPPP, arts. 2 (fr. VI), 8 y 58 (frs. XII y XIII): un diagnóstico es un dato sensible; transferirlo sin consentimiento expreso o fuera de los casos permitidos es una infracción.",
    classification: [
      {
        type: "infraccion-administrativa",
        text: "Transferir datos fuera de los casos permitidos o sin consentimiento expreso cuando es exigible es infracción (LFPDPPP, art. 58, frs. XII y XIII).",
      },
    ],
    sources: [{ sourceId: "lfpdppp", pinpoint: "arts. 2 fr. VI, 8, 18, 35 y 58 frs. XII y XIII" }],
    review: {
      status: "requiere-revision",
      note: "Artículos cotejados. Si el proveedor de IA actúa como encargado y no como tercero, el análisis cambia; validar con el docente.",
    },
  },
];
