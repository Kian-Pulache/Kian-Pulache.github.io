// ─── MÓDULO: DATOS DE SENSORES + NOTIFICACIONES EMAIL ────────────────────────
// Este módulo permite editar los valores raw de sensores y envía emails automáticos
// via EmailJS cuando un valor supera los umbrales definidos (simulando lo que haría
// el backend en un sistema real con datos de sensores IoT).

// ─── ESTADO EMAIL ────────────────────────────────────────────
let emailState = {
  configured: false,  // true cuando el usuario carga sus credenciales EmailJS
  serviceId: EMAIL_CONFIG.serviceId,
  templateId: EMAIL_CONFIG.templateId,
  publicKey: EMAIL_CONFIG.publicKey,
  emailLog: [],       // historial de emails enviados en esta sesión
  testMode: true,     // si true, simula el envío (útil antes de configurar EmailJS)
};

// Inicializar EmailJS si hay credenciales
function initEmailJS() {
  try {
    if (emailState.publicKey && emailState.publicKey !== 'TU_PUBLIC_KEY_AQUI') {
      emailjs.init({ publicKey: emailState.publicKey });
      emailState.configured = true;
    }
  } catch(e) {
    console.warn('EmailJS no inicializado:', e.message);
  }
}

// ─── ENVÍO DE EMAIL DE ALERTA ─────────────────────────────────
async function sendAlertEmail(reading, newValue, oldValue, severity) {
  const timestamp = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
  const severityLabels = { RED: '🔴 CRÍTICO', YELLOW: '⚠️ ADVERTENCIA' };
  const severityLabel = severityLabels[severity] || severity;

  const emailData = {
    to_email: EMAIL_CONFIG.recipients.primary,
    cc_email:  EMAIL_CONFIG.recipients.cc,
    severity_label: severityLabel,
    alert_title: `${severityLabel} — ${reading.kpi_name}`,
    sensor_id: reading.sensor_id,
    sensor_name: reading.sensor_name,
    kpi_name: reading.kpi_name,
    current_value: `${newValue} ${reading.unit}`,
    previous_value: `${oldValue} ${reading.unit}`,
    threshold_warning: `${reading.threshold_yellow} ${reading.unit}`,
    threshold_critical: `${reading.threshold_red} ${reading.unit}`,
    timestamp: timestamp,
    protocol: reading.protocol,
    signal_quality: `${reading.signal_quality}%`,
    user_name: document.getElementById('user-name')?.textContent || 'Sistema',
    user_role: document.getElementById('user-role')?.textContent || 'Automático',
    recommended_action: getRecommendedAction(reading, severity),
    system_url: window.location.href,
    mine_name: 'Depósito Relaves Unidad Demo',
  };

  // Log del intento
  const logEntry = {
    id: Date.now(),
    timestamp,
    subject: `[RELAVES-MONITOR] ${severityLabel}: ${reading.kpi_name} = ${newValue} ${reading.unit}`,
    to: EMAIL_CONFIG.recipients.primary,
    cc: EMAIL_CONFIG.recipients.cc,
    severity,
    status: 'pending',
    data: emailData,
  };
  emailState.emailLog.unshift(logEntry);
  refreshEmailLog();

  if (emailState.testMode || !emailState.configured) {
    // MODO SIMULACIÓN: muestra lo que se enviaría
    await simulateEmailSend(logEntry, emailData);
  } else {
    // MODO REAL: envío via EmailJS
    try {
      await emailjs.send(
        emailState.serviceId,
        emailState.templateId,
        {
          to_email: emailData.to_email,
          subject: logEntry.subject,
          message: buildEmailBody(emailData),
          ...emailData,
        }
      );
      logEntry.status = 'sent';
      showToast('success', '📧 Email enviado', `Alerta enviada a ${EMAIL_CONFIG.recipients.primary}`);
    } catch(err) {
      logEntry.status = 'error';
      logEntry.error = err.text || err.message;
      showToast('error', 'Error al enviar email', err.text || 'Verifica las credenciales de EmailJS');
    }
    refreshEmailLog();
  }
}

