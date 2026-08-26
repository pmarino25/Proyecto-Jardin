export const SPACE_TYPES = [
  { value: "jardin", label: "Jardín" },
  { value: "patio", label: "Patio" },
  { value: "terraza", label: "Terraza" },
  { value: "balcon", label: "Balcón" },
  { value: "quincho", label: "Quincho / parrilla" },
];

export const STYLES = [
  { value: "moderno", label: "Moderno / minimalista" },
  { value: "rustico", label: "Rústico / natural" },
  { value: "tropical", label: "Tropical / exuberante" },
  { value: "mediterraneo", label: "Mediterráneo" },
  { value: "low-maintenance", label: "Bajo mantenimiento" },
];

export const BUDGETS = [
  { value: "hasta-100000", label: "Hasta $100.000" },
  { value: "100000-300000", label: "$100.000 - $300.000" },
  { value: "300000-700000", label: "$300.000 - $700.000" },
  { value: "mas-700000", label: "Más de $700.000" },
  { value: "sin-definir", label: "Todavía no lo definí" },
];

// value -> [label mostrado al cliente, sugerencia de categoría de producto/servicio]
export const DESIRED_ELEMENTS: { value: string; label: string; suggestion: string }[] = [
  { value: "plantas", label: "Más plantas / canteros", suggestion: "Plantas y canteros (vivero)" },
  { value: "cesped", label: "Césped nuevo o mejorado", suggestion: "Instalación o mantenimiento de césped" },
  { value: "deck", label: "Deck o piso nuevo", suggestion: "Deck / solado exterior" },
  { value: "pergola", label: "Pérgola o sombra", suggestion: "Pérgola / parasol / vela de sombra" },
  { value: "muebles", label: "Muebles de exterior", suggestion: "Muebles para exterior" },
  { value: "macetas", label: "Macetas y contenedores", suggestion: "Macetas y contenedores" },
  { value: "iluminacion", label: "Iluminación", suggestion: "Iluminación exterior" },
  { value: "riego", label: "Sistema de riego", suggestion: "Sistema de riego automático" },
  { value: "cerco", label: "Cerco / privacidad", suggestion: "Cerco vivo o de madera" },
  { value: "mano-obra", label: "Mano de obra / instalación", suggestion: "Servicio de jardinería / instalación" },
];

export const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  cotizada: "Cotizada",
  vendida: "Vendida",
  descartada: "Descartada",
};
