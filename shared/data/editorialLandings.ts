import type { CommercialCategoryConfig } from '../../server/services/cms/catalog.service';
import type { EditorialPublication } from '../seo/editorialRoutes';

export type EditorialSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  items: Array<{title: string; description: string}>;
  links?: Array<{label: string; to: string}>;
};

export type EditorialLandingContent = {
  label: string;
  title: string;
  description: string;
  commercial: CommercialCategoryConfig;
  sections: EditorialSection[];
  process: {title: string; description: string}[];
  faqs: {question: string; answer: string}[];
  quoteDescription: string;
};

export const editorialLandings = {
  catalogos: {
    label: 'Catálogos',
    title: 'Imprimir catálogos profesionales en Barcelona',
    description: 'Convierte tu colección, tus productos o tus servicios en una herramienta comercial. En Repro Disseny imprimimos catálogos personalizados y te ayudamos a decidir formato, papel y encuadernación según la imagen de marca, el contenido y el uso que tendrá cada ejemplar.',
    commercial: {
      anchorId: 'encuadernaciones-catalogos',
      intro: {eyebrow: 'Encuadernaciones recomendadas', title: 'Un catálogo que funciona en cada presentación', description: 'La paginación, el papel y la frecuencia de consulta orientan la elección. La rústica fresada aporta lomo; las grapas permiten una pieza ligera y el cosido refuerza las publicaciones de uso continuado.'},
      solutions: {groups: [{
        id: 'encuadernaciones', eyebrow: 'Del catálogo ligero a la edición con lomo', title: 'Elige la presencia y la apertura de tu catálogo',
        description: 'Te orientamos según el volumen y el uso. Las grapas facilitan una pieza ligera; el fresado aporta lomo y el cosido refuerza la consulta frecuente. Podemos valorar Wire-O para apertura sobre mesa y tapa dura para ediciones de conservación.',
        primaryProductSlug: 'encuadernacion-encolada-tapa-blanda',
        productSlugs: ['encuadernacion-encolada-tapa-blanda', 'encuadernado-con-grapas', 'cosida-tapa-blanda', 'encuadernacion-wire-o-oculto', 'encuadernacion-wire-o', 'encuadernacion-cosida-tapa-dura'],
      }]},
    },
    sections: [
      {
        id: 'aplicaciones', eyebrow: 'Aplicaciones y tipos de catálogos', title: 'Presenta tu oferta con una publicación hecha para vender',
        description: 'Definimos la pieza según dónde se entrega, cómo se consulta y qué imagen debe transmitir.',
        items: [
          {title: 'Catálogos comerciales y de producto', description: 'Colecciones de mobiliario o moda, referencias industriales, productos y servicios: fotografías y fichas organizadas para ayudar al equipo comercial y a sus clientes.'},
          {title: 'Ferias, showrooms y colecciones', description: 'Catálogos para ferias profesionales, congresos, showrooms y lanzamientos. Acompañan muestras y presentaciones, y permiten retomar la información después de una reunión comercial.'},
          {title: 'Tarifas y documentación comercial', description: 'Información de consulta que puede necesitar nuevas versiones. Valoramos una encuadernación práctica y la facilidad de actualización.'},
          {title: 'Catálogos premium', description: 'Papeles, cubiertas y acabados elegidos para reforzar la percepción de marca en colecciones y presentaciones especiales.'},
        ],
        links: [{label: 'Material gráfico para eventos y ferias', to: '/categorias/eventos'}],
      },
      {
        id: 'formatos-papeles', eyebrow: 'Formato y materiales', title: 'Papel y formato al servicio de tus productos',
        description: 'A4, A5, formatos cuadrados o medidas personalizadas: buscamos el equilibrio entre fotografía, información, manejo y distribución.',
        items: [
          {title: 'Interiores', description: 'Papeles estucados mate o brillo para fotografía y reproducción del color; offset, reciclados y otras opciones cuando prima el tacto o la lectura. El gramaje se valora junto con la paginación y la encuadernación.'},
          {title: 'Cubiertas', description: 'Cartulinas gráficas o papeles de mayor gramaje para aportar presencia y protección. Podemos valorar solapas y papeles texturados según la propuesta gráfica.'},
          {title: 'Formato y distribución', description: 'El tamaño final, el número de páginas y el peso influyen en la consulta, el transporte y el envío. Revisamos el conjunto antes de cerrar las características del catálogo.'},
        ],
      },
      {
        id: 'acabados', eyebrow: 'Acabados de cubiertas', title: 'Detalles que refuerzan la identidad de marca',
        description: 'Seleccionamos el acabado por su efecto visual, el tacto y la protección que necesita la publicación. Confirmamos su compatibilidad con el papel y la encuadernación.',
        items: [
          {title: 'Laminado mate, brillo o soft touch', description: 'El laminado protege la cubierta frente al uso y modifica su aspecto. Soft touch aporta un tacto suave cuando el proyecto requiere esa sensación.'},
          {title: 'Barniz selectivo y stamping', description: 'Permiten destacar títulos, logotipos o detalles de la portada. Se preparan como acabados específicos en el archivo de producción.'},
          {title: 'Gofrado y solapas', description: 'El relieve en seco aporta textura; las solapas ofrecen espacio adicional para información y mejoran la presentación de la cubierta.'},
        ],
      },
      {
        id: 'produccion', eyebrow: 'Preparación y tiradas', title: 'Producción de catálogos para tu campaña comercial',
        description: 'Valoramos impresión digital u offset según la cantidad, los materiales y las características del catálogo. Como imprenta de catálogos, revisamos contigo la reproducción de imágenes y los archivos antes de concretar la producción.',
        items: [
          {title: 'Preparación de archivos', description: 'Entrega un PDF de alta calidad con páginas ordenadas, tipografías incrustadas y sangrado. Si hay lomo, definimos su ancho según el papel y la paginación antes de cerrar la cubierta.'},
          {title: 'Revisión técnica', description: 'Comprobamos medidas, márgenes, imágenes y acabados antes de producir. Si necesitas reproducir un catálogo anterior, aporta un ejemplar o una referencia para valorar materiales y color.'},
        ],
      },
    ],
    process: [
      {title: 'Definimos el catálogo', description: 'Revisamos finalidad comercial, formato, páginas, cantidad y fecha de uso.'},
      {title: 'Elegimos materiales y encuadernación', description: 'Combinamos papel interior, cubierta y acabados según tu marca y el uso previsto.'},
      {title: 'Revisamos e imprimimos', description: 'Comprobamos los archivos y preparamos la producción con las características acordadas.'},
      {title: 'Terminamos y entregamos', description: 'Encuadernamos y entregamos los catálogos listos para presentaciones, visitas o distribución.'},
    ],
    faqs: [
      {question: '¿Qué encuadernación conviene para un catálogo de producto?', answer: 'Depende del volumen y del uso. Las grapas funcionan para piezas ligeras; la rústica fresada aporta lomo a catálogos más extensos. Para consulta frecuente o una edición especial podemos valorar cosido o Wire-O oculto.'},
      {question: '¿Puedo imprimir pocos catálogos o reimprimir una colección?', answer: 'Sí. Valoramos tiradas cortas y reimpresiones con impresión digital, así como producciones más amplias. Indica cantidad, páginas y materiales para elegir el sistema adecuado.'},
      {question: '¿Qué papel ayuda a presentar fotografías de producto?', answer: 'Los estucados mate o brillo son opciones habituales. La elección depende de las imágenes, el acabado deseado y el tacto. Podemos asesorarte sobre interiores y cubierta como conjunto.'},
      {question: '¿Se pueden hacer catálogos con medidas personalizadas y solapas?', answer: 'Sí. Revisamos el formato, las solapas, la encuadernación y el papel para confirmar la viabilidad de la propuesta antes de producir.'},
      {question: '¿Qué necesitáis para presupuestar un catálogo?', answer: 'Formato cerrado, páginas interiores, cantidad, idea de papel y acabados, y fecha prevista. Si todavía no has decidido la encuadernación o los materiales, te orientamos a partir del uso y del contenido.'},
    ],
    quoteDescription: 'Indica los ejemplares, el formato cerrado, las páginas interiores, el papel y el tipo de cubierta. Añade la encuadernación, los acabados y la fecha y el lugar de entrega. Si todavía no has elegido materiales, te ayudamos a definirlos.',
  },
  revistas: {
    label: 'Revistas',
    title: 'Impresión de revistas personalizadas en Barcelona',
    description: 'Imprimimos revistas personalizadas para empresas, editoriales, agencias y entidades. Adaptamos formato, paginación, papel y acabados a la identidad de cada publicación, cuidando la reproducción del color y la lectura de cada número, con una producción ajustada a su periodicidad y distribución.',
    commercial: {
      anchorId: 'encuadernaciones-revistas',
      intro: {eyebrow: 'Grapado y fresado', title: 'La encuadernación que necesita cada edición', description: 'El número de páginas y el grosor del papel condicionan la solución. Comparamos las opciones contigo para mantener una revista manejable y cómoda de leer.'},
      solutions: {groups: [{
        id: 'encuadernaciones', eyebrow: 'De la revista ligera a la edición con lomo', title: 'Grapas para ligereza, fresado para más contenido',
        description: 'El caballito une los pliegos con grapas y facilita una publicación ligera. La rústica fresada reúne las páginas en un lomo encolado. Para ediciones que requieren mayor resistencia también podemos valorar cosido en tapa blanda.',
        primaryProductSlug: 'encuadernado-con-grapas',
        productSlugs: ['encuadernado-con-grapas', 'encuadernacion-encolada-tapa-blanda', 'cosida-tapa-blanda'],
      }]},
    },
    sections: [
      {
        id: 'aplicaciones', eyebrow: 'Revistas editoriales y corporativas', title: 'Cada número, una nueva conversación con tus lectores',
        description: 'El contenido y el público definen la revista: una herramienta de comunicación interna, un proyecto cultural o una publicación para suscriptores necesitan decisiones diferentes.',
        items: [
          {title: 'Revistas corporativas', description: 'Publicaciones de empresa y de marca para compartir novedades, proyectos, entrevistas y contenidos con equipos, clientes o colaboradores.'},
          {title: 'Revistas editoriales y culturales', description: 'Ediciones con identidad propia, donde el ritmo de lectura, la fotografía, las ilustraciones y el papel forman parte de la experiencia.'},
          {title: 'Asociaciones e instituciones', description: 'Revistas de entidades, boletines y documentación informativa para mantener una relación periódica con socios y comunidades.'},
          {title: 'Publicaciones periódicas y promocionales', description: 'Planificamos contigo cada número según la fecha de salida, la cantidad y las necesidades de distribución. Las características se revisan antes de cada producción.'},
        ],
      },
      {
        id: 'formatos', eyebrow: 'Revistas A4, A5 y formatos especiales', title: 'Un formato pensado para el contenido y la distribución',
        description: 'Elegimos el tamaño junto con el diseño, la encuadernación y la manera en que se entrega y consulta cada edición.',
        items: [
          {title: 'Revistas A4 · 210 × 297 mm', description: 'Espacio para reportajes, fotografía, entrevistas y documentación profesional. Un formato habitual cuando conviven imágenes e información detallada.'},
          {title: 'Revistas A5 · 148 × 210 mm', description: 'Una opción compacta para boletines, revistas de asociaciones y publicaciones promocionales que se entregan en mano o se transportan con frecuencia.'},
          {title: 'Formatos personalizados', description: 'Podemos valorar medidas especiales según la propuesta editorial. Comprobamos su compatibilidad con el papel, la paginación, la encuadernación y las necesidades de entrega.'},
        ],
      },
      {
        id: 'paginacion-archivos', eyebrow: 'Paginación y preparación de archivos', title: 'Prepara la revista pensando en cómo se encuaderna',
        description: 'La elección de encuadernación debe entrar en la maqueta antes de cerrar el PDF. Revisamos páginas, márgenes y cubierta para evitar ajustes de última hora.',
        items: [
          {title: 'Revistas grapadas', description: 'La paginación total se plantea en múltiplos de cuatro, incluyendo la cubierta cuando forma parte del mismo conjunto de pliegos. El gramaje y el número de páginas afectan al grosor y al desplazamiento de las hojas; confirmamos la solución antes de imprimir.'},
          {title: 'Revistas fresadas', description: 'Necesitan una cubierta ajustada al ancho real del lomo y márgenes interiores que faciliten la lectura. Definimos el lomo según el papel y las páginas; no conviene reutilizar su medida de otro número sin comprobarla.'},
          {title: 'PDF y revisión técnica', description: 'Prepara un PDF de alta calidad con tipografías incrustadas, sangrado e imágenes adecuadas al tamaño final. Entrega las páginas en orden de lectura y consulta la preparación de la cubierta y de las separaciones de acabados.'},
        ],
      },
      {
        id: 'papeles-cubiertas', eyebrow: 'Papeles interiores y cubiertas', title: 'Equilibrio entre imagen, lectura y peso',
        description: 'El papel influye en la reproducción del color, la opacidad, el tacto y el peso de cada ejemplar. Lo valoramos junto con el formato y la distribución de la revista.',
        items: [
          {title: 'Interiores estucados', description: 'Acabados mate o brillo para publicaciones con protagonismo de fotografía, ilustración y color.'},
          {title: 'Offset y reciclados', description: 'Alternativas para revistas donde interesan una lectura cómoda, un tacto diferente o una propuesta de materiales concreta.'},
          {title: 'Cubierta diferenciada o mismo papel', description: 'Una cubierta de mayor gramaje aporta protección y presencia. En publicaciones ligeras se puede valorar el mismo papel del interior, según la encuadernación y el uso.'},
        ],
      },
      {
        id: 'acabados', eyebrow: 'Acabados disponibles', title: 'Una portada reconocible en cada número',
        description: 'Desde una cubierta sencilla hasta una edición especial, elegimos los acabados por su función y por su compatibilidad con el soporte.',
        items: [
          {title: 'Protección y tacto', description: 'Laminados mate, brillo o soft touch para cubiertas que necesitan mayor protección o una sensación específica al tacto.'},
          {title: 'Detalles de portada', description: 'Barniz selectivo, stamping o gofrado para destacar elementos de una edición especial. Se presupuestan y preparan según el diseño y los materiales.'},
          {title: 'Solapas', description: 'Una opción para determinadas cubiertas en rústica que permite ampliar la información editorial o de marca.'},
        ],
      },
      {
        id: 'tiradas', eyebrow: 'Tiradas y continuidad editorial', title: 'Produce cada edición según sus necesidades',
        description: 'Valoramos tiradas cortas, reimpresiones y producciones más amplias con impresión digital u offset según las características del trabajo. El papel, las páginas, el sistema de impresión y la distribución determinan la propuesta; no hay una cantidad universal.',
        items: [
          {title: 'Nuevos números y reimpresiones', description: 'Podemos ajustar la cantidad a cada edición y revisar si se mantienen papel, formato y acabados. Facilita un ejemplar anterior si necesitas continuidad entre números.'},
          {title: 'Calendario de publicación', description: 'Indica la fecha de distribución y cuándo estarán disponibles los archivos definitivos. Confirmamos la planificación de producción a partir de las características del trabajo.'},
        ],
      },
    ],
    process: [
      {title: 'Planificamos la edición', description: 'Concretamos formato, periodicidad, fecha de distribución, páginas y cantidad de ejemplares.'},
      {title: 'Definimos papel y encuadernación', description: 'Revisamos la combinación de interiores, cubierta y grapado o fresado para ese número.'},
      {title: 'Comprobamos el PDF e imprimimos', description: 'Verificamos medidas, orden de páginas, márgenes, sangrado y preparación de la cubierta.'},
      {title: 'Encuadernamos y entregamos', description: 'Terminamos la revista para su distribución y conservamos las especificaciones acordadas como referencia para siguientes ediciones.'},
    ],
    faqs: [
      {question: '¿Cuándo conviene grapar una revista y cuándo fresarla?', answer: 'Las grapas son habituales en revistas ligeras y de pocas páginas. Cuando el volumen necesita un lomo, se valora el fresado. La decisión depende también del grosor del papel y del uso, por lo que comprobamos la combinación antes de producir.'},
      {question: '¿Cuántas páginas debe tener una revista grapada?', answer: 'Se planifica en múltiplos de cuatro por la estructura de los pliegos. Si la cubierta se produce por separado hay que concretar su preparación. No existe un máximo único: depende del formato y del grosor de los materiales.'},
      {question: '¿Podéis imprimir revistas corporativas periódicas?', answer: 'Sí. Trabajamos publicaciones de empresa, entidades y proyectos editoriales. Indica la frecuencia, las fechas de salida y las características previstas para planificar cada edición.'},
      {question: '¿Se pueden imprimir tiradas cortas y números especiales?', answer: 'Sí. Valoramos cantidad, papel, páginas y acabados para elegir el sistema de impresión y presupuestar cada número, sin exigir que todas las ediciones tengan las mismas características.'},
      {question: '¿Cómo preparo el PDF de una revista?', answer: 'Con páginas en orden de lectura, tipografías incrustadas, sangrado y calidad de imagen suficiente. Consulta con nosotros la preparación de la cubierta y, si hay fresado, confirma el ancho del lomo antes de cerrarla.'},
      {question: '¿Puedo usar un papel distinto en la cubierta?', answer: 'Sí. Es habitual valorar una cubierta de mayor gramaje para dar presencia y protección. La compatibilidad del papel y de los acabados se revisa junto con la encuadernación.'},
      {question: '¿Podéis imprimir revistas A4 y A5?', answer: 'Sí. A4 mide 210 × 297 mm y A5, 148 × 210 mm. El primero ofrece espacio para fotografía e información detallada; el segundo es más compacto para entrega y lectura en movimiento. También valoramos medidas personalizadas según los materiales y la encuadernación.'},
    ],
    quoteDescription: 'Para imprimir una revista personalizada, indícanos ejemplares, formato cerrado, páginas, papel interior y tipo de cubierta. Añade encuadernación, acabados, periodicidad y necesidades de entrega. Si dudas entre grapado y fresado, te orientamos antes de preparar el presupuesto.',
  },
} satisfies Record<EditorialPublication, EditorialLandingContent>;

