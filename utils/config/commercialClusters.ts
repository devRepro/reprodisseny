export type CommercialClusterImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export type CommercialClusterProduct = {
  slug: string;
  title: string;
  path: string;
  description: string;
  image: CommercialClusterImage;
  priority?: boolean;
};

export type CommercialClusterSolution = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  primaryProductSlug: string;
  productSlugs: string[];
};

export type CommercialClusterFact = {
  label: string;
  value: string;
};

export type CommercialClusterTextBlock = {
  eyebrow: string;
  title: string;
  description: string;
};

export type CommercialClusterUseCase = {
  title: string;
  description: string;
};

export type CommercialClusterConfig = {
  slug: string;
  anchorId: string;
  hero: {
    kicker: string;
    primaryCta: {
      label: string;
      to: string;
    };
    secondaryCta: {
      label: string;
      to: string;
    };
  };
  facts: CommercialClusterFact[];
  intro: CommercialClusterTextBlock;
  products: CommercialClusterProduct[];
  solutions: CommercialClusterSolution[];
  project: CommercialClusterTextBlock & {
    points: string[];
  };
  useCases: CommercialClusterTextBlock & {
    items: CommercialClusterUseCase[];
  };
  finalCta: CommercialClusterTextBlock & {
    primaryCta: {
      label: string;
      to: string;
    };
  };
};

