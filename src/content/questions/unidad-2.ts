import type { Question } from "../types";

/** Unidad II: Datos personales y derecho de la propiedad */
export const UNIDAD_2: Question[] = [
  {
    id: "u2-transparencia",
    unitId: "u2",
    kind: "opcion-multiple",
    topic: "Derecho a la información y régimen jurídico de la información en México",
    difficulty: "basico",
    title: "¿Qué ley aplica?",
    prompt:
      "Quieres consultar cuánto gastó una dependencia pública en equipo de cómputo. ¿Qué ley general regula el acceso a esa información?",
    options: [
      {
        id: "a",
        text: "Ley General de Transparencia y Acceso a la Información Pública.",
        correct: true,
      },
      {
        id: "b",
        text: "Ley Federal de Protección de Datos Personales en Posesión de los Particulares.",
        correct: false,
      },
      {
        id: "c",
        text: "Ley Federal del Derecho de Autor.",
        correct: false,
      },
      {
        id: "d",
        text: "Ley Federal de Protección al Consumidor.",
        correct: false,
      },
    ],
    explanation:
      "El artículo 6o. constitucional establece que el Estado garantiza el derecho a la información. La ley general vigente en la materia es la Ley General de Transparencia y Acceso a la Información Pública, publicada en el DOF el 20 de marzo de 2025, que sustituyó a la de 2015. La LFPDPPP regula datos personales en manos de particulares, no la información pública.",
    principle:
      "Art. 6o. constitucional: el Estado garantiza el derecho a la información. La Ley General de Transparencia y Acceso a la Información Pública (DOF 20-03-2025) regula cómo pedir información a las autoridades.",
    sources: [
      { sourceId: "cpeum", pinpoint: "art. 6o." },
      { sourceId: "lgtaip" },
      { sourceId: "lfpdppp", pinpoint: "Decreto, transitorio segundo" },
    ],
    review: { status: "texto-verificado" },
  },
  {
    id: "u2-libertad-expresion",
    unitId: "u2",
    kind: "opcion-multiple",
    topic: "Marco constitucional y libertad de expresión",
    difficulty: "intermedio",
    title: "Límites de la expresión",
    prompt:
      "Según el artículo 6o. constitucional, la manifestación de las ideas puede ser objeto de inquisición judicial o administrativa cuando…",
    options: [
      {
        id: "a",
        text: "ataque a la moral, la vida privada o los derechos de terceros, o perturbe el orden público.",
        correct: true,
      },
      {
        id: "b",
        text: "critique a una autoridad o servidor público, aunque se haga de forma respetuosa.",
        correct: false,
      },
      {
        id: "c",
        text: "se publique en internet en lugar de un periódico impreso o una estación de radio.",
        correct: false,
      },
      {
        id: "d",
        text: "se difunda en una red social con muchos seguidores o en un medio comercial.",
        correct: false,
      },
    ],
    explanation:
      "La regla es la libertad: la manifestación de las ideas no será objeto de inquisición judicial o administrativa, salvo que ataque a la moral, la vida privada o los derechos de terceros, provoque algún delito o perturbe el orden público. Criticar a una autoridad está protegido. El artículo 7o. agrega que no puede restringirse por medios indirectos, incluidas las tecnologías de la información.",
    principle:
      "Arts. 6o. y 7o. constitucionales: la libertad de expresión es la regla. Solo se limita cuando se ataca la moral, la vida privada o los derechos de terceros, se provoca un delito o se perturba el orden público.",
    sources: [{ sourceId: "cpeum", pinpoint: "arts. 6o. y 7o." }],
    review: { status: "texto-verificado" },
  },
  {
    id: "u2-peticion",
    unitId: "u2",
    kind: "opcion-multiple",
    topic: "Derecho de petición",
    difficulty: "basico",
    title: "Derecho de petición",
    prompt:
      "Envías por escrito, de manera pacífica y respetuosa, una petición a una dependencia pública. ¿Qué establece el artículo 8o. constitucional?",
    options: [
      {
        id: "a",
        text: "Debe recaer un acuerdo escrito, que se te dé a conocer en breve término.",
        correct: true,
      },
      {
        id: "b",
        text: "La autoridad puede ignorarla si no la presenta una persona abogada.",
        correct: false,
      },
      {
        id: "c",
        text: "Solo procede si se presenta de forma oral y en persona en la oficina.",
        correct: false,
      },
      {
        id: "d",
        text: "La autoridad debe concederte siempre lo que pides, sin excepción.",
        correct: false,
      },
    ],
    explanation:
      "El artículo 8o. obliga a funcionarios y empleados públicos a respetar el derecho de petición formulado por escrito, de manera pacífica y respetuosa. A toda petición debe recaer un acuerdo escrito, que se dé a conocer en breve término. Ojo: el derecho es a recibir respuesta, no a que la respuesta sea favorable. La Constitución no fija un número de días.",
    principle:
      "Art. 8o. constitucional: toda petición escrita, pacífica y respetuosa debe recibir un acuerdo escrito en breve término. El derecho es a obtener respuesta, no a que la respuesta sea favorable.",
    sources: [{ sourceId: "cpeum", pinpoint: "art. 8o." }],
    review: { status: "texto-verificado" },
  },
  {
    id: "u2-datos-sensibles",
    unitId: "u2",
    kind: "opcion-multiple",
    topic: "Privacidad y protección de datos personales",
    difficulty: "intermedio",
    title: "Datos sensibles",
    prompt:
      "Una app privada para agendar citas médicas pide varios datos. ¿Cuál es un dato personal sensible según la LFPDPPP?",
    options: [
      { id: "a", text: "Su estado de salud presente o futuro.", correct: true },
      { id: "b", text: "El correo para recibir recordatorios.", correct: false },
      { id: "c", text: "El nombre de usuario que eligió.", correct: false },
      { id: "d", text: "El teléfono para confirmar la cita.", correct: false },
    ],
    explanation:
      "Todas las opciones son datos personales, porque identifican a una persona. Pero los sensibles son los que afectan su esfera más íntima o cuyo mal uso puede causar discriminación o un riesgo grave, como el estado de salud, el origen étnico, la información genética, las creencias o la preferencia sexual. Para tratarlos se necesita consentimiento expreso y por escrito.",
    principle:
      "LFPDPPP, art. 2, fr. VI: los datos sensibles (salud, origen étnico, creencias, preferencia sexual, entre otros) tienen protección reforzada. El art. 8 exige consentimiento expreso y por escrito para tratarlos.",
    sources: [{ sourceId: "lfpdppp", pinpoint: "art. 2, frs. V y VI; art. 8" }],
    review: { status: "texto-verificado" },
  },
  {
    id: "u2-arco",
    unitId: "u2",
    kind: "escenario",
    topic: "Privacidad y protección de datos personales",
    difficulty: "intermedio",
    title: "Solicitud del cliente",
    context:
      "Trabajas en soporte de una tienda en línea. Un cliente escribe: «Quiero saber qué datos míos tienen y que borren mi dirección vieja».",
    prompt: "¿Cómo respondes?",
    options: [
      {
        id: "a",
        text: "Le explico cómo ejercer sus derechos ARCO y canalizo la solicitud al área responsable.",
        quality: "responsable",
        consequence:
          "La empresa puede verificar su identidad y responder dentro del plazo legal; el cliente ejerce sus derechos de acceso y cancelación.",
      },
      {
        id: "b",
        text: "Le digo que los datos son propiedad de la empresa y que no se los podemos dar.",
        quality: "riesgosa",
        consequence:
          "Es falso: la persona titular tiene derecho a acceder a sus datos. Negarse sin razón fundada es una infracción.",
      },
      {
        id: "c",
        text: "Borro yo mismo la dirección en la base de datos para resolverlo más rápido.",
        quality: "parcial",
        consequence:
          "Atiendes una parte, pero sin verificar identidad ni dejar registro, y la solicitud de acceso queda sin respuesta.",
      },
      {
        id: "d",
        text: "Le pido que publique su solicitud en nuestra página de redes sociales para darle seguimiento.",
        quality: "riesgosa",
        consequence:
          "Expones públicamente información personal del cliente: el remedio crea un nuevo problema de privacidad.",
      },
    ],
    responsibleAlternative:
      "Orientar al cliente con el procedimiento descrito en el aviso de privacidad y canalizar la solicitud. El responsable debe comunicar su determinación en un máximo de veinte días, y el ejercicio de los derechos ARCO es gratuito (salvo costos de reproducción o envío).",
    explanation:
      "Los derechos ARCO son acceso, rectificación, cancelación y oposición. El cliente está ejerciendo acceso y cancelación. La empresa debe atenderlos por su procedimiento formal, no por la vía rápida ni negándolos.",
    principle:
      "Art. 16 constitucional y LFPDPPP, arts. 21 a 34: toda persona puede pedir acceso, rectificación, cancelación u oposición sobre sus datos. El trámite es gratuito y el responsable debe comunicar su respuesta en un máximo de veinte días.",
    classification: [
      {
        type: "infraccion-administrativa",
        text: "No cumplir sin razón fundada una solicitud ARCO es infracción (LFPDPPP, art. 58, fr. I). La sanciona la Secretaría Anticorrupción y Buen Gobierno.",
      },
    ],
    sources: [
      { sourceId: "cpeum", pinpoint: "art. 16, segundo párrafo" },
      { sourceId: "lfpdppp", pinpoint: "arts. 2, fr. VII; 21 a 24; 31; 34; 58, fr. I" },
    ],
    review: { status: "texto-verificado" },
  },
  {
    id: "u2-software-autor",
    unitId: "u2",
    kind: "opcion-multiple",
    topic: "Propiedad intelectual y derechos de autor en el ámbito digital",
    difficulty: "intermedio",
    title: "El código es obra",
    prompt: "¿Cómo protege la Ley Federal del Derecho de Autor a los programas de computación?",
    options: [
      {
        id: "a",
        text: "En los mismos términos que las obras literarias, en código fuente u objeto.",
        correct: true,
      },
      {
        id: "b",
        text: "Solo cuando se registran como patente ante el instituto de propiedad industrial.",
        correct: false,
      },
      {
        id: "c",
        text: "Únicamente si el código se publica con licencia libre en un repositorio.",
        correct: false,
      },
      {
        id: "d",
        text: "No los protege, porque se consideran métodos matemáticos y no obras.",
        correct: false,
      },
    ],
    explanation:
      "La LFDA incluye los programas de cómputo entre las ramas de obras protegidas (art. 13, fr. XI). Desde la reforma del 14 de mayo de 2026, su artículo 102 señala que los programas de computación, incluidos los de inteligencia artificial, se protegen en los mismos términos que las obras literarias, tanto en código fuente como en código objeto. Por otra parte, la LFPPI indica que los programas de computación no se consideran invenciones.",
    principle:
      "LFDA, arts. 13 (fr. XI), 101 y 102: el software es una obra protegida como obra literaria. Copiarlo, modificarlo o distribuirlo requiere autorización de quien tenga los derechos patrimoniales.",
    sources: [
      { sourceId: "lfda", pinpoint: "arts. 13, fr. XI; 101; 102" },
      { sourceId: "lfppi", pinpoint: "art. 47, fr. V" },
    ],
    review: { status: "texto-verificado" },
  },
  {
    id: "u2-codigo-laboral",
    unitId: "u2",
    kind: "opcion-multiple",
    topic: "Propiedad intelectual y derechos de autor en el ámbito digital",
    difficulty: "avanzado",
    title: "Código hecho en el trabajo",
    prompt:
      "Programaste un módulo como parte de tu trabajo, siguiendo instrucciones de la empresa. Si el contrato no dice nada, ¿a quién corresponden los derechos patrimoniales?",
    options: [
      { id: "a", text: "Al empleador, salvo pacto en contrario.", correct: true },
      { id: "b", text: "A ti, por ser quien escribió el código.", correct: false },
      { id: "c", text: "A ambos, en partes iguales y de forma automática.", correct: false },
      { id: "d", text: "A nadie: el software laboral es de dominio público.", correct: false },
    ],
    explanation:
      "La LFDA establece que, salvo pacto en contrario, los derechos patrimoniales sobre un programa y su documentación creados por empleados en ejercicio de sus funciones o siguiendo instrucciones del empleador corresponden a este (art. 103). La ley distingue entre derechos morales y patrimoniales (art. 11) y define al autor como la persona física que crea la obra (art. 12).",
    principle:
      "LFDA, art. 103: salvo pacto en contrario, los derechos patrimoniales del software que crean los empleados en sus funciones corresponden al empleador. Revisa siempre la cláusula de propiedad intelectual de tu contrato.",
    sources: [{ sourceId: "lfda", pinpoint: "arts. 11, 12 y 103" }],
    review: { status: "texto-verificado" },
  },
  {
    id: "u2-auditoria",
    unitId: "u2",
    kind: "escenario",
    topic: "Revisión y auditoría de código",
    difficulty: "intermedio",
    title: "La clave en el repositorio",
    context:
      "Durante una revisión de código descubres que un compañero subió al repositorio la clave de acceso a la base de datos de producción.",
    prompt: "¿Qué haces?",
    options: [
      {
        id: "a",
        text: "Lo marco en la revisión, pido rotar la clave y moverla a un gestor de secretos.",
        quality: "responsable",
        consequence:
          "La clave expuesta deja de servir, el equipo corrige la práctica y queda constancia en la revisión.",
      },
      {
        id: "b",
        text: "Borro la línea en un nuevo commit y apruebo el cambio sin comentar nada.",
        quality: "parcial",
        consequence:
          "La clave sigue en el historial del repositorio y sigue siendo válida: el riesgo continúa aunque no se vea.",
      },
      {
        id: "c",
        text: "Apruebo el cambio; el repositorio es privado y solo lo ve el equipo.",
        quality: "riesgosa",
        consequence:
          "Cualquier persona con acceso al repositorio, o quien lo filtre, puede entrar a producción.",
      },
      {
        id: "d",
        text: "Uso la clave para entrar a la base de datos y confirmar que funciona.",
        quality: "riesgosa",
        consequence:
          "Accedes a información sin autorización. Eso puede tener consecuencias legales y rompe la confianza del equipo.",
      },
    ],
    responsibleAlternative:
      "Señalarlo en la revisión de forma respetuosa, pedir que la clave se revoque y se genere otra, y guardar los secretos fuera del código (variables de entorno o un gestor de secretos).",
    explanation:
      "La revisión de código no solo busca errores de funcionamiento: también protege la confidencialidad. Borrar la línea no basta, porque el historial conserva la clave.",
    principle:
      "LFPDPPP, arts. 18 y 20: quien trata datos personales debe protegerlos con medidas de seguridad y controles de confidencialidad. Una clave expuesta es una vulneración en potencia, aunque el repositorio sea privado.",
    classification: [
      {
        type: "infraccion-administrativa",
        text: "Si la base contiene datos personales y se vulnera su seguridad por causa imputable al responsable, es infracción (LFPDPPP, art. 58, fr. XI).",
      },
      {
        type: "delito",
        text: "Conocer o copiar sin autorización información de sistemas protegidos por un mecanismo de seguridad está tipificado en el CPF (art. 211 bis 1). Su aplicación a un caso concreto la determina la autoridad.",
      },
    ],
    sources: [
      { sourceId: "lfpdppp", pinpoint: "arts. 18 y 58, fr. XI" },
      { sourceId: "cpf", pinpoint: "art. 211 bis 1" },
    ],
    review: {
      status: "requiere-revision",
      note: "Artículos cotejados. Revisar con el docente si el ejemplo de la opción D encuadra en el art. 211 bis 1.",
    },
  },
];
