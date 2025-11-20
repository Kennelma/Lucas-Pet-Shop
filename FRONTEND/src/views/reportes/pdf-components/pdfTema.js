// ✅ EXCEPCIONES ESPECÍFICAS
export class PDFValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'PDFValidationError';
    this.field = field;
  }
}

export class PDFGenerationError extends Error {
  constructor(message, phase) {
    super(message);
    this.name = 'PDFGenerationError';
    this.phase = phase;
  }
}

// ✅ SISTEMA DE LOGGING MEJORADO
export const Logger = {
  level: 'info', // 'error' | 'warn' | 'info' | 'debug'
  history: [],
  maxHistory: 100,

  _log(level, message, data = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
    
    this.history.push(entry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    const emoji = { error: '❌', warn: '⚠️', info: 'ℹ️', debug: '🔍' }[level];
    const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    
    if (data) {
      console[method](`${emoji} [PDF] ${message}`, data);
    } else {
      console[method](`${emoji} [PDF] ${message}`);
    }
  },

  error(message, data) { this._log('error', message, data); },
  warn(message, data) { this._log('warn', message, data); },
  info(message, data) { this._log('info', message, data); },
  debug(message, data) { this._log('debug', message, data); },

  getHistory() { return [...this.history]; },
  clearHistory() { this.history = []; },
  exportHistory() { return JSON.stringify(this.history, null, 2); }
};

// ✅ SISTEMA DE CACHÉ
export const PDFCache = {
  _cache: new Map(),
  _maxSize: 50,
  _stats: { hits: 0, misses: 0 },

  get(key) {
    if (this._cache.has(key)) {
      this._stats.hits++;
      Logger.debug(`Cache hit: ${key}`);
      return this._cache.get(key);
    }
    this._stats.misses++;
    Logger.debug(`Cache miss: ${key}`);
    return null;
  },

  set(key, value) {
    if (this._cache.size >= this._maxSize) {
      const firstKey = this._cache.keys().next().value;
      this._cache.delete(firstKey);
      Logger.debug(`Cache evicted: ${firstKey}`);
    }
    this._cache.set(key, value);
    Logger.debug(`Cache set: ${key}`);
  },

  clear() {
    this._cache.clear();
    Logger.info('Cache cleared');
  },

  getStats() { return { ...this._stats, size: this._cache.size }; }
};

// ✅ PROGRESS TRACKING
export const ProgressTracker = {
  _listeners: [],
  _current: { phase: '', progress: 0, total: 0 },

  start(phase, total) {
    this._current = { phase, progress: 0, total };
    this._notify();
    Logger.info(`Started: ${phase} (${total} items)`);
  },

  update(progress) {
    this._current.progress = progress;
    this._notify();
  },

  complete() {
    this._current.progress = this._current.total;
    this._notify();
    Logger.info(`Completed: ${this._current.phase}`);
  },

  _notify() {
    const percent = this._current.total > 0 
      ? Math.round((this._current.progress / this._current.total) * 100) 
      : 0;
    this._listeners.forEach(fn => fn({ ...this._current, percent }));
  },

  onProgress(callback) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter(fn => fn !== callback);
    };
  },

  getStatus() { return { ...this._current }; }
};

// 🟠 CONSTANTES DE CONFIGURACIÓN
export const CONFIG = {
  locale: 'es-HN',
  currency: 'HNL',
  dateFormat: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  reportTypes: {
    DIARIO: 'diario',
    MENSUAL: 'mensual',
    ANUAL: 'anual',
  },
  fileNamePatterns: {
    diario: 'Reporte-Diario-{mes}-{anio}.pdf',
    mensual: 'Reporte-Mensual-{mes}-{anio}.pdf',
    anual: 'Reporte-Anual-{anio}.pdf',
  },
  validations: {
    minYear: 2020,
    maxYear: 2100,
    maxTableRows: 10000,
    maxCellHeight: 200,
    maxStringLength: 5000,
    maxFileSize: 50 * 1024 * 1024, // 50MB
  },
  performance: {
    enableCache: true,
    enableProgressTracking: true,
    batchSize: 100,
  },
};

// 🟠 CONSTANTES DE TIPOS DE MOVIMIENTO
export const TIPO_MOVIMIENTO = {
  INGRESO: 'INGRESO',
  GASTO: 'GASTO',
  RESUMEN: '--- RESUMEN ---',
};

export const INDICADORES_DIARIO = ['Diario', 'DIARIO', 'diario'];
export const UMBRAL_DIAS_VS_MESES = 12;

// ✅ SISTEMA DE TEMAS DINÁMICOS
export const ThemeManager = {
  _themes: new Map(),
  _activeTheme: 'default',

  register(name, themeOverrides) {
    this._themes.set(name, themeOverrides);
    Logger.info(`Theme registered: ${name}`);
  },

  setActive(name) {
    if (!this._themes.has(name) && name !== 'default') {
      Logger.warn(`Theme not found: ${name}, using default`);
      return false;
    }
    this._activeTheme = name;
    Logger.info(`Theme activated: ${name}`);
    return true;
  },

  getActive() {
    if (this._activeTheme === 'default') return theme;
    
    const overrides = this._themes.get(this._activeTheme);
    return this._mergeTheme(theme, overrides);
  },

  _mergeTheme(base, overrides) {
    return {
      ...base,
      colors: { ...base.colors, ...overrides.colors },
      fontSizes: { ...base.fontSizes, ...overrides.fontSizes },
      fonts: { ...base.fonts, ...overrides.fonts },
    };
  },

  list() { return ['default', ...Array.from(this._themes.keys())]; }
};