const EVENTOS_PRODUCTS: CommercialClusterProduct[] = [
  {
    slug: "acreditaciones-personalizadas",
    title: "Acreditaciones personalizadas para eventos",
    path: "/productos/acreditaciones-personalizadas",
    description:
      "Acreditaciones para ferias, congresos y eventos corporativos con nombres, empresas, cargos, numeración, QR o códigos de barras.",
    priority: true,
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/eventos/acreditaciones.webp",
      alt: "Acreditaciones personalizadas impresas para congresos, ferias y eventos corporativos",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "lanyards-eventos-barcelona",
    title: "Lanyards personalizados para eventos en Barcelona",
    path: "/productos/lanyards-eventos-barcelona",
    description:
      "Lanyards para staff, ponentes, expositores o asistentes, con opciones de impresión a color y accesorios según el uso.",
    priority: true,
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/eventos/lanyard.webp",
      alt: "Lanyards personalizados para ferias, congresos y eventos corporativos",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "entradas-personalizadas",
    title: "Entradas personalizadas para eventos",
    path: "/productos/entradas-personalizadas",
    description:
      "Tickets impresos con opciones de numeración, microcorte, talón desprendible, datos variables y códigos QR o de barras.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/eventos/entradas.webp",
      alt: "Entradas personalizadas impresas para eventos, espectáculos y control de accesos",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "nombres-sobremesa-personalizados",
    title: "Nombres de sobremesa personalizados para eventos",
    path: "/productos/nombres-sobremesa-personalizados",
    description:
      "Identificadores de mesa para ponentes, invitados, equipos o numeración de mesa con formatos estables y datos variables.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/eventos/nombres-sobremesa.webp",
      alt: "Nombres de sobremesa personalizados para bodas, eventos y mesas corporativas",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "photocall-personalizado",
    title: "Photocall personalizado",
    path: "/productos/photocall-personalizado",
    description:
      "Fondos personalizados para puntos de foto, prensa, redes y presentaciones con materiales y sistemas pensados para montaje profesional.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/photocall.webp",
      alt: "Photocall personalizado impreso para eventos, presentaciones y campañas de marca",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "roll-up-personalizado",
    title: "Roll Up personalizado",
    path: "/productos/roll-up-personalizado",
    description:
      "Expositor enrollable para ferias, eventos, recepciones y puntos de información, fácil de transportar y montar.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/roll-up.webp",
      alt: "Roll up personalizado impreso para ferias, eventos y presentaciones corporativas",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "xbanner-personalizado",
    title: "X-Banner personalizado",
    path: "/productos/xbanner-personalizado",
    description:
      "Soporte ligero para promociones, puntos de información, ferias y campañas temporales con montaje rápido.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/xbanner.webp",
      alt: "X-Banner personalizado con gráfica impresa para ferias, tiendas y presentaciones",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "displays-de-mesa-personalizados",
    title: "Displays de mesa personalizados",
    path: "/productos/displays-de-mesa-personalizados",
    description:
      "Displays para mostradores, recepciones, mesas de acreditación, promociones y códigos QR.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/display.webp",
      alt: "Displays de mesa personalizados para mostradores, promociones y punto de venta",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "expositores-suelo-personalizados",
    title: "Expositores de suelo personalizados",
    path: "/productos/expositores-suelo-personalizados",
    description:
      "Displays de pie para guiar al visitante hacia una promoción, producto o punto concreto en ferias y eventos.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/expositor-suelo.webp",
      alt: "Expositores de suelo personalizados para retail, ferias y campañas promociónales",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "carteles-personalizados-gran-formato",
    title: "Carteles personalizados en gran formato",
    path: "/productos/carteles-personalizados-gran-formato",
    description:
      "Cartelería grande para campañas, eventos, retail y comunicación corporativa con formatos estándar o a medida.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/gran-formato/material-flexible/carteles.webp",
      alt: "Carteles personalizados de gran formato para escaparates, campañas y comunicación visual",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "vinilo-suelo-personalizado",
    title: "Vinilo para suelo personalizado",
    path: "/productos/vinilo-suelo-personalizado",
    description:
      "Vinilos de suelo para recorridos, indicaciones, zonas de espera y mensajes en áreas de tránsito.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/gran-formato/material-flexible/vinilo-para-suelo.webp",
      alt: "Vinilo para suelo personalizado para señalización, campañas y recorridos comerciales",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "vinilos-superficies-planas",
    title: "Vinilos para pared y superficies planas",
    path: "/productos/vinilos-superficies-planas",
    description:
      "Vinilos adhesivos de gran formato para branding, señalización interior y decoración temporal de espacios.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/gran-formato/material-flexible/vinilo-para-superficies-planas.webp",
      alt: "Vinilos para pared y superficies planas personalizados para decoración y señalización",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "vinilo-para-cristal",
    title: "Vinilo para cristal personalizado",
    path: "/productos/vinilo-para-cristal",
    description:
      "Vinilos para cristales, ventanas y mamparas con opciones transparentes, microperforadas, efecto ácido o corte.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/gran-formato/material-flexible/vinilo-cristal.webp",
      alt: "Vinilo para cristal personalizado para escaparates, oficinas y campañas temporales",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "flyers-personalizados",
    title: "Flyers personalizados",
    path: "/productos/flyers-personalizados",
    description:
      "Flyers para promoción, reparto, ferias y acciones comerciales, con combinación de formato, papel y acabado.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/publicidad-oficina/publicidad/flyers.webp",
      alt: "Flyers personalizados impresos para campañas comerciales, promociones y reparto publicitario",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "folletos-plegados-personalizados",
    title: "Folletos plegados personalizados",
    path: "/productos/folletos-plegados-personalizados",
    description:
      "Dípticos, trípticos y folletos plegables para ordenar información de servicios, ponencias, mapas o programas.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/publicidad-oficina/publicidad/folletos-plegados.webp",
      alt: "Folletos plegados personalizados para comunicación comercial, ferias y presentaciones",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "invitaciones-y-tarjetones-personalizados",
    title: "Invitaciones y tarjetones personalizados",
    path: "/productos/invitaciones-y-tarjetones-personalizados",
    description:
      "Tarjetones para convocatorias, inauguraciones, presentaciones, promociones o acciones de marca.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/publicidad-oficina/publicidad/tarjetones-e-invitaciones.webp",
      alt: "Invitaciones y tarjetones personalizados para eventos, celebraciones y comunicación premium",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "carpetas-de-presentacion-personalizadas",
    title: "Carpetas de presentación personalizadas",
    path: "/productos/carpetas-de-presentacion-personalizadas",
    description:
      "Carpetas A4 y A5 con solapas, lomo opcional, impresión a color y acabados para documentación corporativa.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/publicidad-oficina/oficina/carpetas-de-presentación.webp",
      alt: "Carpetas de presentación personalizadas para empresas y documentación corporativa",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "diplomas-personalizados",
    title: "Diplomas personalizados para eventos",
    path: "/productos/diplomas-personalizados",
    description:
      "Diplomas para formaciones, entregas de premios y actos corporativos, cuidando papel, color y acabados.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/eventos/diplomas.webp",
      alt: "Diplomas personalizados impresos para eventos, formación y ceremonias corporativas",
      width: 1200,
      height: 1200,
    },
  },
];


