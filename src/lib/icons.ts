/**
 * 50 Lucide icons for category selection, grouped by theme.
 * value = Lucide icon name (kebab-case)
 */
export const CATEGORY_ICONS = [
  // Hogar & vivienda
  { value: 'home',            label: 'Casa'        },
  { value: 'sofa',            label: 'Muebles'     },
  { value: 'bath',            label: 'Baño'        },
  { value: 'lamp',            label: 'Lámpara'     },
  { value: 'key',             label: 'Llave'       },
  // Servicios públicos
  { value: 'zap',             label: 'Electricidad'},
  { value: 'droplets',        label: 'Agua'        },
  { value: 'flame',           label: 'Gas'         },
  { value: 'wifi',            label: 'Internet'    },
  { value: 'phone',           label: 'Teléfono'    },
  // Entretenimiento
  { value: 'tv',              label: 'Streaming'   },
  { value: 'music',           label: 'Música'      },
  { value: 'gamepad-2',       label: 'Gaming'      },
  { value: 'clapperboard',    label: 'Cine'        },
  { value: 'book-open',       label: 'Libros'      },
  // Transporte
  { value: 'car',             label: 'Auto'        },
  { value: 'fuel',            label: 'Combustible' },
  { value: 'bus',             label: 'Bus'         },
  { value: 'bike',            label: 'Bici'        },
  { value: 'plane',           label: 'Vuelos'      },
  // Salud
  { value: 'shield-plus',     label: 'Salud'       },
  { value: 'pill',            label: 'Farmacia'    },
  { value: 'stethoscope',     label: 'Médico'      },
  { value: 'heart-pulse',     label: 'Cardio'      },
  { value: 'dumbbell',        label: 'Gimnasio'    },
  // Alimentación
  { value: 'shopping-cart',   label: 'Mercado'     },
  { value: 'utensils',        label: 'Restaurante' },
  { value: 'coffee',          label: 'Café'        },
  { value: 'pizza',           label: 'Comida'      },
  { value: 'apple',           label: 'Frutas'      },
  // Finanzas
  { value: 'credit-card',     label: 'Tarjeta'     },
  { value: 'banknote',        label: 'Banco'       },
  { value: 'piggy-bank',      label: 'Ahorro'      },
  { value: 'trending-up',     label: 'Inversión'   },
  { value: 'receipt',         label: 'Facturas'    },
  // Educación & trabajo
  { value: 'graduation-cap',  label: 'Educación'   },
  { value: 'briefcase',       label: 'Trabajo'     },
  { value: 'monitor',         label: 'Computador'  },
  { value: 'printer',         label: 'Impresora'   },
  { value: 'pen-tool',        label: 'Diseño'      },
  // Mascota & familia
  { value: 'dog',             label: 'Mascota'     },
  { value: 'baby',            label: 'Bebé'        },
  { value: 'gift',            label: 'Regalos'     },
  { value: 'smile',           label: 'Personal'    },
  { value: 'users',           label: 'Familia'     },
  // Suscripciones & otros
  { value: 'repeat',          label: 'Suscripción' },
  { value: 'cloud',           label: 'Cloud'       },
  { value: 'shield',          label: 'Seguro'      },
  { value: 'globe',           label: 'Internet'    },
  { value: 'more-horizontal', label: 'Otros'       },
] as const

export type IconValue = typeof CATEGORY_ICONS[number]['value']