// ✅ INTERNACIONALIZACIÓN (i18n)
export const i18n = {
  _locale: 'es-HN',
  _translations: {
    'es-HN': {
      reportTitle: {
        diario: 'Reporte Diario',
        mensual: 'Reporte Mensual',
        anual: 'Reporte Anual',
      },
      labels: {
        ingresos: 'INGRESOS',
        gastos: 'GASTOS',
        balance: 'BALANCE',
        fecha: 'FECHA',
        factura: 'FACTURA',
        concepto: 'CONCEPTO',
        monto: 'MONTO',
        documento: 'DOCUMENTO',
        detalle: 'DETALLE',
        generado: 'GENERADO',
        resumen: 'RESUMEN DEL PERIODO',
        footer: 'SISTEMA DE REPORTES FINANCIEROS',
        pagina: 'PAGINA',
        de: 'DE',
      },
      errors: {
        invalidData: 'Datos inválidos',
        generationFailed: 'Error al generar PDF',
        validationFailed: 'Error de validación',
      },
    },
    'en-US': {
      reportTitle: {
        diario: 'Daily Report',
        mensual: 'Monthly Report',
        anual: 'Annual Report',
      },
      labels: {
        ingresos: 'INCOME',
        gastos: 'EXPENSES',
        balance: 'BALANCE',
        fecha: 'Date',
        factura: 'Invoice',
        concepto: 'Concept',
        monto: 'Amount',
        documento: 'Document',
        detalle: 'Detail',
        generado: 'Generated',
        resumen: 'Period Summary',
        footer: 'Financial Reports System',
        pagina: 'Page',
        de: 'of',
      },
      errors: {
        invalidData: 'Invalid data',
        generationFailed: 'PDF generation failed',
        validationFailed: 'Validation error',
      },
    },
  },

  setLocale(locale) {
    if (this._translations[locale]) {
      this._locale = locale;
      Logger.info(`Locale changed to: ${locale}`);
      return true;
    }
    Logger.warn(`Locale not found: ${locale}`);
    return false;
  },

  t(key) {
    const keys = key.split('.');
    let value = this._translations[this._locale];
    
    for (const k of keys) {
      value = value?.[k];
      if (!value) break;
    }
    
    return value || key;
  },

  getLocale() { return this._locale; },
  getSupportedLocales() { return Object.keys(this._translations); }
};

// ✅ VALIDACIÓN DE SALIDA PDF
export const PDFValidator = {
  validateOutput(doc) {
    const issues = [];

    try {
      const pageCount = doc.internal.getNumberOfPages();
      if (pageCount === 0) {
        issues.push({ level: 'error', message: 'No pages generated' });
      }
      if (pageCount > 1000) {
        issues.push({ level: 'warn', message: `Too many pages: ${pageCount}` });
      }

      const pdfSize = doc.output('arraybuffer').byteLength;
      if (pdfSize > CONFIG.validations.maxFileSize) {
        issues.push({ level: 'error', message: `File too large: ${pdfSize} bytes` });
      }
      if (pdfSize < 1000) {
        issues.push({ level: 'warn', message: 'File suspiciously small' });
      }

      Logger.info(`PDF validated: ${pageCount} pages, ${(pdfSize / 1024).toFixed(2)} KB`);
    } catch (error) {
      issues.push({ level: 'error', message: `Validation failed: ${error.message}` });
    }

    return {
      valid: !issues.some(i => i.level === 'error'),
      issues
    };
  }
};

// Registrar temas predefinidos
ThemeManager.register('dark', {
  colors: {
    primary: [59, 130, 246],
    text: { primary: [229, 231, 235] },
    bg: { header: [31, 41, 55] },
  },
});

ThemeManager.register('highContrast', {
  colors: {
    primary: [0, 0, 0],
    success: [0, 128, 0],
    danger: [255, 0, 0],
  },
  fontSizes: {
    title: 24,
    subtitle: 14,
    body: 11,
  },
});