const EXPOSITORES_PRODUCTS: CommercialClusterProduct[] = [
  {
    slug: "roll-up-personalizado",
    title: "Roll Up personalizado",
    path: "/productos/roll-up-personalizado",
    description:
      "Expositor enrollable para ferias, congresos, recepciones y puntos de venta donde necesitas visibilidad rápida y montaje sencillo.",
    priority: true,
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/roll-up.webp",
      alt: "Roll up personalizado impreso para ferias, eventos y presentaciones corporativas",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "photocall-personalizado",
    title: "Photocall personalizado",
    path: "/productos/photocall-personalizado",
    description:
      "Fondo gráfico para eventos, prensa, redes y presentaciones donde la marca necesita una superficie visual protagonista.",
    priority: true,
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/photocall.webp",
      alt: "Photocall personalizado impreso para eventos, presentaciones y campañas de marca",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "xbanner-personalizado",
    title: "X-Banner personalizado",
    path: "/productos/xbanner-personalizado",
    description:
      "Sistema ligero para promociones, ferias y puntos de información que necesitan montaje rápido y fácil transporte.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/xbanner.webp",
      alt: "X-Banner personalizado con gráfica impresa para ferias, tiendas y presentaciones",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "marcos-photocall-personalizados",
    title: "Marcos para photocall personalizados",
    path: "/productos/marcos-photocall-personalizados",
    description:
      "Piezas rígidas y troqueladas para fotos, activaciones y campañas donde el usuario interactúa con la marca.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/eventos/marcos-photocall.webp",
      alt: "Marco para photocall personalizado para eventos y acciones de marca",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "cajas-de-luz-personalizadas",
    title: "Cajas de luz personalizadas",
    path: "/productos/cajas-de-luz-personalizadas",
    description:
      "Expositores retroiluminados para destacar mensajes en escaparates, stands, puntos de venta y espacios corporativos.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/cajas-de-luz.webp",
      alt: "Caja de luz LED personalizada con gráfica retroiluminada",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "expositores-de-mesa-personalizados",
    title: "Expositores de mesa personalizados",
    path: "/productos/expositores-de-mesa-personalizados",
    description:
      "Displays de sobremesa para mostradores, barras, recepciones y puntos de decisión cercanos al cliente.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/expositor-mesa.webp",
      alt: "Expositores de mesa personalizados para mostradores, promociones y venta de producto",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "expositores-suelo-personalizados",
    title: "Expositores de suelo personalizados",
    path: "/productos/expositores-suelo-personalizados",
    description:
      "Displays de pie para ganar visibilidad en entradas, pasillos, tiendas, ferias y zonas de promoción.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/expositor-suelo.webp",
      alt: "Expositores de suelo personalizados para retail, ferias y campañas promocionales",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "totems-publicitarios-personalizados",
    title: "Tótems publicitarios personalizados",
    path: "/productos/totems-publicitarios-personalizados",
    description:
      "Expositores verticales de suelo para comunicar a distancia en zonas de paso, stands, tiendas y recepciones.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/totem.webp",
      alt: "Tótems publicitarios personalizados para ferias, retail y comunicación de gran formato",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "cubrealarmas-tiendas-retail",
    title: "Cubrealarmas personalizados para tiendas",
    path: "/productos/cubrealarmas-tiendas-retail",
    description:
      "Soluciones PLV para convertir los arcos de seguridad en soportes de comunicación de alto impacto.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/cubre-alarmas.webp",
      alt: "Cubrealarmas personalizados para tiendas, retail y campañas de punto de venta",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "marcos-click-system-personalizados",
    title: "Marcos Click System",
    path: "/productos/marcos-click-system-personalizados",
    description:
      "Marcos porta pósters para campañas, precios y señalización que cambian con frecuencia en tienda u oficina.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/marco-click-system.webp",
      alt: "Marcos Click System personalizados para pósters, cartelería y cambio rápido de gráfica",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "banderolas-personalizadas",
    title: "Banderolas personalizadas",
    path: "/productos/banderolas-personalizadas",
    description:
      "Soportes textiles o de lona para ganar visibilidad en accesos, fachadas, recintos, eventos y espacios exteriores.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/banderolas.webp",
      alt: "Banderolas personalizadas para exterior, eventos y comunicación de marca",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "banner-golf-personalizado",
    title: "Banner Golf personalizado",
    path: "/productos/banner-golf-personalizado",
    description:
      "Expositor exterior ligero para acciones promocionales, eventos deportivos, accesos y señalización temporal.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/banner-golf.webp",
      alt: "Banner Golf personalizado para eventos deportivos y señalización exterior",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "caballetes-publicitarios-personalizados",
    title: "Caballetes publicitarios personalizados",
    path: "/productos/caballetes-publicitarios-personalizados",
    description:
      "Soportes de entrada para promociones, menús, horarios y señalización con opción de doble cara o cambio de gráfica.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/caballetes.webp",
      alt: "Caballetes publicitarios personalizados para tiendas, restaurantes y promociones exteriores",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "cubos-publicitarios-personalizados",
    title: "Cubos publicitarios personalizados",
    path: "/productos/cubos-publicitarios-personalizados",
    description:
      "Piezas de volumen para escaparates, eventos, promociones y puntos de foto con impresión a todo color.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/cubos.webp",
      alt: "Cubos publicitarios personalizados para eventos, escaparates y campañas promocionales",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "contenedores-de-reciclaje",
    title: "Contenedores de reciclaje personalizados",
    path: "/productos/contenedores-de-reciclaje",
    description:
      "Puntos funcionales con gráfica corporativa para oficinas, eventos, espacios públicos y campañas de sostenibilidad.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/expositores/contenedor-reciclaje.webp",
      alt: "Contenedores de reciclaje personalizados para oficinas, eventos y espacios corporativos",
      width: 1200,
      height: 1200,
    },
  },
  {
    slug: "arbol-navidad-corporativo",
    title: "Árbol de Navidad corporativo personalizado",
    path: "/productos/arbol-navidad-corporativo",
    description:
      "Pieza estacional de marca para escaparates, oficinas y eventos corporativos donde interesa crear un punto visual singular.",
    image: {
      src: "https://webcms.blob.core.windows.net/media/product/eventos/arbol-de-navidad.webp",
      alt: "Árbol de Navidad corporativo personalizado para espacios comerciales y eventos",
      width: 1200,
      height: 1200,
    },
  },
];

