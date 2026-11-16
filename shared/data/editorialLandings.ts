import type { CommercialCategoryConfig } from '../../server/services/cms/catalog.service';
import type { EditorialPublication } from '../seo/editorialRoutes';

export type EditorialSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  items: Array<{title: string; description: string}>;
};

export type EditorialLandingContent = {
  label: string;
  title: string;
  description: string;
  heroProductSlug: string;
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
    heroProductSlug: 'encuadernacion-encolada-tapa-blanda',
    commercial: {
      anchorId: 'encuadernaciones-catalogos',
      intro: {eyebrow: 'Encuadernaciones recomendadas', title: 'Un catálogo que funciona en cada presentación', description: 'La paginación, el papel y la frecuencia de consulta orientan la elección. La rústica fresada aporta lomo; las grapas permiten una pieza ligera y el cosido refuerza las publicaciones de uso continuado.'},
      solutions: {groups: [{
        id: 'encuadernaciones', eyebrow: 'Del catálogo ligero a la edición con lomo', title: 'Elige la presencia y la apertura de tu catálogo',
        description: 'Te orientamos sobre el sistema adecuado sin que tengas que definir todos los detalles técnicos de antemano. Para catálogos de consulta sobre mesa también podemos valorar Wire-O oculto.',
        primaryProductSlug: 'encuadernacion-encolada-tapa-blanda',
        productSlugs: ['encuadernacion-encolada-tapa-blanda', 'encuadernado-con-grapas', 'cosida-tapa-blanda', 'encuadernacion-wire-o-oculto'],
      }]},
    },
    sections: [
      {
        id: 'aplicaciones', eyebrow: 'Aplicaciones y tipos de catálogos', title: 'Presenta tu oferta con una publicación hecha para vender',
        description: 'Definimos la pieza según dónde se entrega, cómo se consulta y qué imagen debe transmitir.',
        items: [
          {title: 'Catálogos comerciales y de producto', description: 'Colecciones, referencias, fotografías, fichas y servicios organizados para ayudar a tu equipo comercial y a tus clientes.'},
          {title: 'Ferias, showrooms y colecciones', description: 'Publicaciones para acompañar muestras, presentar novedades o entregar en una visita profesional, con un formato cómodo de transportar.'},
          {title: 'Tarifas y documentación comercial', description: 'Información de consulta que puede necesitar nuevas versiones. Valoramos una encuadernación práctica y la facilidad de actualización.'},
          {title: 'Catálogos premium', description: 'Papeles, cubiertas y acabados elegidos para reforzar la percepción de marca en colecciones y presentaciones especiales.'},
        ],
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
        id: 'produccion', eyebrow: 'Preparación y tiradas', title: 'Una producción adaptada a tu campaña comercial',
        description: 'Trabajamos tiradas cortas, reimpresiones y producciones más amplias. La elección del sistema de impresión depende de la cantidad, los materiales y las características del catálogo.',
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
    quoteDescription: 'Indica el formato cerrado, las páginas, la cantidad, el uso comercial y la fecha prevista. Si dudas sobre papeles o encuadernación, te ayudamos a definirlos.',
  },
} satisfies Partial<Record<EditorialPublication, EditorialLandingContent>>;