function buildEmailBody(d) {
  return `SISTEMA DE MONITOREO DE RELAVES - ALERTA AUTOMÁTICA
=======================================================

NIVEL DE SEVERIDAD: ${d.severity_label}
DEPÓSITO: ${d.mine_name}
FECHA Y HORA: ${d.timestamp}

SENSOR AFECTADO
---------------
ID Sensor:     ${d.sensor_id}
Nombre:        ${d.sensor_name}
Protocolo:     ${d.protocol}
Calidad señal: ${d.signal_quality}

LECTURA DETECTADA
-----------------
KPI:           ${d.kpi_name}
Valor actual:  ${d.current_value}  ← FUERA DE RANGO
Valor previo:  ${d.previous_value}
Umbral aviso:  ${d.threshold_warning}
Umbral crítico:${d.threshold_critical}

ACCIÓN RECOMENDADA
------------------
${d.recommended_action}

REGISTRADO POR
--------------
Usuario: ${d.user_name} (${d.user_role})

Acceder al sistema: ${d.system_url}

--
Sistema RELAVES-MONITOR PRO | Notificación automática
Este email fue generado automáticamente al detectar una anomalía en los sensores.`;
}

function getRecommendedAction(reading, severity) {
  const actions = {
    'SR002': {
      RED: 'URGENTE: Monitorear presión cada 15 min. Activar bomba de drenaje sector Este. Escalar a Gerencia si no baja en 2h.',
      YELLOW: 'Aumentar frecuencia de monitoreo. Revisar estado de bombas de drenaje. Preparar MOC si tendencia continúa.',
    },
    'SR001': { RED: 'Verificar integridad de talud Norte. Revisar sistema de drenaje.', YELLOW: 'Monitorear tendencia.' },
    'SR009': { RED: 'CRÍTICO: Borde libre insuficiente. Reducir tasa de descarga inmediatamente.', YELLOW: 'Reducir descarga y monitorear nivel diariamente.' },
    'SR008': { RED: 'Activar protocolo de lluvia intensa. Verificar capacidad de drenaje.', YELLOW: 'Revisar pronóstico meteorológico y preparar contingencia.' },
  };
  const specific = actions[reading.id];
  if (specific && specific[severity]) return specific[severity];
  if (severity === 'RED') return `Valor ${reading.value} ${reading.unit} supera umbral crítico (${reading.threshold_red} ${reading.unit}). Requiere acción inmediata y escalación a Gerencia.`;
  return `Valor ${reading.value} ${reading.unit} supera umbral de advertencia (${reading.threshold_yellow} ${reading.unit}). Monitorear y evaluar acción correctiva.`;
}

async function simulateEmailSend(logEntry, data) {
  // Simula latencia de red
  await new Promise(r => setTimeout(r, 1200));
  logEntry.status = 'sent';
  logEntry.simulated = true;
  refreshEmailLog();
  showToast('success', '📧 Email simulado ✓', `Para activar envío real, configura EmailJS (ver panel de configuración)`);
  // Mostrar preview del email
  setTimeout(() => showEmailPreview(data, logEntry.subject), 400);
}

function showEmailPreview(data, subject) {
  const body = `
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:14px">
      <div style="font-size:11px;color:var(--text3);margin-bottom:4px">PARA</div>
      <div style="font-size:13px;color:var(--blue)">${data.to_email}</div>
      <div style="font-size:11px;color:var(--text3);margin-top:8px;margin-bottom:4px">CON COPIA (CC)</div>
      <div style="font-size:13px;color:var(--blue)">${data.cc_email}</div>
      <div style="font-size:11px;color:var(--text3);margin-top:8px;margin-bottom:4px">ASUNTO</div>
      <div style="font-size:12px;font-weight:600;color:var(--text)">${subject}</div>
    </div>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:var(--mono);font-size:11px;color:var(--text2);line-height:1.8;white-space:pre-wrap;max-height:340px;overflow-y:auto">${buildEmailBody(data)}</div>
    <div style="margin-top:12px;padding:10px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:6px;font-size:11px;color:var(--yellow)">
      ⚠ Este es el contenido exacto que se enviaría. Para envío real, configura EmailJS en el panel de arriba.
    </div>
  `;
  openModal('📧 Preview — Email de Alerta', body,
    `<button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
     <button class="btn btn-primary" onclick="closeModal();showView('sensordata')">Ir a Configuración</button>`
  );
}