const EXPOSITORES_CLUSTER: CommercialClusterConfig = {
  slug: "expositores",
  anchorId: "soluciones-expositores",
  hero: {
    kicker: "Expositores, PLV y displays",
    primaryCta: {
      label: "Solicitar presupuesto",
      to: "/pedir-presupuesto",
    },
    secondaryCta: {
      label: "Ver soluciones",
      to: "#soluciones-expositores",
    },
  },
  facts: [
    {
      label: "Trayectoria",
      value: "Desde 1983",
    },
    {
      label: "Enfoque",
      value: "Ferias, retail y PLV",
    },
    {
      label: "Acompañamiento",
      value: "Formatos, materiales y montaje",
    },
    {
      label: "Producción",
      value: "Impresión, acabados y estructuras",
    },
  ],
  intro: {
    eyebrow: "Soluciones de exposición y PLV",
    title: "El expositor adecuado para cada espacio y objetivo",
    description:
      "No todos los espacios necesitan el mismo sistema. Organizamos las principales soluciones según el entorno, la visibilidad necesaria y la frecuencia de uso para que puedas comparar rápidamente qué expositor encaja mejor en tu proyecto.",
  },
  products: EXPOSITORES_PRODUCTS,
  solutions: [
    {
      id: "ferias-congresos-stands",
      eyebrow: "Ferias, congresos y stands",
      title: "Soportes preparados para montar y comunicar la marca",
      description:
        "Sistemas transportables y soluciones de gran impacto para presentar la marca, crear zonas de comunicación y preparar espacios expositivos profesionales.",
      primaryProductSlug: "roll-up-personalizado",
      productSlugs: [
        "roll-up-personalizado",
        "photocall-personalizado",
        "xbanner-personalizado",
        "marcos-photocall-personalizados",
        "cajas-de-luz-personalizadas",
      ],
    },
    {
      id: "retail-punto-venta",
      eyebrow: "Retail y punto de venta",
      title: "PLV para mostradores, entradas, pasillos y zonas comerciales",
      description:
        "PLV para mostradores, entradas, pasillos y zonas comerciales donde el mensaje debe captar la atención y facilitar la decisión de compra.",
      primaryProductSlug: "expositores-de-mesa-personalizados",
      productSlugs: [
        "expositores-de-mesa-personalizados",
        "expositores-suelo-personalizados",
        "totems-publicitarios-personalizados",
        "cubrealarmas-tiendas-retail",
        "marcos-click-system-personalizados",
      ],
    },
    {
      id: "exterior-accesos-promociones",
      eyebrow: "Exterior, accesos y promociones",
      title: "Sistemas visuales para entradas y acciones promocionales",
      description:
        "Expositores y sistemas visuales para entradas, espacios abiertos y acciones promocionales donde deben valorarse estabilidad, visibilidad y condiciones de instalación.",
      primaryProductSlug: "banderolas-personalizadas",
      productSlugs: [
        "banderolas-personalizadas",
        "banner-golf-personalizado",
        "caballetes-publicitarios-personalizados",
      ],
    },
    {
      id: "proyectos-especiales-medida",
      eyebrow: "Proyectos especiales y a medida",
      title: "Piezas personalizadas para campañas y activaciones",
      description:
        "Piezas personalizadas para campañas, activaciones y espacios donde un sistema estándar no resuelve la forma, las dimensiones o la función requerida.",
      primaryProductSlug: "cubos-publicitarios-personalizados",
      productSlugs: [
        "cubos-publicitarios-personalizados",
        "contenedores-de-reciclaje",
        "arbol-navidad-corporativo",
      ],
    },
  ],
  project: {
    eyebrow: "Un proyecto, diferentes soportes",
    title: "Coordina tus expositores y gráficas desde una misma producción",
    description:
      "Una campaña puede necesitar desde un roll-up o un display de mostrador hasta un photocall, un tótem o una caja de luz. Revisamos conjuntamente formatos, medidas, materiales, gráficas y sistemas de montaje para que todas las piezas mantengan una imagen coherente y lleguen preparadas para su espacio final.",
    points: [
      "Soluciones para ferias y congresos",
      "PLV para tiendas y puntos de venta",
      "Sistemas de interior y exterior",
      "Formatos estándar o a medida",
    ],
  },
  useCases: {
    eyebrow: "Casos de uso",
    title: "Expositores pensados para espacios y campañas reales",
    description:
      "Seleccionamos soportes según el espacio, la duración de la campaña y la distancia a la que debe leerse el mensaje.",
    items: [
      {
        title: "Ferias y congresos",
        description:
          "Roll-ups, X-Banners, photocalls, tótems y cajas de luz para stands, zonas de registro, presentaciones y espacios de marca.",
      },
      {
        title: "Tiendas y retail",
        description:
          "Displays, expositores de mesa y suelo, cubrealarmas y otros sistemas PLV para promociones, lanzamientos y campañas en punto de venta.",
      },
      {
        title: "Showrooms, recepciones y espacios corporativos",
        description:
          "Sistemas de presentación de marca, señalización e información para entradas, oficinas y zonas de atención.",
      },
      {
        title: "Exterior y acciones promocionales",
        description:
          "Banderolas, Banner Golf, caballetes y otras soluciones preparadas según el espacio, la estabilidad necesaria y la duración de la acción.",
      },
      {
        title: "Campañas y proyectos especiales",
        description:
          "Cubos, piezas troqueladas y soluciones a medida para activaciones, campañas estacionales y montajes singulares.",
      },
    ],
  },
  finalCta: {
    eyebrow: "Presupuesto para expositores",
    title: "Cuéntanos qué necesitas exponer o comunicar",
    description:
      "Indícanos el espacio, la fecha, las medidas aproximadas y los soportes previstos. Te orientamos sobre materiales, formatos y sistemas adecuados para cada pieza.",
    primaryCta: {
      label: "Solicitar presupuesto",
      to: "/pedir-presupuesto",
    },
  },
};
const EVENTOS_CLUSTER: CommercialClusterConfig = {
  slug: "eventos",
  anchorId: "soluciones-evento",
  hero: {
    kicker: "Eventos, ferias y congresos",
    primaryCta: {
      label: "Solicitar presupuesto",
      to: "/pedir-presupuesto",
    },
    secondaryCta: {
      label: "Ver soluciones",
      to: "#soluciones-evento",
    },
  },
  facts: [
    {
      label: "Trayectoria",
      value: "Desde 1983",
    },
    {
      label: "Proximidad",
      value: "Barcelona",
    },
    {
      label: "Acompañamiento",
      value: "Asesoramiento en materiales y formatos",
    },
    {
      label: "Producción",
      value: "Impresión, acabados y soportes gráficos",
    },
  ],
  intro: {
    eyebrow: "Soluciones para tu evento",
    title: "Todo lo que necesita tu evento",
    description:
      "Agrupamos los soportes gráficos por necesidad real para que puedas preparar identificación, visibilidad, orientación y material impreso dentro de un mismo proyecto.",
  },
  products: EVENTOS_PRODUCTS,
  solutions: [
    {
      id: "identificacion-acreditacion",
      eyebrow: "Identificación y acreditación",
      title: "Acreditaciones y lanyards preparados como un sistema",
      description:
        "Ordena asistentes, equipo, ponentes y accesos con piezas coordinadas desde el primer punto de contacto.",
      primaryProductSlug: "acreditaciones-personalizadas",
      productSlugs: [
        "acreditaciones-personalizadas",
        "lanyards-eventos-barcelona",
        "entradas-personalizadas",
        "nombres-sobremesa-personalizados",
      ],
    },
    {
      id: "visibilidad-stand",
      eyebrow: "Visibilidad y stand",
      title: "Soportes para que la marca se vea en el espacio",
      description:
        "Combina fondos, expositores y displays para presentar tu marca, señalizar zonas clave y reforzar mensajes comerciales.",
      primaryProductSlug: "photocall-personalizado",
      productSlugs: [
        "photocall-personalizado",
        "roll-up-personalizado",
        "xbanner-personalizado",
        "displays-de-mesa-personalizados",
        "expositores-suelo-personalizados",
      ],
    },
    {
      id: "senaletica-orientación",
      eyebrow: "Señalética y orientación",
      title: "Piezas para guiar recorridos y ordenar la visita",
      description:
        "Refuerza accesos, salas, recorridos y puntos de información con soportes visibles adaptados al espacio.",
      primaryProductSlug: "carteles-personalizados-gran-formato",
      productSlugs: [
        "carteles-personalizados-gran-formato",
        "vinilo-suelo-personalizado",
        "vinilos-superficies-planas",
        "vinilo-para-cristal",
      ],
    },
    {
      id: "material-impreso",
      eyebrow: "Material impreso",
      title: "Documentación y piezas impresas para acompañar la experiencia",
      description:
        "Prepara la información que se entrega antes, durante y después del evento con formatos fáciles de distribuir.",
      primaryProductSlug: "folletos-plegados-personalizados",
      productSlugs: [
        "flyers-personalizados",
        "folletos-plegados-personalizados",
        "invitaciones-y-tarjetones-personalizados",
        "carpetas-de-presentacion-personalizadas",
        "diplomas-personalizados",
      ],
    },
  ],
  project: {
    eyebrow: "Un proyecto, varios soportes",
    title: "Coordina la producción gráfica del evento desde una misma conversación",
    description:
      "Puedes pedir una pieza concreta o plantearnos el conjunto de materiales que necesitas. Revisamos medidas, usos, archivos y acabados para que las piezas funcionen juntas en feria, congreso o acto corporativo.",
    points: [
      "Identificación de asistentes y equipos",
      "Visibilidad de marca en stand y zonas de paso",
      "Señalización para orientar recorridos",
      "Material impreso para informar, entregar o acreditar",
    ],
  },
  useCases: {
    eyebrow: "Casos de uso",
    title: "Pensado para eventos donde cada soporte cumple una función",
    description:
      "La composición se adapta a eventos profesionales con necesidades de identificación, comunicación visual, orientación y material de apoyo.",
    items: [
      {
        title: "Ferias profesionales",
        description:
          "Material de stand, expositores, acreditaciones, folletos y señalización para puntos de contacto con visitantes.",
      },
      {
        title: "Congresos",
        description:
          "Acreditaciones, lanyards, programas, señalética de salas y material para ponentes o asistentes.",
      },
      {
        title: "Eventos corporativos",
        description:
          "Piezas impresas para presentaciones, jornadas internas, formaciones, inauguraciones y encuentros de empresa.",
      },
      {
        title: "Convenciones",
        description:
          "Soportes coordinados para recepción, escenario, mesas, recorridos y documentación de asistentes.",
      },
      {
        title: "Presentaciones y lanzamientos",
        description:
          "Photocalls, roll ups, invitaciones, tarjetones y material comercial para activar una marca o producto.",
      },
    ],
  },
  finalCta: {
    eyebrow: "Presupuesto para eventos",
    title: "Cuéntanos qué necesitas para tu evento",
    description:
      "Indícanos fecha, ubicación, soportes previstos y archivos disponibles. Te orientamos sobre materiales, formatos y acabados adecuados para cada pieza.",
    primaryCta: {
      label: "Solicitar presupuesto",
      to: "/pedir-presupuesto",
    },
  },
};

const COMMERCIAL_CLUSTERS: Record<string, CommercialClusterConfig> = {
  eventos: EVENTOS_CLUSTER,
  expositores: EXPOSITORES_CLUSTER,
};

export function getCommercialClusterConfig(
  slug: string | null | undefined,
): CommercialClusterConfig | null {
  const key = String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .at(-1);

  return key ? COMMERCIAL_CLUSTERS[key] ?? null : null;
}

export function getCommercialClusterProductSlugs(
  config: CommercialClusterConfig,
): string[] {
  return config.products.map((product) => product.slug);
}

