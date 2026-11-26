import type { Question } from "../types";

/** Unidad I: Fundamentos de la ética en las TIC */
export const UNIDAD_1: Question[] = [
  {
    id: "u1-moral-etica",
    unitId: "u1",
    kind: "opcion-multiple",
    topic: "Moral, valores, principios, ética y dilemas éticos",
    difficulty: "basico",
    title: "Moral contra ética",
    prompt: "¿Qué describe mejor la diferencia entre moral y ética?",
    options: [
      {
        id: "a",
        text: "La moral son las normas que guían a un grupo; la ética reflexiona críticamente sobre ellas.",
        correct: true,
      },
      {
        id: "b",
        text: "La moral es obligatoria por ley; la ética solo aplica a profesionistas con título.",
        correct: false,
      },
      {
        id: "c",
        text: "La ética cambia con cada persona; la moral es idéntica en todas las culturas.",
        correct: false,
      },
      {
        id: "d",
        text: "Son sinónimos exactos y se usan igual en cualquier contexto académico.",
        correct: false,
      },
    ],
    explanation:
      "La moral reúne las normas y costumbres que un grupo considera correctas. La ética es la reflexión que analiza esas normas, pregunta por qué son válidas y ayuda a decidir cuando chocan entre sí. Los valores son lo que consideramos valioso (por ejemplo, la honestidad) y los principios son reglas generales que se derivan de ellos.",
    principle:
      "Para justificar una decisión profesional no basta con «siempre se ha hecho así»: hay que explicar qué valor protege y qué principio la respalda. Esa es la tarea de la ética.",
    sources: [{ sourceId: "temario" }],
    review: { status: "validado-docente" },
  },
  {
    id: "u1-dilema",
    unitId: "u1",
    kind: "opcion-multiple",
    topic: "Moral, valores, principios, ética y dilemas éticos",
    difficulty: "intermedio",
    title: "¿Es un dilema?",
    prompt: "¿Cuál situación es un dilema ético y no solo una falta evidente?",
    options: [
      {
        id: "a",
        text: "Avisar de una falla de seguridad retrasaría una entrega que el cliente necesita con urgencia.",
        correct: true,
      },
      {
        id: "b",
        text: "Copiar el código de un compañero y entregarlo como propio para aprobar la materia.",
        correct: false,
      },
      {
        id: "c",
        text: "Elegir entre dos librerías de código abierto con licencias compatibles y documentadas.",
        correct: false,
      },
      {
        id: "d",
        text: "Publicar en un foro la contraseña de un compañero porque olvidó cerrar su sesión.",
        correct: false,
      },
    ],
    explanation:
      "Un dilema ético aparece cuando dos valores legítimos entran en conflicto y cualquier opción tiene un costo: aquí chocan la seguridad de los usuarios y el compromiso con el cliente. Copiar código o publicar una contraseña no son dilemas: son faltas claras. Elegir entre dos librerías compatibles es una decisión técnica.",
    principle:
      "Ante un dilema, identifica los valores en conflicto, a quién afecta cada opción y qué alternativas existen. Elige la que cause menos daño y que puedas defender en público.",
    sources: [{ sourceId: "temario" }],
    review: { status: "validado-docente" },
  },
  {
    id: "u1-ciberacoso",
    unitId: "u1",
    kind: "escenario",
    topic: "Ciberacoso, plagio, discriminación y desinformación",
    difficulty: "basico",
    title: "El meme del grupo",
    context:
      "En el grupo de mensajería del salón circula una imagen editada que ridiculiza a una compañera. Varias personas ya reaccionaron con risas.",
    prompt: "¿Qué haces?",
    options: [
      {
        id: "a",
        text: "No lo reenvío, le escribo a ella en privado y reporto el mensaje a la tutoría.",
        quality: "responsable",
        consequence:
          "Cortas la cadena de difusión, ella sabe que cuenta con apoyo y la institución puede aplicar su protocolo contra el acoso.",
      },
      {
        id: "b",
        text: "Lo reenvío a otro grupo, porque ya lo vio mucha gente y no cambia nada.",
        quality: "riesgosa",
        consequence:
          "Cada reenvío multiplica la exposición. Ya no eres espectador: participas en el daño.",
      },
      {
        id: "c",
        text: "No reacciono ni comento; salgo del grupo para no involucrarme en el problema.",
        quality: "parcial",
        consequence:
          "No participas en la burla, pero la compañera sigue expuesta y nadie con autoridad se entera de lo que pasa.",
      },
      {
        id: "d",
        text: "Respondo con otro meme sobre quien lo publicó para que sienta lo mismo.",
        quality: "riesgosa",
        consequence:
          "Escalas el conflicto: ahora hay dos personas afectadas y la venganza no repara a la primera.",
      },
    ],
    responsibleAlternative:
      "No difundir, apoyar a la persona afectada y avisar por un canal formal (tutoría, coordinación). Conserva capturas solo si te las piden para el reporte; no las compartas con más personas.",
    explanation:
      "El ciberacoso se sostiene con la audiencia. Quien reenvía o celebra contribuye al daño; quien calla deja sola a la víctima. La respuesta responsable combina no difundir, apoyar y reportar.",
    principle:
      "Respeto a la dignidad y responsabilidad de quien observa: en línea, reaccionar, reenviar o reportar también son acciones. Si el contenido fuera íntimo sexual, difundirlo sin consentimiento es delito según el art. 199 Octies del Código Penal Federal.",
    classification: [
      {
        type: "falta-etica",
        text: "Burlarse o difundir el meme es, como mínimo, una falta ética y puede violar el reglamento escolar.",
      },
      {
        type: "delito",
        text: "Si el contenido fuera íntimo sexual, difundirlo sin consentimiento es el delito de violación a la intimidad sexual (CPF, art. 199 Octies).",
      },
    ],
    sources: [{ sourceId: "cpf", pinpoint: "art. 199 Octies" }, { sourceId: "temario" }],
    review: { status: "validado-docente" },
  },
  {
    id: "u1-desarrollo-seguro",
    unitId: "u1",
    kind: "escenario",
    topic: "Ética en el uso de las TIC y en el desarrollo de software",
    difficulty: "intermedio",
    title: "La demo de hoy",
    context:
      "Tu líder te pide desactivar la validación de contraseñas seguras para que la demo salga hoy. La próxima semana el sistema empezará a guardar datos reales de clientes.",
    prompt: "¿Qué decisión tomas?",
    options: [
      {
        id: "a",
        text: "Explico el riesgo por escrito, propongo demo con datos ficticios y registro un pendiente.",
        quality: "responsable",
        consequence:
          "La demo sale a tiempo sin datos reales, el riesgo queda documentado y alguien es responsable de reactivar la validación.",
      },
      {
        id: "b",
        text: "La desactivo sin decir nada; si alguien pregunta, digo que fue decisión del equipo.",
        quality: "riesgosa",
        consequence:
          "La vulnerabilidad puede llegar a producción sin que nadie lo sepa, y ocultarla destruye la confianza en ti.",
      },
      {
        id: "c",
        text: "La desactivo como me pide y anoto en mi libreta personal que hay que reactivarla.",
        quality: "parcial",
        consequence:
          "Reconoces el riesgo, pero sin un registro compartido nadie más lo sabe; si faltas un día, el pendiente se pierde.",
      },
      {
        id: "d",
        text: "Me niego, borro la rama de la demo y le aviso al cliente por mi cuenta del problema.",
        quality: "riesgosa",
        consequence:
          "Actúas fuera de los canales del equipo, dañas el trabajo de otras personas y el problema de fondo no se resuelve.",
      },
    ],
    responsibleAlternative:
      "Plantear el riesgo con argumentos, proponer una alternativa que cumpla el objetivo (demo con datos ficticios) y dejar registro en el gestor de tareas del equipo.",
    explanation:
      "La ética profesional no es solo decir «no»: es buscar una solución que cumpla el objetivo sin poner en riesgo a terceros. Documentar la decisión crea responsabilidad compartida.",
    principle:
      "La LFPDPPP obliga a quien trata datos personales a establecer y mantener medidas de seguridad administrativas, técnicas y físicas (art. 18). Quitar una protección conocida justo antes de recibir datos reales va en contra de esa obligación.",
    classification: [
      {
        type: "falta-etica",
        text: "Ocultar un riesgo conocido es una falta ética hacia el equipo y los usuarios.",
      },
      {
        type: "infraccion-administrativa",
        text: "Si después se vulnera la seguridad de bases de datos por causa imputable al responsable, es una infracción a la LFPDPPP (art. 58, fr. XI).",
      },
    ],
    sources: [
      { sourceId: "lfpdppp", pinpoint: "arts. 18 y 58, fr. XI" },
      { sourceId: "temario" },
    ],
    review: { status: "texto-verificado" },
  },
  {
    id: "u1-politicas",
    unitId: "u1",
    kind: "opcion-multiple",
    topic: "Políticas, procedimientos y cumplimiento normativo",
    difficulty: "intermedio",
    title: "Política de uso aceptable",
    prompt:
      "Una empresa publica una política de uso aceptable de equipos y redes. ¿Para qué sirve principalmente?",
    options: [
      {
        id: "a",
        text: "Dejar claras las reglas de uso, las responsabilidades y qué pasa si no se cumplen.",
        correct: true,
      },
      {
        id: "b",
        text: "Sustituir a las leyes del país dentro de las instalaciones de la empresa.",
        correct: false,
      },
      {
        id: "c",
        text: "Permitir que TI revise cualquier dato personal sin informar a las personas.",
        correct: false,
      },
      {
        id: "d",
        text: "Garantizar que no ocurran incidentes de seguridad mientras exista el documento.",
        correct: false,
      },
    ],
    explanation:
      "Una política interna traduce valores y obligaciones legales en reglas concretas: qué se puede hacer, quién responde y qué consecuencias hay. No está por encima de la ley ni elimina riesgos por sí sola: necesita procedimientos, capacitación y seguimiento.",
    principle:
      "Una política interna no sustituye a la ley: debe cumplirla. Por ejemplo, la LFPDPPP exige informar en el aviso de privacidad qué datos se tratan y para qué (arts. 14 a 16); una política de uso de equipos no puede contradecir ese aviso.",
    sources: [{ sourceId: "lfpdppp", pinpoint: "arts. 14 a 16 (aviso de privacidad)" }, { sourceId: "temario" }],
    review: { status: "validado-docente" },
  },
  {
    id: "u1-desinformacion",
    unitId: "u1",
    kind: "opcion-multiple",
    topic: "Ciberacoso, plagio, discriminación y desinformación",
    difficulty: "basico",
    title: "La cifra viral",
    prompt:
      "Encuentras una nota viral con una cifra alarmante y sin autor. Antes de compartirla, ¿qué es lo más responsable?",
    options: [
      {
        id: "a",
        text: "Buscar la fuente original y contrastarla con medios o instituciones confiables.",
        correct: true,
      },
      {
        id: "b",
        text: "Compartirla con la aclaración «no sé si es cierto» para que otros decidan.",
        correct: false,
      },
      {
        id: "c",
        text: "Esperar a que tenga más reacciones, porque eso indica que es confiable.",
        correct: false,
      },
      {
        id: "d",
        text: "Copiar el texto en tu perfil sin el enlace original para que se lea mejor.",
        correct: false,
      },
    ],
    explanation:
      "Compartir «con advertencia» sigue difundiendo la información falsa. La popularidad no es evidencia. Copiar sin el enlace borra la autoría y, además, es una forma de plagio. Verificar la fuente original es el paso mínimo.",
    principle:
      "Quien comparte también responde por el alcance que le da a un contenido. Verificar la fuente original antes de difundir es un deber básico de la ciudadanía digital.",
    sources: [{ sourceId: "temario" }],
    review: { status: "validado-docente" },
  },
  {
    id: "u1-acceso-equitativo",
    unitId: "u1",
    kind: "opcion-multiple",
    topic: "Privacidad, seguridad, responsabilidad, propiedad intelectual y acceso equitativo",
    difficulty: "avanzado",
    title: "Inscripciones para todos",
    prompt:
      "Tu equipo diseña la app de inscripciones de una universidad. ¿Qué decisión favorece el acceso equitativo?",
    options: [
      {
        id: "a",
        text: "Que funcione con conexión lenta, con lector de pantalla y sin exigir un celular reciente.",
        correct: true,
      },
      {
        id: "b",
        text: "Que solo funcione en la versión más nueva de un sistema operativo para simplificar pruebas.",
        correct: false,
      },
      {
        id: "c",
        text: "Que pida descargar un archivo pesado antes de mostrar los requisitos de inscripción.",
        correct: false,
      },
      {
        id: "d",
        text: "Que use solo colores para marcar errores, porque se ve más limpio que con texto.",
        correct: false,
      },
    ],
    explanation:
      "Las otras opciones dejan fuera a quien tiene un equipo antiguo, poca conexión o una discapacidad visual. Si un servicio es necesario para estudiar, excluir a esas personas es una forma de discriminación por diseño.",
    principle:
      "El art. 1o. de la Constitución prohíbe toda discriminación motivada, entre otras causas, por discapacidad o condición social. Diseñar un servicio esencial que deje fuera a esas personas contradice ese principio.",
    sources: [{ sourceId: "cpeum", pinpoint: "art. 1o. (prohibición de discriminación)" }, { sourceId: "temario" }],
    review: { status: "validado-docente" },
  },
];