function refreshEmailLog() {
  const el = document.getElementById('email-log-container');
  if (!el) return;
  if (emailState.emailLog.length === 0) {
    el.innerHTML = '<div style="color:var(--text3);font-size:12px;padding:8px 0">Sin emails enviados en esta sesión.</div>';
    return;
  }
  el.innerHTML = emailState.emailLog.map(e => `
    <div class="email-log-item ${e.status}">
      <div style="font-size:16px">${e.status==='sent'?'✉️':e.status==='error'?'❌':'⏳'}</div>
      <div class="email-log-body">
        <div class="email-log-subject">${e.subject}</div>
        <div class="email-log-to">→ ${e.to} | CC: ${e.cc}${e.simulated?' | <span style="color:var(--yellow)">SIMULADO</span>':''}</div>
        ${e.error ? `<div style="color:var(--red);font-size:10px;margin-top:2px">Error: ${e.error}</div>` : ''}
      </div>
      <div class="email-log-meta">${e.timestamp.split(',')[1]?.trim() || e.timestamp}</div>
    </div>
  `).join('');
}

// ─── DETECCIÓN DE ANOMALÍAS ───────────────────────────────────
function evaluateReading(reading, newVal) {
  const prev = reading.value;
  let severity = null;

  // Para KPIs donde MAYOR valor = peligro (presión, ángulo, elevación, finos, lluvia)
  const higherIsBad = ['SR001','SR002','SR003','SR004','SR005','SR008','SR010'];
  // Para KPIs donde MENOR valor = peligro (factor seguridad, borde libre, caudal)
  const lowerIsBad  = ['SR006','SR009'];

  if (higherIsBad.includes(reading.id)) {
    if (newVal >= reading.threshold_red) severity = 'RED';
    else if (newVal >= reading.threshold_yellow) severity = 'YELLOW';
  } else if (lowerIsBad.includes(reading.id)) {
    if (newVal <= reading.threshold_red) severity = 'RED';
    else if (newVal <= reading.threshold_yellow) severity = 'YELLOW';
  } else {
    // Default: mayor = peor
    if (newVal >= reading.threshold_red) severity = 'RED';
    else if (newVal >= reading.threshold_yellow) severity = 'YELLOW';
  }

  return severity;
}

