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
