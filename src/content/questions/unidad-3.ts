import type { Question } from "../types";

/** Unidad III: Delitos informáticos */
export const UNIDAD_3: Question[] = [
  {
    id: "u3-clasificacion",
    unitId: "u3",
    kind: "opcion-multiple",
    topic: "Definición y clasificación de delitos informáticos",
    difficulty: "intermedio",
    title: "Falta, infracción o delito",
    prompt: "¿Qué distingue a un delito de una infracción administrativa?",
    options: [
      {
        id: "a",
        text: "El delito lo define la ley penal y lo juzga un juez; la infracción la sanciona una autoridad.",
        correct: true,
      },
      {
        id: "b",
        text: "El delito solo ocurre en internet; la infracción solo ocurre en lugares físicos.",
        correct: false,
      },
      {
        id: "c",
        text: "La infracción implica cárcel; el delito solo se castiga con una multa económica.",
        correct: false,
      },
      {
        id: "d",
        text: "Son lo mismo: ambos son faltas éticas que sanciona el reglamento interno.",
        correct: false,
      },
    ],
    explanation:
      "Una falta ética rompe principios o reglas internas, aunque no siempre la ley la sancione. Una infracción administrativa viola una ley y la sanciona una autoridad administrativa, normalmente con multa: por ejemplo, la LFPDPPP enumera infracciones (art. 58) que sanciona la Secretaría Anticorrupción y Buen Gobierno (art. 59). Un delito es una conducta tipificada en la ley penal que puede castigarse con prisión: la misma LFPDPPP tiene un capítulo de delitos (arts. 62 a 64).",
    principle:
      "Una conducta puede tener consecuencias éticas (reglas internas), administrativas (multa de una autoridad; LFPDPPP, arts. 58 y 59) y penales (delito; LFPDPPP, arts. 62 a 64). No se excluyen entre sí (art. 61).",
    classification: [
      {
        type: "infraccion-administrativa",
        text: "Ejemplo: omitir elementos obligatorios en el aviso de privacidad (LFPDPPP, art. 58, fr. V).",
      },
      {
        type: "delito",
        text: "Ejemplo: tratar datos personales mediante engaño para obtener un lucro indebido; prisión de seis meses a cinco años (LFPDPPP, art. 63).",
      },
    ],
    sources: [
      { sourceId: "lfpdppp", pinpoint: "arts. 58, 59, 61 a 64" },
      { sourceId: "temario" },
    ],
    review: {
      status: "requiere-revision",
      note: "Ejemplos cotejados con la ley. La definición general de delito debe confirmarse con la bibliografía del curso.",
    },
  },
  {
    id: "u3-acceso-ilicito",
    unitId: "u3",
    kind: "escenario",
    topic: "Penas y medidas de prevención",
    difficulty: "intermedio",
    title: "La contraseña en el post-it",
    context:
      "En el laboratorio encuentras la contraseña del sistema de calificaciones escrita en un post-it. Un amigo te pide entrar «solo para ver» su calificación antes de que se publique.",
    prompt: "¿Qué haces?",
    options: [
      {
        id: "a",
        text: "No entro, retiro el post-it y aviso al área de sistemas para que cambien la contraseña.",
        quality: "responsable",
        consequence:
          "Proteges el sistema, a tu amigo y a ti. El área de sistemas puede corregir la falla de seguridad.",
      },
      {
        id: "b",
        text: "Entro solo a ver, sin cambiar nada; mirar la información no le hace daño a nadie.",
        quality: "riesgosa",
        consequence:
          "Conocer información sin autorización en un sistema protegido está tipificado como delito, aunque no modifiques nada.",
      },
      {
        id: "c",
        text: "Entro y corrijo su calificación, porque creemos que el profesor se equivocó.",
        quality: "riesgosa",
        consequence:
          "Modificar información sin autorización tiene una pena mayor que solo conocerla, y la calificación no se corrige por la vía legítima.",
      },
      {
        id: "d",
        text: "No entro, pero dejo el post-it donde estaba para no meterme en problemas.",
        quality: "parcial",
        consequence:
          "No cometes la conducta, pero la contraseña sigue expuesta para la siguiente persona.",
      },
    ],
    responsibleAlternative:
      "No acceder y reportar la contraseña expuesta para que se cambie. Si hay un error en una calificación, se solicita la revisión por el procedimiento escolar.",
    explanation:
      "El Código Penal Federal sanciona a quien, sin autorización, conozca o copie información en sistemas protegidos por algún mecanismo de seguridad (prisión de tres meses a un año y multa), y con más pena a quien la modifique, destruya o provoque su pérdida (seis meses a dos años y multa). Si el sistema es del Estado, por ejemplo de una universidad pública, aplica el art. 211 bis 2, con penas mayores.",
    principle:
      "CPF, arts. 211 bis 1 y 211 bis 2: conocer, copiar, modificar o destruir sin autorización información de sistemas protegidos por un mecanismo de seguridad es delito. Tener la contraseña no equivale a tener permiso.",
    classification: [
      {
        type: "delito",
        text: "Acceso ilícito a sistemas y equipos de informática (CPF, arts. 211 bis 1 y 211 bis 2).",
      },
    ],
    sources: [{ sourceId: "cpf", pinpoint: "capítulo «Acceso ilícito a sistemas y equipos de informática», arts. 211 bis 1 y 211 bis 2" }],
    review: {
      status: "requiere-revision",
      note: "Penas cotejadas con el texto del CPF consultado (última reforma 13-03-2026). Confirmar que la reforma «en actualización» no las modificó.",
    },
  },
  {
    id: "u3-fraude",
    unitId: "u3",
    kind: "opcion-multiple",
    topic: "Delitos contra el patrimonio",
    difficulty: "intermedio",
    title: "La tienda que no existe",
    prompt:
      "Alguien crea una tienda falsa en redes sociales, cobra por adelantado y nunca envía los productos. ¿Con qué figura del Código Penal Federal se relaciona más directamente?",
    options: [
      { id: "a", text: "Fraude: obtener un lucro indebido engañando a otra persona.", correct: true },
      { id: "b", text: "Acceso ilícito: copiar información de un sistema protegido.", correct: false },
      { id: "c", text: "Delito contra derechos de autor: vender copias de obras.", correct: false },
      { id: "d", text: "Violación a la intimidad sexual: difundir contenido íntimo.", correct: false },
    ],
    explanation:
      "Comete fraude quien, engañando a alguien o aprovechándose de su error, se hace ilícitamente de alguna cosa o alcanza un lucro indebido (CPF, art. 386). Las TIC son solo el medio: la conducta es un delito contra el patrimonio. Según el caso, también pueden aplicar los códigos penales de las entidades federativas.",
    principle:
      "CPF, art. 386: comete fraude quien, engañando a alguien o aprovechando su error, obtiene ilícitamente una cosa o un lucro indebido. Que ocurra por internet no cambia el delito.",
    classification: [
      { type: "delito", text: "Fraude (CPF, art. 386). La pena depende del monto defraudado." },
    ],
    sources: [{ sourceId: "cpf", pinpoint: "art. 386" }],
    review: {
      status: "requiere-revision",
      note: "Art. 386 cotejado. Confirmar con el docente la mención de la competencia de las entidades federativas.",
    },
  },
  {
    id: "u3-pirateria",
    unitId: "u3",
    kind: "opcion-multiple",
    topic: "Delitos contra la propiedad intelectual",
    difficulty: "intermedio",
    title: "Copias a la venta",
    prompt:
      "Un sitio vende, con fines de especulación comercial, copias no autorizadas de un videojuego protegido. ¿Qué afirmación es correcta?",
    options: [
      {
        id: "a",
        text: "Puede ser delito federal y también infracción en materia de comercio.",
        correct: true,
      },
      {
        id: "b",
        text: "Solo es falta ética, porque los videojuegos no se protegen como obras.",
        correct: false,
      },
      {
        id: "c",
        text: "Es legal si el sitio está alojado en otro país y cobra en otra moneda.",
        correct: false,
      },
      {
        id: "d",
        text: "Solo es ilegal si quien compra instala la copia en más de un equipo.",
        correct: false,
      },
    ],
    explanation:
      "El CPF castiga con tres a diez años de prisión y de dos mil a veinte mil días multa a quien, en forma dolosa y con fin de especulación comercial, produzca, reproduzca, distribuya o venda copias de obras protegidas sin autorización (art. 424 bis). Además, la LFDA considera infracciones en materia de comercio ciertas conductas con fines de lucro (art. 231), que sanciona el Instituto Mexicano de la Propiedad Industrial (art. 232). Los programas de cómputo son obras protegidas (LFDA, art. 13, fr. XI).",
    principle:
      "CPF, art. 424 bis, y LFDA, arts. 231 y 232: vender copias no autorizadas con fin de lucro puede ser delito federal y, además, infracción en materia de comercio que sanciona el IMPI.",
    classification: [
      { type: "delito", text: "Delitos en materia de derechos de autor (CPF, art. 424 bis)." },
      {
        type: "infraccion-administrativa",
        text: "Infracciones en materia de comercio (LFDA, arts. 231 y 232), sancionadas por el IMPI.",
      },
    ],
    sources: [
      { sourceId: "cpf", pinpoint: "art. 424 bis" },
      { sourceId: "lfda", pinpoint: "arts. 13, 231 y 232" },
    ],
    review: { status: "texto-verificado" },
  },
  {
    id: "u3-contacto-menores",
    unitId: "u3",
    kind: "opcion-multiple",
    topic: "Uso de las TIC como medio para cometer delitos",
    difficulty: "avanzado",
    title: "Mensajes en el juego en línea",
    prompt:
      "Una persona adulta contacta por el chat de un videojuego a alguien de 15 años y le pide imágenes de contenido sexual. ¿Qué establece el CPF?",
    options: [
      {
        id: "a",
        text: "Es un delito específico contactar a menores por medios informáticos con ese fin.",
        correct: true,
      },
      {
        id: "b",
        text: "Solo es delito si la persona adulta y el menor llegan a verse en persona.",
        correct: false,
      },
      {
        id: "c",
        text: "Es una infracción administrativa que sanciona la empresa del videojuego.",
        correct: false,
      },
      {
        id: "d",
        text: "No es delito porque el contacto ocurrió dentro de un juego y no en una red.",
        correct: false,
      },
    ],
    explanation:
      "El art. 199 Septies del CPF castiga con cuatro a ocho años de prisión a quien, usando medios de telecomunicaciones, informáticos o cualquier medio de transmisión de datos, contacte a una persona menor de dieciocho años y le requiera imágenes, audio o video de actividades sexuales explícitas o de connotación sexual, o le solicite un encuentro sexual. No es necesario que haya un encuentro.",
    principle:
      "CPF, art. 199 Septies: contactar por medios informáticos a una persona menor de 18 años para pedirle contenido sexual es delito, haya o no un encuentro. Si te pasa: no respondas, guarda evidencia, bloquea, reporta y avisa a una persona adulta de confianza.",
    classification: [{ type: "delito", text: "CPF, art. 199 Septies." }],
    sources: [{ sourceId: "cpf", pinpoint: "art. 199 Septies" }],
    review: { status: "texto-verificado" },
  },
  {
    id: "u3-voz-ia",
    unitId: "u3",
    kind: "opcion-multiple",
    topic: "Normas relativas a inteligencia artificial",
    difficulty: "avanzado",
    title: "La voz clonada",
    prompt:
      "Una agencia usa inteligencia artificial para clonar la voz de una actriz de doblaje en un anuncio, sin su permiso. ¿Qué indica la LFDA reformada en 2026?",
    options: [
      {
        id: "a",
        text: "Se requiere su consentimiento; la protección abarca resultados generados con IA.",
        correct: true,
      },
      {
        id: "b",
        text: "No aplica la ley, porque una voz generada por IA es una obra nueva sin autor.",
        correct: false,
      },
      {
        id: "c",
        text: "Basta con mencionar el nombre de la actriz en los créditos del anuncio.",
        correct: false,
      },
      {
        id: "d",
        text: "Solo está prohibido si el anuncio se transmite en televisión abierta.",
        correct: false,
      },
    ],
    explanation:
      "Con la reforma publicada en el DOF el 14 de mayo de 2026, el art. 87 de la LFDA establece que la imagen, incluida la voz, de las personas artistas intérpretes solo puede usarse con su consentimiento expreso, y que esta protección abarca los resultados generados por sistemas de inteligencia artificial. El art. 121 exige un acuerdo previo y por escrito para cualquier clonación de voz o imagen con IA.",
    principle:
      "LFDA, art. 87 (reforma DOF 14-05-2026): usar la imagen o la voz de una persona intérprete requiere su consentimiento expreso, también si el resultado lo genera una IA. El art. 121 exige un acuerdo previo y por escrito para clonar voz o imagen.",
    sources: [{ sourceId: "lfda", pinpoint: "arts. 87, 118 fr. VII y 121 (reforma DOF 14-05-2026)" }],
    review: { status: "texto-verificado" },
  },
  {
    id: "u3-normas-ia",
    unitId: "u3",
    kind: "opcion-multiple",
    topic: "Normatividad nacional e internacional",
    difficulty: "intermedio",
    title: "Normas de IA en el mundo",
    prompt: "¿Qué es el Reglamento (UE) 2024/1689?",
    options: [
      {
        id: "a",
        text: "Normas armonizadas de la Unión Europea sobre inteligencia artificial.",
        correct: true,
      },
      {
        id: "b",
        text: "Una ley federal mexicana que tipifica los delitos informáticos.",
        correct: false,
      },
      {
        id: "c",
        text: "Un tratado mundial obligatorio para todos los países de la ONU.",
        correct: false,
      },
      {
        id: "d",
        text: "Una norma internacional sobre comercio electrónico y consumo.",
        correct: false,
      },
    ],
    explanation:
      "Es el Reglamento de Inteligencia Artificial de la Unión Europea, publicado en su Diario Oficial el 12 de julio de 2024. Según su considerando 179, se aplica de forma general desde el 2 de agosto de 2026, y sus prohibiciones desde el 2 de febrero de 2025. Es una norma europea, no mexicana. En el índice de leyes federales vigentes consultado no aparece una ley federal mexicana dedicada a la IA, aunque la LFDA ya incluye disposiciones sobre IA.",
    principle:
      "El Reglamento (UE) 2024/1689 regula la IA en la Unión Europea. En el índice de leyes federales consultado no aparece una ley mexicana específica de IA, pero la LFDA (art. 102) ya protege los programas de IA como obras.",
    sources: [
      { sourceId: "reglamentoIaUe", pinpoint: "considerando 179" },
      { sourceId: "indiceLeyes" },
      { sourceId: "lfda", pinpoint: "art. 102" },
    ],
    review: {
      status: "requiere-revision",
      note: "No se pudo leer el artículo 113 (entrada en vigor) del Reglamento; se citan fechas del considerando 179. Revisar si existen iniciativas o normas mexicanas nuevas sobre IA.",
    },
  },
  {
    id: "u3-residuos",
    unitId: "u3",
    kind: "escenario",
    topic: "Responsabilidad social y ambiental en las TIC",
    difficulty: "basico",
    title: "Equipos viejos",
    context:
      "Una escuela privada renovará 40 computadoras. Te piden decidir qué hacer con las viejas, que aún tienen archivos con datos de estudiantes.",
    prompt: "¿Qué propones?",
    options: [
      {
        id: "a",
        text: "Borro los discos de forma segura, reutilizo lo que sirva y reciclo el resto.",
        quality: "responsable",
        consequence:
          "Proteges los datos de los estudiantes, alargas la vida útil de los equipos y evitas que los residuos contaminen.",
      },
      {
        id: "b",
        text: "Las tiro con la basura normal; ya son viejas y nadie revisará los discos.",
        quality: "riesgosa",
        consequence:
          "Los componentes electrónicos contaminan y cualquiera podría recuperar los datos de los discos.",
      },
      {
        id: "c",
        text: "Las dono tal como están a una comunidad para darles una segunda vida.",
        quality: "parcial",
        consequence:
          "La donación es valiosa, pero entregar los discos sin borrar expone datos personales de los estudiantes.",
      },
      {
        id: "d",
        text: "Las vendo por partes en internet sin revisar qué información tienen.",
        quality: "riesgosa",
        consequence:
          "Obtienes dinero, pero vendes también los datos de los estudiantes a desconocidos.",
      },
    ],
    responsibleAlternative:
      "Primero borrar de forma segura la información; después reutilizar o donar lo que funcione y entregar el resto a un gestor de residuos electrónicos autorizado.",
    explanation:
      "La responsabilidad en las TIC incluye el final de la vida de los equipos. Los datos de un disco pueden recuperarse si no se borran de forma segura. Una escuela privada que trata datos personales está obligada a mantener medidas de seguridad contra el acceso no autorizado.",
    principle:
      "LFPDPPP, art. 18: quien trata datos personales debe protegerlos contra pérdida o acceso no autorizado, también al deshacerse de los equipos. La responsabilidad ambiental pide reutilizar y reciclar en lugar de tirar.",
    classification: [
      {
        type: "infraccion-administrativa",
        text: "Exponer datos por no aplicar medidas de seguridad puede ser infracción a la LFPDPPP (arts. 18 y 58, fr. XI). Una escuela pública se regiría por la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados.",
      },
    ],
    sources: [
      { sourceId: "lfpdppp", pinpoint: "arts. 18 y 58, fr. XI" },
      { sourceId: "lgpdppso" },
      { sourceId: "temario" },
    ],
    review: {
      status: "requiere-revision",
      note: "No se verificó la normatividad ambiental sobre residuos electrónicos; agregar la norma aplicable si el curso la aborda.",
    },
  },
];