// ─── VISTA PRINCIPAL: DATOS DE SENSORES ──────────────────────
function renderSensorData() {
  const emailSetup = emailState.configured;
  const html = `
  <!-- PANEL CONFIGURACIÓN EMAIL -->
  <div class="email-panel" style="border-color:${emailSetup?'rgba(34,197,94,.3)':'rgba(245,158,11,.3)'}">
    <div class="email-panel-header">
      <span style="font-size:20px">📧</span>
      <div class="email-panel-title">Configuración de Notificaciones por Email</div>
      <div class="email-status ${emailSetup?'configured':'pending'}">
        ${emailSetup?'✓ CONFIGURADO':'⚠ MODO SIMULACIÓN'}
      </div>
    </div>

    <div style="font-size:12px;color:var(--text3);margin-bottom:14px;line-height:1.6">
      Las alertas se envían automáticamente al detectar valores fuera de umbral. Usando
      <a href="https://www.emailjs.com" target="_blank" style="color:var(--blue)">EmailJS</a>
      (gratuito, sin backend, funciona desde GitHub Pages).
      ${!emailSetup ? '<br><strong style="color:var(--yellow)">Modo simulación activo</strong> — se previsualiza el email pero no se envía hasta configurar credenciales.' : ''}
    </div>

    <div class="config-grid" style="margin-bottom:14px">
      <div class="config-field">
        <label>Destinatario Principal (TO)</label>
        <input type="email" id="cfg-to" value="${EMAIL_CONFIG.recipients.primary}" class="locked" readonly>
      </div>
      <div class="config-field">
        <label>Con Copia (CC)</label>
        <input type="email" id="cfg-cc" value="${EMAIL_CONFIG.recipients.cc}" class="locked" readonly>
      </div>
      <div class="config-field">
        <label>EmailJS — Service ID
          <a href="https://dashboard.emailjs.com" target="_blank" style="color:var(--blue);font-size:9px;margin-left:4px">¿Cómo obtenerlo? →</a>
        </label>
        <input type="text" id="cfg-service" placeholder="service_xxxxxxx" value="${emailState.serviceId !== 'service_relaves' ? emailState.serviceId : ''}">
      </div>
      <div class="config-field">
        <label>EmailJS — Template ID</label>
        <input type="text" id="cfg-template" placeholder="template_xxxxxxx" value="${emailState.templateId !== 'template_alerta' ? emailState.templateId : ''}">
      </div>
      <div class="config-field" style="grid-column:1/-1">
        <label>EmailJS — Public Key</label>
        <input type="text" id="cfg-pubkey" placeholder="Pega aquí tu Public Key de EmailJS" value="${emailState.publicKey !== 'TU_PUBLIC_KEY_AQUI' ? emailState.publicKey : ''}">
      </div>
    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <button class="btn btn-primary btn-sm" onclick="saveEmailConfig()">💾 Guardar y Activar</button>
      <button class="btn btn-ghost btn-sm" onclick="testEmailSend()">🧪 Enviar Email de Prueba</button>
      <div id="email-setup-guide" style="font-size:11px;color:var(--text3);margin-left:auto">
        Guía rápida:
        <a href="https://www.emailjs.com/docs/tutorial/overview/" target="_blank" style="color:var(--blue)">Crear cuenta EmailJS →</a>
      </div>
    </div>
  </div>

  <!-- TABLA DE LECTURAS DE SENSORES -->
  <div class="section">
    <div class="section-header">
      <div class="section-title">📊 Base de Datos — Lecturas de Sensores en Tiempo Real</div>
      <div class="section-actions">
        <button class="btn btn-ghost btn-sm" onclick="resetSensorValues()">↺ Restaurar valores</button>
        <button class="btn btn-ghost btn-sm" onclick="showHowItWorks()">❓ Cómo funciona</button>
      </div>
    </div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:14px;padding:10px 14px;background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.15);border-radius:6px;line-height:1.7">
      <strong style="color:var(--blue)">🎮 Demo interactiva:</strong>
      Edita cualquier valor en la columna <strong style="color:var(--text)">Valor Actual</strong> y presiona
      <strong style="color:var(--text)">Aplicar</strong>. El sistema evaluará si supera los umbrales y,
      de ser así, <strong style="color:var(--text)">actualizará los KPIs, creará una alerta y enviará el email automáticamente</strong>.
      <br>Prueba con <strong style="color:var(--yellow)">P4 → valor 125</strong> para activar alerta CRÍTICA.
    </div>

    <div style="overflow-x:auto;border-radius:var(--radius-lg);border:1px solid var(--border)">
      <table class="editable-table" id="sensor-readings-table">
        <thead>
          <tr>
            <th>Sensor</th>
            <th>KPI Asociado</th>
            <th>Protocolo</th>
            <th>Valor Actual</th>
            <th>Umbral ⚠</th>
            <th>Umbral 🔴</th>
            <th>Estado</th>
            <th>Última Lectura</th>
            <th>Calidad</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody id="sensor-readings-body">
        </tbody>
      </table>
    </div>
  </div>

  <!-- LOG DE EMAILS -->
  <div class="section">
    <div class="section-header">
      <div class="section-title">📨 Historial de Notificaciones — Sesión Actual</div>
      <div class="section-actions">
        <button class="btn btn-ghost btn-sm" onclick="emailState.emailLog=[];refreshEmailLog()">Limpiar</button>
      </div>
    </div>
    <div id="email-log-container">
      <div style="color:var(--text3);font-size:12px;padding:8px 0">Sin emails enviados en esta sesión. Edita un valor para activar una alerta.</div>
    </div>
  </div>
  `;

  document.getElementById('sensordata-content').innerHTML = html;
  renderSensorTable();
  refreshEmailLog();
}