// Tema centralizado para PDFs
const theme = {
  fonts: {
    regular: 'helvetica',
    bold: 'helvetica',
  },
  fontSizes: {
    title: 20,        // Títulos principales
    subtitle: 11,     // Subtítulos
    body: 9,          // Texto normal
    small: 8,         // Texto pequeño
    tiny: 7,          // Texto muy pequeño
    amount: 12,       // Montos en tarjetas
  },
  colors: {
    primary: [37, 99, 235],      // Azul principal
    secondary: [107, 114, 128],  // Gris secundario
    success: [22, 163, 74],      // Verde (ingresos)
    successDark: [22, 101, 52],  // Verde oscuro
    successLight: [21, 128, 61], // Verde claro
    danger: [220, 38, 38],       // Rojo (gastos)
    dangerDark: [185, 28, 28],   // Rojo oscuro
    dangerMedium: [190, 50, 50], // Rojo medio
    warning: [234, 88, 12],      // Naranja (balance negativo)
    text: {
      primary: [55, 65, 81],     // Texto principal
      secondary: [107, 114, 128], // Texto secundario
      dark: [31, 41, 55],        // Texto oscuro
      medium: [70, 70, 85],      // Texto medio
      light: [60, 60, 70],       // Texto claro
    },
    bg: {
      header: [239, 246, 255],   // Fondo encabezado
      cardIngresos: [220, 252, 231], // Tarjeta ingresos
      cardGastos: [254, 226, 226],   // Tarjeta gastos
      cardBalance: [219, 234, 254],  // Tarjeta balance
      cardBalanceNegative: [255, 237, 213], // Balance negativo
      tableHeader: [243, 244, 246],  // Encabezado tabla
      tableRow: [249, 250, 251],     // Fila tabla
      ingresosHeader: [220, 252, 231], // Encabezado ingresos
      ingresosRow: [248, 252, 248],    // Fila ingresos
      gastosHeader: [255, 240, 240],   // Encabezado gastos
      gastosRow: [255, 250, 250],      // Fila gastos
      resumen: [219, 234, 254],        // Fondo resumen
    },
  },
  padding: {
    base: 15,         // Padding universal
    small: 5,         // Padding pequeño
    medium: 10,       // Padding medio
    large: 20,        // Padding grande
    card: 56,         // Ancho de tarjetas
    cardHeight: 22,   // Alto de tarjetas
  },
  spacing: {
    lineHeight: 6,    // Alto de línea base
    rowHeight: 7,     // Alto de fila tabla
    sectionGap: 15,   // Espacio entre secciones
    headerGap: 10,    // Espacio después de encabezados
  },
  dimensions: {
    pageWidth: 210,
    tableWidth: 180,
    marginBottom: 30,
    conceptColumnWidth: 95,  // Ancho columna concepto ingresos
    gastosColumnWidth: 85,   // Ancho columna detalle gastos
  },
};

// Helpers para aplicar estilos
export const setFont = (doc, weight = 'regular') => {
  doc.setFont(theme.fonts[weight], weight === 'bold' ? 'bold' : 'normal');
};

export const setFontSize = (doc, sizeName) => {
  doc.setFontSize(theme.fontSizes[sizeName]);
};

export const setColor = (doc, colorPath) => {
  const keys = colorPath.split('.');
  let color = theme.colors;
  keys.forEach(key => color = color[key]);
  doc.setTextColor(...color);
};

export const setFillColor = (doc, colorPath) => {
  const keys = colorPath.split('.');
  let color = theme.colors;
  keys.forEach(key => color = color[key]);
  doc.setFillColor(...color);
};

// Helper para calcular altura de fila (centralizado)
export const calcularAlturaFila = (doc, texto, ancho) => {
  const lineas = doc.splitTextToSize(texto, ancho);
  return lineas.length * theme.spacing.lineHeight;
};

// Helper para verificar si necesita nueva página
export const necesitaNuevaPagina = (doc, y, espacioNecesario) => {
  return y + espacioNecesario > doc.internal.pageSize.height - theme.dimensions.marginBottom;
};

// Helper para verificar espacio y agregar página si es necesario
export const verificarEspacio = (doc, y, espacioNecesario) => {
  if (necesitaNuevaPagina(doc, y, espacioNecesario)) {
    doc.addPage();
    return theme.padding.large;
  }
  return y;
};

// Función para limpiar nombre de mes
export const limpiarNombreMes = (mes) => {
  if (!mes) return '';
  return INDICADORES_DIARIO.reduce((nombre, indicador) => 
    nombre.replace(` - ${indicador}`, ''), mes
  );
};

// Función de formateo de moneda
const formateadorMoneda = new Intl.NumberFormat(CONFIG.locale, { 
  style: 'currency', 
  currency: CONFIG.currency 
});

export function moneda(x) { 
  if (typeof x !== 'number' || isNaN(x)) {
    Logger.warn('Valor inválido para moneda', { valor: x });
    return formateadorMoneda.format(0);
  }
  return formateadorMoneda.format(x); 
}

// Función para formatear fecha
export function formatearFecha(fecha) {
  if (!fecha) return '';
  try {
    return new Date(fecha).toLocaleDateString(CONFIG.locale);
  } catch (error) {
    Logger.warn('Error al formatear fecha', { fecha, error: error.message });
    return '';
  }
}

// Función para generar encabezado de tabla (reutilizable)
export function generarEncabezadoTabla(doc, y, columnas, bgColor) {
  setFillColor(doc, bgColor);
  doc.rect(theme.padding.base, y, theme.dimensions.tableWidth, theme.spacing.rowHeight, 'F');
  
  columnas.forEach(({ texto, x, opciones = {} }) => {
    doc.text(texto, x, y + 4.5, opciones);
  });
  
  return y + 9;
}

// Exportar theme con soporte para temas dinámicos
export { theme };
export default theme;
