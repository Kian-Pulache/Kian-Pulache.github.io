// RELAVES-MONITOR PRO - Datos simulados para demo
const APP_DATA = {
  currentUser: {
    id: 1,
    name: "Carlos Mendoza",
    role: "Supervisor de Turno",
    level: 2,
    avatar: "CM"
  },

  users: [
    { id: 1, name: "Juan García", role: "Operador de Turno", level: 1, avatar: "JG", status: "active" },
    { id: 2, name: "Carlos Mendoza", role: "Supervisor de Turno", level: 2, avatar: "CM", status: "active" },
    { id: 3, name: "Ana Torres", role: "Gerente de Operaciones", level: 3, avatar: "AT", status: "active" },
    { id: 4, name: "Dr. Luis Paredes", role: "Especialista Geotécnico", level: 4, avatar: "LP", status: "active" },
    { id: 5, name: "Ing. Rosa Vega", role: "Ejecutivo Responsable", level: 5, avatar: "RV", status: "active" },
  ],

  sensors: [
    { id: "P1", name: "Piezómetro P1 - Talud Norte", type: "piezometro", status: "GOOD", lastCalibrated: "2026-04-15", battery: 87 },
    { id: "P2", name: "Piezómetro P2 - Talud Sur", type: "piezometro", status: "GOOD", lastCalibrated: "2026-04-15", battery: 92 },
    { id: "P3", name: "Piezómetro P3 - Talud Este", type: "piezometro", status: "WARNING", lastCalibrated: "2026-03-10", battery: 34 },
    { id: "P4", name: "Piezómetro P4 - Talud Oeste", type: "piezometro", status: "GOOD", lastCalibrated: "2026-04-20", battery: 78 },
    { id: "P5", name: "Piezómetro P5 - Centro", type: "piezometro", status: "GOOD", lastCalibrated: "2026-04-20", battery: 95 },
    { id: "GPS1", name: "GPS RTK - Crestón", type: "gps", status: "GOOD", lastCalibrated: "2026-05-01", battery: 100 },
    { id: "FLOW1", name: "Medidor de Caudal - Descarga", type: "caudal", status: "GOOD", lastCalibrated: "2026-04-28", battery: 100 },
    { id: "DENS1", name: "Densímetro - Línea Principal", type: "densimetro", status: "GOOD", lastCalibrated: "2026-04-10", battery: 100 },
    { id: "MET1", name: "Estación Meteorológica", type: "meteo", status: "GOOD", lastCalibrated: "2026-05-05", battery: 100 },
  ],

  kpis: [
    {
      id: "K01", dimension: "Geotecnia", name: "Presión Intersticial P4",
      value: 112, unit: "kPa", threshold_yellow: 100, threshold_red: 120,
      status: "RED", trend: "up", trendValue: "+2.1 kPa/h",
      description: "Presión en piezómetro P4 Talud Este",
      lastUpdate: "2026-06-14 14:32:15",
      prediction7d: 138
    },
    {
      id: "K02", dimension: "Geotecnia", name: "Factor de Seguridad",
      value: 1.38, unit: "", threshold_yellow: 1.5, threshold_red: 1.3,
      status: "YELLOW", trend: "down", trendValue: "-0.02/h",
      description: "Factor de seguridad del talud crítico",
      lastUpdate: "2026-06-14 14:30:00",
      prediction7d: 1.24
    },
    {
      id: "K03", dimension: "Geometría", name: "Ángulo de Talud",
      value: 37.2, unit: "°", threshold_yellow: 38, threshold_red: 40,
      status: "GREEN", trend: "stable", trendValue: "0.0°/d",
      description: "Ángulo promedio de talud exterior",
      lastUpdate: "2026-06-14 12:00:00",
      prediction7d: 37.5
    },
    {
      id: "K04", dimension: "Geometría", name: "Elevación Promedio",
      value: 2454.3, unit: "m", threshold_yellow: 2460, threshold_red: 2465,
      status: "GREEN", trend: "up", trendValue: "+0.12 m/d",
      description: "Cota promedio de la superficie del depósito",
      lastUpdate: "2026-06-14 06:00:00",
      prediction7d: 2455.1
    },
    {
      id: "K05", dimension: "Calidad", name: "Densidad de Pulpa",
      value: 1.48, unit: "t/m³", threshold_yellow: 1.55, threshold_red: 1.6,
      status: "GREEN", trend: "stable", trendValue: "0.00 t/m³/h",
      description: "Densidad del relave en línea de descarga",
      lastUpdate: "2026-06-14 14:00:00",
      prediction7d: 1.49
    },
    {
      id: "K06", dimension: "Calidad", name: "Pasante Malla 200 (P200)",
      value: 26.8, unit: "%", threshold_yellow: 25, threshold_red: 28,
      status: "YELLOW", trend: "up", trendValue: "+0.3%/d",
      description: "Porcentaje de finos en granulometría",
      lastUpdate: "2026-06-14 08:00:00",
      prediction7d: 28.9
    },
    {
      id: "K07", dimension: "Operacional", name: "Caudal de Descarga",
      value: 143, unit: "m³/h", threshold_yellow: 130, threshold_red: 120,
      status: "GREEN", trend: "stable", trendValue: "+1 m³/h",
      description: "Tasa de descarga de relaves",
      lastUpdate: "2026-06-14 14:35:00",
      prediction7d: 144
    },
    {
      id: "K08", dimension: "Operacional", name: "Volumen Depositado",
      value: 1.32, unit: "Mm³", threshold_yellow: 1.8, threshold_red: 1.95,
      status: "GREEN", trend: "up", trendValue: "+0.003 Mm³/d",
      description: "Volumen total acumulado en depósito",
      lastUpdate: "2026-06-14 06:00:00",
      prediction7d: 1.34
    },
    {
      id: "K09", dimension: "Geotecnia", name: "Presión P1 - Norte",
      value: 78, unit: "kPa", threshold_yellow: 100, threshold_red: 120,
      status: "GREEN", trend: "stable", trendValue: "0.0 kPa/h",
      lastUpdate: "2026-06-14 14:32:00",
      prediction7d: 80
    },
    {
      id: "K10", dimension: "Hidrología", name: "Nivel Piscina",
      value: 0.82, unit: "m (borde libre)", threshold_yellow: 0.7, threshold_red: 0.5,
      status: "YELLOW", trend: "down", trendValue: "-0.02 m/d",
      description: "Borde libre de la piscina de decantación",
      lastUpdate: "2026-06-14 12:00:00",
      prediction7d: 0.68
    },
    {
      id: "K11", dimension: "Meteorológica", name: "Precipitación Acumulada 7d",
      value: 42, unit: "mm", threshold_yellow: 50, threshold_red: 80,
      status: "GREEN", trend: "up", trendValue: "+8 mm hoy",
      description: "Lluvia acumulada últimos 7 días",
      lastUpdate: "2026-06-14 14:00:00",
      prediction7d: 65
    },
    {
      id: "K12", dimension: "Operacional", name: "Disponibilidad Sistema",
      value: 97.2, unit: "%", threshold_yellow: 95, threshold_red: 90,
      status: "GREEN", trend: "stable", trendValue: "",
      description: "Uptime del sistema de monitoreo",
      lastUpdate: "2026-06-14 14:35:00",
      prediction7d: 97.0
    },
  ],

  alerts: [
    {
      id: "A001", kpi_id: "K01", detected_at: "2026-06-14 14:32:15",
      severity: "RED", status: "ACTIVE",
      title: "Presión Intersticial CRÍTICA - P4 Talud Este",
      description: "Presión alcanzó 112 kPa, superando umbral crítico de 100 kPa. Tendencia al alza (+2.1 kPa/h). Factor de Seguridad simultáneamente en 1.38 (< 1.5).",
      probable_cause: "Descarga concentrada en zona este (95% probabilidad)",
      recommended_actions: [
        "Monitorear presión cada 30 minutos",
        "Aumentar drenaje a 150 m³/h en sector este",
        "Escalar a Gerencia si presión > 120 kPa en 2h",
        "Verificar funcionamiento de bombas de drenaje"
      ],
      escalated_to: "Supervisor de Turno",
      escalation_level: 2,
      acknowledged_by: null,
      sensor: "P4"
    },
    {
      id: "A002", kpi_id: "K10", detected_at: "2026-06-14 12:15:00",
      severity: "YELLOW", status: "ACKNOWLEDGED",
      title: "Nivel de Piscina Reduciendo - Borde Libre Marginal",
      description: "Borde libre en 0.82 m (umbral warning: 0.7 m). Tendencia descendente -0.02 m/día. Sin lluvia prevista = riesgo bajo.",
      probable_cause: "Evaporación natural + tasa de descarga elevada",
      recommended_actions: [
        "Monitoreo diario de nivel",
        "Preparar reducción de descarga si borde libre < 0.75 m"
      ],
      escalated_to: "Operador de Turno",
      escalation_level: 1,
      acknowledged_by: "Juan García",
      acknowledged_at: "2026-06-14 12:30:00",
      sensor: "MET1"
    },
    {
      id: "A003", kpi_id: "K06", detected_at: "2026-06-14 08:00:00",
      severity: "YELLOW", status: "ACTIVE",
      title: "P200 Elevado - Granulometría Fuera de Rango",
      description: "Pasante Malla 200 en 26.8% (umbral: 25%). Predicción: alcanzará 28.9% en 7 días si tendencia continúa.",
      probable_cause: "Variación en mineral alimentado a planta (cambio de frente minero)",
      recommended_actions: [
        "Revisar configuración de clasificadores",
        "Coordinar con planta sobre mezcla de mineral",
        "Considerar MOC para ajuste operacional"
      ],
      escalated_to: "Supervisor de Turno",
      escalation_level: 2,
      acknowledged_by: null,
      sensor: "DENS1"
    },
    {
      id: "A004", kpi_id: "K03", detected_at: "2026-06-13 09:00:00",
      severity: "GREEN", status: "RESOLVED",
      title: "Batería baja en Sensor P3",
      description: "Batería de Piezómetro P3 en 34%. Reemplazada y sensor operativo.",
      probable_cause: "Vida útil de batería (12 meses)",
      recommended_actions: ["Reemplazar batería", "Actualizar cronograma de mantenimiento"],
      escalated_to: "Operador de Turno",
      escalation_level: 1,
      acknowledged_by: "Juan García",
      resolved_at: "2026-06-13 11:30:00",
      sensor: "P3"
    },
  ],

  mocs: [
    {
      id: "MOC-B-001", level: "B",
      title: "Aumento de Capacidad de Drenaje - Sector Este",
      description: "Instalación de bomba adicional de 80 m³/h en sector este del depósito para reducir presión intersticial en talud crítico P4.",
      status: "PENDING_APPROVAL",
      created_by: "Carlos Mendoza",
      created_at: "2026-06-14 15:00:00",
      origin_alert: "A001",
      estimated_cost: 35000,
      estimated_time: "5 días",
      approvals: [
        { role: "Especialista Geotécnico", name: "Dr. Luis Paredes", status: "APPROVED", date: "2026-06-14 16:30:00", comment: "Técnicamente válido. Presión debe bajar a < 85 kPa post-instalación." },
        { role: "Gerente de Operaciones", name: "Ana Torres", status: "PENDING", date: null, comment: null }
      ],
      risk_analysis: "Riesgo bajo. Acción correctiva estandarizada. Requiere corte de suministro eléctrico por 2h durante instalación.",
      impact: "Reducción esperada de presión: 112 → 80 kPa en 72h post-instalación."
    },
    {
      id: "MOC-A-003", level: "A",
      title: "Ajuste de Frecuencia de Muestreo - Densímetro",
      description: "Cambio de frecuencia de muestreo de densidad de 6h a 4h para mejor detección de variaciones de P200.",
      status: "APPROVED",
      created_by: "Juan García",
      created_at: "2026-06-12 10:00:00",
      origin_alert: "A003",
      estimated_cost: 0,
      estimated_time: "1 hora (configuración)",
      approvals: [
        { role: "Supervisor de Turno", name: "Carlos Mendoza", status: "APPROVED", date: "2026-06-12 11:00:00", comment: "Aprobado. Sin impacto en operación." }
      ],
      risk_analysis: "Sin riesgo. Cambio de parámetro de configuración.",
      impact: "Mejor granularidad de datos de calidad."
    },
    {
      id: "MOC-C-002", level: "C",
      title: "Instalación de Distribuidor Rotativo - Fase 2",
      description: "Instalación de distribuidor rotativo para homogeneizar descarga de relaves y reducir concentración en talud este.",
      status: "CLOSED",
      created_by: "Ana Torres",
      created_at: "2026-05-15 09:00:00",
      origin_alert: null,
      estimated_cost: 50000,
      actual_cost: 48500,
      estimated_time: "2 semanas",
      approvals: [
        { role: "Especialista Geotécnico", name: "Dr. Luis Paredes", status: "APPROVED", date: "2026-05-16 10:00:00", comment: "Necesario para reducir concentración de finos." },
        { role: "Gerente de Operaciones", name: "Ana Torres", status: "APPROVED", date: "2026-05-17 14:00:00", comment: "" },
        { role: "Ejecutivo Responsable", name: "Ing. Rosa Vega", status: "APPROVED", date: "2026-05-19 09:00:00", comment: "Autorizado." }
      ],
      risk_analysis: "Parada de planta por 8h durante instalación. Riesgo medio, mitigado con protocolo LOTO.",
      impact: "Reducción de ángulo talud de 39° a 37°. Factor de seguridad mejoró de 1.4 a 1.6.",
      effectiveness: "EFICAZ",
      closed_at: "2026-06-10 00:00:00"
    }
  ],

  actions: [
    {
      id: "AC001", alert_id: "A001",
      title: "Aumentar drenaje a 150 m³/h - Sector Este",
      description: "Incrementar caudal de bombas B3 y B4 del sector este de 120 a 150 m³/h",
      status: "IN_PROGRESS",
      assigned_to: "Juan García",
      deadline: "2026-06-14 18:00:00",
      created_at: "2026-06-14 14:45:00",
      priority: "HIGH"
    },
    {
      id: "AC002", alert_id: "A001",
      title: "Monitoreo de presión cada 30 minutos",
      description: "Registro manual de lectura P4 cada 30 minutos y reporte a supervisor",
      status: "IN_PROGRESS",
      assigned_to: "Juan García",
      deadline: "2026-06-14 22:00:00",
      created_at: "2026-06-14 14:46:00",
      priority: "HIGH"
    },
    {
      id: "AC003", alert_id: "A003",
      title: "Revisión de clasificadores - Planta",
      description: "Inspección y ajuste de hidrociclones para reducir pasante malla 200",
      status: "PENDING",
      assigned_to: "Carlos Mendoza",
      deadline: "2026-06-15 08:00:00",
      created_at: "2026-06-14 09:00:00",
      priority: "MEDIUM"
    },
    {
      id: "AC004", alert_id: "A004",
      title: "Reemplazo de batería P3",
      description: "Reemplazo de batería de piezómetro P3 y verificación de calibración",
      status: "COMPLETED",
      assigned_to: "Juan García",
      completed_at: "2026-06-13 11:30:00",
      created_at: "2026-06-13 09:30:00",
      priority: "LOW",
      effectiveness: "EFICAZ"
    }
  ],

  // Time series para gráficos (últimas 24h, cada 2h)
  timeSeries: {
    labels: ["02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "Ahora"],
    presionP4: [68, 72, 78, 85, 91, 98, 105, 112],
    factorSeguridad: [1.72, 1.70, 1.65, 1.60, 1.55, 1.48, 1.42, 1.38],
    caudal: [142, 141, 143, 145, 144, 142, 140, 143],
    nivelPiscina: [0.92, 0.91, 0.90, 0.89, 0.87, 0.85, 0.83, 0.82],
    presionP1: [76, 76, 77, 77, 78, 78, 78, 78],
    precipitacion: [0, 0, 2, 5, 8, 12, 8, 7],
  },

  compliance: {
    gistm: 76,
    mmg: 76,
    totalRequirements: 13,
    met: 10,
    items: [
      { id: 1, name: "Programa de monitoreo geotécnico", status: "MET" },
      { id: 2, name: "Revisiones periódicas de estabilidad", status: "MET" },
      { id: 3, name: "Plan de gestión de agua", status: "MET" },
      { id: 4, name: "Clasificación de consecuencias", status: "MET" },
      { id: 5, name: "Factor de seguridad mínimo (1.5)", status: "PARTIAL" },
      { id: 6, name: "Audit log completo", status: "MET" },
      { id: 7, name: "Plan de respuesta a emergencias", status: "MET" },
      { id: 8, name: "Roles y responsabilidades definidos", status: "MET" },
      { id: 9, name: "Reporte anual independiente", status: "NOT_MET" },
      { id: 10, name: "Revisión de diseño", status: "MET" },
      { id: 11, name: "Plan de cierre documentado", status: "PARTIAL" },
      { id: 12, name: "Gestión de cambios (MOC)", status: "MET" },
      { id: 13, name: "Capacitación del personal", status: "NOT_MET" },
    ]
  },

  auditLog: [
    { id: 1, user: "Sistema", action: "ALERTA CREADA", resource: "Alerta A001", timestamp: "2026-06-14 14:32:15", ip: "10.0.0.1" },
    { id: 2, user: "Carlos Mendoza", action: "ALERTA ESCALADA", resource: "Alerta A001 → Gerencia", timestamp: "2026-06-14 14:45:00", ip: "10.0.0.25" },
    { id: 3, user: "Juan García", action: "ACCIÓN INICIADA", resource: "AC001 - Aumento drenaje", timestamp: "2026-06-14 14:50:00", ip: "10.0.0.12" },
    { id: 4, user: "Carlos Mendoza", action: "MOC CREADO", resource: "MOC-B-001", timestamp: "2026-06-14 15:00:00", ip: "10.0.0.25" },
    { id: 5, user: "Dr. Luis Paredes", action: "MOC APROBADO", resource: "MOC-B-001 (Nivel 1)", timestamp: "2026-06-14 16:30:00", ip: "10.0.0.30" },
    { id: 6, user: "Juan García", action: "OBSERVACIÓN MANUAL", resource: "Lectura P4: 112 kPa", timestamp: "2026-06-14 15:00:00", ip: "10.0.0.12" },
    { id: 7, user: "Juan García", action: "ALERTA ACEPTADA", resource: "Alerta A002", timestamp: "2026-06-14 12:30:00", ip: "10.0.0.12" },
    { id: 8, user: "Sistema", action: "ALERTA CREADA", resource: "Alerta A003", timestamp: "2026-06-14 08:00:00", ip: "10.0.0.1" },
  ]
};

// Estado de la aplicación
let appState = {
  currentView: 'dashboard',
  currentRole: 2, // Supervisor por defecto
  alerts: [...APP_DATA.alerts],
  mocs: [...APP_DATA.mocs],
  actions: [...APP_DATA.actions],
  auditLog: [...APP_DATA.auditLog],
  sidebarOpen: false,
  selectedAlert: null,
  selectedMoc: null,
  simulationRunning: true,
  time: new Date('2026-06-14T14:35:00'),
};

// Simulación de tiempo real
let simulationInterval;
function startSimulation() {
  simulationInterval = setInterval(() => {
    // Incrementar presión P4 ligeramente
    const kpi = APP_DATA.kpis.find(k => k.id === 'K01');
    if (kpi.value < 125 && Math.random() > 0.5) {
      kpi.value = parseFloat((kpi.value + (Math.random() * 0.4 - 0.1)).toFixed(1));
      kpi.lastUpdate = new Date().toISOString().slice(0,19).replace('T',' ');
      if (kpi.value >= 120) kpi.status = 'RED';
    }
    // Actualizar Factor de Seguridad inversamente
    const kpiFS = APP_DATA.kpis.find(k => k.id === 'K02');
    kpiFS.value = parseFloat((1.72 - (kpi.value - 68) * 0.0105).toFixed(2));
    if (kpiFS.value < 1.3) kpiFS.status = 'RED';
    else if (kpiFS.value < 1.5) kpiFS.status = 'YELLOW';
    else kpiFS.status = 'GREEN';

    appState.time = new Date(appState.time.getTime() + 60000);
    if (typeof updateDashboard === 'function') updateDashboard();
  }, 5000);
}