function renderSensorTable() {
  const tbody = document.getElementById('sensor-readings-body');
  if (!tbody) return;

  tbody.innerHTML = SENSOR_READINGS.map(r => {
    const sv = evaluateReading(r, r.value);
    const rowClass = sv === 'RED' ? 'row-critical' : sv === 'YELLOW' ? 'row-warning' : '';
    const statusHtml = sv === 'RED' ?
      `<span class="tag tag-red">🔴 CRÍTICO</span>` :
      sv === 'YELLOW' ?
      `<span class="tag tag-yellow">⚠ ALERTA</span>` :
      `<span class="tag tag-green">✓ NORMAL</span>`;

    return `<tr id="row-${r.id}" class="${rowClass}">
      <td>
        <div style="font-weight:600;color:var(--text);font-size:12px">${r.sensor_id}</div>
        <div style="font-size:10px;color:var(--text3)">${r.sensor_name.split(' - ')[1] || r.sensor_name}</div>
      </td>
      <td style="font-size:11px">${r.kpi_name}</td>
      <td style="font-size:10px;color:var(--text3)">${r.protocol}</td>
      <td>
        <input
          type="number"
          class="value-input ${sv === 'RED' ? 'crit' : sv === 'YELLOW' ? 'warn' : ''}"
          id="input-${r.id}"
          value="${r.value}"
          step="${r.unit === 't/m³' || r.unit === 'm' ? '0.01' : r.unit === '°' ? '0.1' : '1'}"
          onchange="previewValueChange('${r.id}', this.value)"
          onkeypress="if(event.key==='Enter')applyReading('${r.id}')"
        >
        <span style="font-size:10px;color:var(--text3);margin-left:4px">${r.unit}</span>
      </td>
      <td style="font-family:var(--mono);color:var(--yellow);font-size:12px">${r.threshold_yellow} ${r.unit}</td>
      <td style="font-family:var(--mono);color:var(--red);font-size:12px">${r.threshold_red} ${r.unit}</td>
      <td id="status-${r.id}">${statusHtml}</td>
      <td style="font-family:var(--mono);font-size:10px;color:var(--text3)">${r.timestamp.split(' ')[1]}</td>
      <td>
        <div style="display:flex;align-items:center;gap:5px">
          <div style="width:40px;height:4px;background:var(--bg3);border-radius:2px;overflow:hidden">
            <div style="height:100%;background:${r.signal_quality>70?'var(--green)':r.signal_quality>40?'var(--yellow)':'var(--red)'};width:${r.signal_quality}%"></div>
          </div>
          <span style="font-size:10px;color:var(--text3)">${r.signal_quality}%</span>
        </div>
      </td>
      <td>
        <button class="apply-btn" id="btn-${r.id}" onclick="applyReading('${r.id}')">
          Aplicar ↵
        </button>
      </td>
    </tr>`;
  }).join('');
}

function previewValueChange(id, newVal) {
  const reading = SENSOR_READINGS.find(r => r.id === id);
  if (!reading) return;
  const val = parseFloat(newVal);
  const severity = evaluateReading(reading, val);
  const input = document.getElementById(`input-${id}`);
  if (input) {
    input.className = `value-input ${severity==='RED'?'crit':severity==='YELLOW'?'warn':''}`;
  }
}

