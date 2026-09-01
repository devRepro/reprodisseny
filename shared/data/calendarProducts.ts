export const CALENDAR_PRODUCT_SLUG = "calendarios-personalizados";
export const CALENDAR_LANDING_SLUG = "calendarios";
export const CALENDAR_LANDING_CAMPAIGN = "calendarios-2027";
export const CALENDAR_QUOTE_CONVERSION = "calendar_quote";

export type CalendarSize = {
  id: string;
  label: string;
};

export type CalendarModel = {
  id: string;
  label: string;
  title: string;
  context: string;
  imagePath: string;
  imageAlt: string;
  sizes: CalendarSize[];
};

export type CalendarLeadSelection = {
  modelId: string;
  sizeId: string;
  quantity?: string | number | null;
};

const calendarSizes = {
  dinA5: { id: "din-a5", label: "DIN A5" },
  dinA4: { id: "din-a4", label: "DIN A4" },
  dinA3: { id: "din-a3", label: "DIN A3" },
  square15: { id: "15x15", label: "15 × 15 cm" },
  panoramic21x10: { id: "21x10", label: "21 × 10 cm" },
  wall34x48: { id: "34x48", label: "34 × 48 cm" },
  custom: { id: "a-medida", label: "A medida" },
} as const satisfies Record<string, CalendarSize>;

export const calendarModels = [
  {
    id: "sobremesa-triangular",
    label: "Sobremesa triangular",
    title: "Calendario de mesa triangular",
    context: "Ideal para escritorios y campañas promocionales.",
    imagePath: "landing/calendarios/mesa-triangular.webp",
    imageAlt: "Calendario de mesa triangular personalizado",
    sizes: [calendarSizes.square15, calendarSizes.panoramic21x10, calendarSizes.custom],
  },
  {
    id: "sobremesa-wire-o",
    label: "Sobremesa con Wire-O",
    title: "Calendario de mesa con Wire-O",
    context: "Funcional, práctico y con una excelente presencia de marca.",
    imagePath: "landing/calendarios/mesa-wireo.webp",
    imageAlt: "Calendario de mesa con Wire-O personalizado",
    sizes: [calendarSizes.panoramic21x10, calendarSizes.dinA5, calendarSizes.custom],
  },
  {
    id: "pared-wire-o",
    label: "Pared con Wire-O",
    title: "Calendario de pared con Wire-O",
    context: "Un formato resistente y de gran calidad para oficinas y comercios.",
    imagePath: "landing/calendarios/pared-wireo.webp",
    imageAlt: "Calendario de pared con Wire-O personalizado",
    sizes: [calendarSizes.dinA4, calendarSizes.dinA3, calendarSizes.wall34x48, calendarSizes.custom],
  },
  {
    id: "pared-grapado",
    label: "Pared grapado",
    title: "Calendario de pared tipo revista",
    context: "Gran superficie para comunicar tu marca durante todo el año.",
    imagePath: "landing/calendarios/pared-revista.webp",
    imageAlt: "Calendario de pared tipo revista personalizado",
    sizes: [calendarSizes.dinA4, calendarSizes.dinA3, calendarSizes.wall34x48, calendarSizes.custom],
  },
  {
    id: "bolsillo",
    label: "Bolsillo",
    title: "Calendario de bolsillo",
    context: "Compacto y fácil de distribuir en campañas de gran volumen.",
    imagePath: "landing/calendarios/bolsillo.webp",
    imageAlt: "Calendario de bolsillo personalizado",
    sizes: [calendarSizes.custom],
  },
  {
    id: "otro-formato",
    label: "Otro formato a medida",
    title: "Otro formato a medida",
    context: "Para calendarios especiales definidos a partir de tu diseño.",
    imagePath: "landing/calendarios/hero.webp",
    imageAlt: "Calendarios corporativos personalizados",
    sizes: [calendarSizes.custom],
  },
] as const satisfies readonly CalendarModel[];

function normalizeOptionValue(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase()
    .replace(/[×]/g, "x")
    .replace(/\s+/g, " ");
}

export function getCalendarModel(value: unknown) {
  const normalized = normalizeOptionValue(value);
  if (!normalized) return null;

  return (
    calendarModels.find(
      (model) =>
        normalizeOptionValue(model.id) === normalized ||
        normalizeOptionValue(model.label) === normalized ||
        normalizeOptionValue(model.title) === normalized,
    ) ?? null
  );
}

export function getCalendarSize(model: CalendarModel, value: unknown) {
  const normalized = normalizeOptionValue(value);
  if (!normalized) return null;

  return (
    model.sizes.find(
      (size) =>
        normalizeOptionValue(size.id) === normalized ||
        normalizeOptionValue(size.label) === normalized,
    ) ?? null
  );
}

export function getCalendarSizesForModel(value: unknown) {
  return getCalendarModel(value)?.sizes ?? [];
}

export function isValidCalendarSelection(modelValue: unknown, sizeValue: unknown) {
  const model = getCalendarModel(modelValue);
  if (!model) return false;

  return Boolean(getCalendarSize(model, sizeValue));
}

export function coerceCalendarSizeForModel(modelValue: unknown, sizeValue: unknown) {
  const model = getCalendarModel(modelValue);
  if (!model) return "";

  return getCalendarSize(model, sizeValue)?.id ?? "";
}

export function createCalendarLeadExtras(selection: CalendarLeadSelection) {
  const model = getCalendarModel(selection.modelId);
  const size = model ? getCalendarSize(model, selection.sizeId) : null;

  if (!model || !size) return null;

  const quantity =
    selection.quantity === null || selection.quantity === undefined
      ? ""
      : String(selection.quantity).trim();

  return {
    landing: CALENDAR_LANDING_SLUG,
    campaign: CALENDAR_LANDING_CAMPAIGN,
    tipoCalendario: model.label,
    tamano: size.label,
    cantidad: quantity || null,
    calendarModelId: model.id,
    calendarSizeId: size.id,
    cmsProductSlug: CALENDAR_PRODUCT_SLUG,
  };
}