async function applyReading(id) {
  const reading = SENSOR_READINGS.find(r => r.id === id);
  if (!reading) return;

  const inputEl = document.getElementById(`input-${id}`);
  const btnEl = document.getElementById(`btn-${id}`);
  const newVal = parseFloat(inputEl?.value);

  if (isNaN(newVal)) { showToast('error', 'Valor inválido', 'Ingresa un número válido'); return; }

  const oldVal = reading.value;
  const severity = evaluateReading(reading, newVal);
  const prevSeverity = evaluateReading(reading, oldVal);

  // Actualizar el reading
  reading.value = newVal;
  reading.timestamp = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' }).replace(',','');

  // Sincronizar con KPI correspondiente
  const kpi = APP_DATA.kpis.find(k => k.id === reading.kpi_id);
  if (kpi) {
    const prevKpiStatus = kpi.status;
    kpi.value = newVal;
    kpi.lastUpdate = reading.timestamp;
    if (severity === 'RED') kpi.status = 'RED';
    else if (severity === 'YELLOW') kpi.status = 'YELLOW';
    else kpi.status = 'GREEN';

    // Si es P4, actualizar Factor de Seguridad inversamente
    if (reading.sensor_id === 'P4') {
      const kpiFS = APP_DATA.kpis.find(k => k.id === 'K02');
      if (kpiFS) {
        kpiFS.value = parseFloat((1.72 - (newVal - 68) * 0.0105).toFixed(2));
        if (kpiFS.value < 1.3) kpiFS.status = 'RED';
        else if (kpiFS.value < 1.5) kpiFS.status = 'YELLOW';
        else kpiFS.status = 'GREEN';
      }
    }
  }

  // Flash visual en la fila
  const row = document.getElementById(`row-${id}`);
  if (row && severity === 'RED') {
    row.className = 'row-critical row-flash';
    setTimeout(() => row.className = 'row-critical', 1500);
  } else if (row) {
    row.className = severity === 'YELLOW' ? 'row-warning' : '';
  }

  // Actualizar status cell
  const statusEl = document.getElementById(`status-${id}`);
  if (statusEl) {
    statusEl.innerHTML = severity === 'RED' ?
      `<span class="tag tag-red">🔴 CRÍTICO</span>` :
      severity === 'YELLOW' ?
      `<span class="tag tag-yellow">⚠ ALERTA</span>` :
      `<span class="tag tag-green">✓ NORMAL</span>`;
  }

  // Feedback botón
  if (btnEl) {
    btnEl.textContent = '✓ Aplicado';
    btnEl.className = 'apply-btn sent';
    setTimeout(() => { btnEl.textContent = 'Aplicar ↵'; btnEl.className = 'apply-btn'; }, 2500);
  }

  // Registrar en audit log
  addAuditEntry('LECTURA MANUAL APLICADA', `Sensor ${reading.sensor_id}: ${oldVal} → ${newVal} ${reading.unit}`);
  updateTopbar();

  // ¿Hay anomalía? → crear alerta + enviar email
  if (severity && severity !== 'GREEN') {
    const wasAlreadyAlerting = prevSeverity === severity;
    if (!wasAlreadyAlerting) {
      // Crear nueva alerta en el sistema
      createAlertFromReading(reading, newVal, severity);
      // Enviar email
      showToast(severity==='RED'?'error':'info',
        severity==='RED'?'🔴 ANOMALÍA CRÍTICA DETECTADA':'⚠ Advertencia detectada',
        `${reading.kpi_name}: ${newVal} ${reading.unit} — Enviando notificación...`
      );
      await sendAlertEmail(reading, newVal, oldVal, severity);
    } else {
      showToast('info', 'Valor actualizado', `${reading.kpi_name}: ${oldVal} → ${newVal} ${reading.unit} (alerta ya activa)`);
    }
  } else {
    showToast('success', 'Valor normal', `${reading.kpi_name}: ${newVal} ${reading.unit} dentro de rangos`);
    // Si había alerta activa para este sensor, resolverla
    resolveAlertForSensor(reading.sensor_id);
  }
}

function createAlertFromReading(reading, value, severity) {
  const newAlertId = 'A' + String(Date.now()).slice(-3);
  const severityLabels = { RED: 'CRÍTICA', YELLOW: 'ADVERTENCIA' };
  const causes = {
    P4: 'Descarga concentrada en zona + posible bloqueo de drenaje (ML, 91% prob.)',
    P1: 'Saturación de talud Norte por eventos de lluvia recientes',
    P2: 'Variación de presión hidrostática - sector Sur',
    P5: 'Presión por confinamiento lateral - zona central',
    MET1: 'Evento meteorológico acumulado registrado por estación automática',
    FLOW1: 'Variación de tasa de alimentación de planta o falla en bomba',
    DENS1: 'Cambio de frente minero o variación en proceso de molienda',
    GPS1: 'Deposición activa acelera alza de cota promedio',
  };

  const newAlert = {
    id: newAlertId,
    kpi_id: reading.kpi_id,
    detected_at: new Date().toLocaleString('es-PE', {timeZone:'America/Lima'}).replace(',',''),
    severity,
    status: 'ACTIVE',
    title: `${severityLabels[severity]}: ${reading.kpi_name} = ${value} ${reading.unit}`,
    description: `Sensor ${reading.sensor_id} reportó ${value} ${reading.unit}. Supera umbral ${severity==='RED'?'crítico':'de advertencia'} (${severity==='RED'?reading.threshold_red:reading.threshold_yellow} ${reading.unit}). Dato ingresado manualmente para demostración del sistema.`,
    probable_cause: causes[reading.sensor_id] || 'Análisis ML en proceso...',
    recommended_actions: [
      `Verificar lectura del sensor ${reading.sensor_id} en campo`,
      severity === 'RED' ? 'Activar protocolo de respuesta inmediata' : 'Incrementar frecuencia de monitoreo',
      'Revisar historial de las últimas 24 horas',
      'Coordinar con supervisión de turno',
    ],
    escalated_to: severity === 'RED' ? 'Gerente de Operaciones' : 'Supervisor de Turno',
    escalation_level: severity === 'RED' ? 3 : 2,
    acknowledged_by: null,
    sensor: reading.sensor_id,
    auto_generated: true,
  };

  appState.alerts.unshift(newAlert);
  document.getElementById('badge-alerts').textContent = activeAlerts().length;
  addAuditEntry('ALERTA AUTO-GENERADA', `${newAlertId}: ${reading.kpi_name} = ${value} ${reading.unit} [${severity}]`);
}

function resolveAlertForSensor(sensorId) {
  const alert = appState.alerts.find(a => a.sensor === sensorId && a.status === 'ACTIVE' && a.auto_generated);
  if (alert) {
    alert.status = 'RESOLVED';
    alert.resolved_at = new Date().toLocaleString('es-PE', {timeZone:'America/Lima'}).replace(',','');
    document.getElementById('badge-alerts').textContent = activeAlerts().length;
    showToast('success', 'Alerta resuelta automáticamente', `${alert.title} — valor volvió a rango normal`);
  }
}

// ─── GUARDAR CONFIGURACIÓN EMAILJS ──────────────────────────
function saveEmailConfig() {
  const sid = document.getElementById('cfg-service')?.value?.trim();
  const tid = document.getElementById('cfg-template')?.value?.trim();
  const pk  = document.getElementById('cfg-pubkey')?.value?.trim();

  if (!sid || !tid || !pk) {
    showToast('error', 'Faltan credenciales', 'Completa Service ID, Template ID y Public Key');
    return;
  }

  emailState.serviceId  = sid;
  emailState.templateId = tid;
  emailState.publicKey  = pk;
  emailState.testMode   = false;

  try {
    emailjs.init({ publicKey: pk });
    emailState.configured = true;
    showToast('success', '✓ EmailJS configurado', 'Las alertas se enviarán por email en tiempo real');
    renderSensorData(); // Re-render para mostrar estado CONFIGURADO
  } catch(e) {
    showToast('error', 'Error al inicializar EmailJS', e.message);
  }
}

// ─── EMAIL DE PRUEBA ─────────────────────────────────────────
async function testEmailSend() {
  const fakereading = {
    id: 'TEST', sensor_id: 'P4', sensor_name: 'Piezómetro P4 - Talud Este [PRUEBA]',
    kpi_id: 'K01', kpi_name: 'Presión Intersticial P4',
    value: 121, unit: 'kPa', threshold_yellow: 100, threshold_red: 120,
    protocol: 'LoRa 915MHz', signal_quality: 98,
  };
  showToast('info', '🧪 Enviando email de prueba...', 'Verifica bandeja de entrada');
  await sendAlertEmail(fakereading, 121, 112, 'RED');
}

// ─── RESTAURAR VALORES DEMO ──────────────────────────────────
function resetSensorValues() {
  const defaults = { SR001:78, SR002:112, SR003:65, SR004:58, SR005:2454.3, SR006:143, SR007:1.48, SR008:42, SR009:0.82, SR010:83 };
  SENSOR_READINGS.forEach(r => {
    if (defaults[r.id] !== undefined) {
      r.value = defaults[r.id];
      const input = document.getElementById(`input-${r.id}`);
      if (input) input.value = r.value;
      previewValueChange(r.id, r.value);
    }
  });
  renderSensorTable();
  showToast('info', 'Valores restaurados', 'Datos de sensores vuelven a valores iniciales de la demo');
}

// ─── GUÍA DE USO ────────────────────────────────────────────
function showHowItWorks() {
  const body = `
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="padding:12px;background:var(--bg3);border-radius:8px;border-left:3px solid var(--blue)">
        <div style="font-weight:700;color:var(--text);margin-bottom:6px;font-size:13px">1. Cómo funciona en producción</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.7">
          En un sistema real, los sensores (piezómetros LoRa, GPS RTK, etc.) envían datos cada
          <em>N</em> minutos al servidor via IoT. El backend evalúa cada lectura contra los umbrales
          y, si detecta anomalía, genera la alerta y envía el email automáticamente.
        </div>
      </div>
      <div style="padding:12px;background:var(--bg3);border-radius:8px;border-left:3px solid var(--green)">
        <div style="font-weight:700;color:var(--text);margin-bottom:6px;font-size:13px">2. Cómo probarlo en la demo</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.7">
          <strong style="color:var(--yellow)">Paso 1:</strong> En la tabla de abajo, localiza <strong>Piezómetro P4</strong> (valor actual 112 kPa).<br>
          <strong style="color:var(--yellow)">Paso 2:</strong> Escribe <strong>125</strong> en el campo de valor y presiona <strong>Aplicar</strong>.<br>
          <strong style="color:var(--yellow)">Paso 3:</strong> El sistema detectará que 125 > 120 (umbral crítico), creará una alerta ROJA,
          actualizará el dashboard y enviará el email de notificación (o simulará el preview si no hay credenciales).<br>
          <strong style="color:var(--yellow)">Paso 4:</strong> Ve a <strong>Dashboard</strong> o <strong>Alertas</strong> para ver la nueva alerta creada.
        </div>
      </div>
      <div style="padding:12px;background:var(--bg3);border-radius:8px;border-left:3px solid var(--yellow)">
        <div style="font-weight:700;color:var(--text);margin-bottom:6px;font-size:13px">3. Configurar EmailJS para envíos reales</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.7">
          1. Crear cuenta gratis en <a href="https://www.emailjs.com" target="_blank" style="color:var(--blue)">emailjs.com</a><br>
          2. Crear un <em>Email Service</em> (Gmail, Outlook, etc.)<br>
          3. Crear un <em>Email Template</em> con variables como <code style="background:var(--bg);padding:1px 4px;border-radius:3px">{{kpi_name}}</code>, <code style="background:var(--bg);padding:1px 4px;border-radius:3px">{{current_value}}</code><br>
          4. Copiar Service ID, Template ID y Public Key<br>
          5. Pegarlos en el panel de configuración de arriba y presionar "Guardar"<br>
          <em style="color:var(--text3)">Plan gratuito: 200 emails/mes — suficiente para una demo.</em>
        </div>
      </div>
    </div>
  `;
  openModal('❓ Cómo funciona el sistema de alertas', body,
    `<button class="btn btn-primary" onclick="closeModal()">¡Entendido!</button>`
  );
}

// ─── REGISTRAR VISTA EN ROUTER ────────────────────────────────
// Patch: agregar la nueva vista al sistema de renderizado
const _origRenderView = typeof renderView !== 'undefined' ? renderView : null;
