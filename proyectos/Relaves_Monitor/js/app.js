// RELAVES-MONITOR PRO - App Logic
let charts = {};

// ─── HELPERS ────────────────────────────────────────
function statusClass(s) {
  if (s === 'RED') return 'red';
  if (s === 'YELLOW') return 'yellow';
  if (s === 'GREEN') return 'green';
  return 'gray';
}
function statusTag(s, label) {
  return `<span class="tag tag-${statusClass(s)}">${label || s}</span>`;
}
function severityTag(s) {
  const labels = { RED:'CRÍTICO', YELLOW:'ADVERTENCIA', GREEN:'NORMAL' };
  return `<span class="alert-severity ${s}">${labels[s]||s}</span>`;
}
function fmtDate(d) {
  if (!d) return '—';
  return d.replace('2026-06-', '14/Jun ').slice(0,15);
}
function activeAlerts() {
  return appState.alerts.filter(a => a.status === 'ACTIVE');
}
function pendingMocs() {
  return appState.mocs.filter(m => m.status === 'PENDING_APPROVAL');
}
function getRole() { return appState.currentRole; }

// Role-based visibility
function canSee(level) { return getRole() >= level; }
function roleLabel() {
  const roles = {1:'Operador',2:'Supervisor',3:'Gerente',4:'Geotécnico',5:'Ejecutivo'};
  return roles[getRole()] || 'Operador';
}

// ─── TOAST ──────────────────────────────────────────
function showToast(type, title, msg) {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<div>
    <div class="toast-title">${title}</div>
    ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
  </div>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),350); }, 3500);
}

// ─── MODAL ──────────────────────────────────────────
function openModal(title, body, footer='') {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-footer').innerHTML = footer;
  document.getElementById('modal-overlay').classList.add('open');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}
function closeModalOnOverlay(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

// ─── NAVIGATION ─────────────────────────────────────
function showView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const item = document.querySelector(`.nav-item[onclick*="'${view}'"]`);
  if (item) item.classList.add('active');

  const titles = {
    dashboard:'Dashboard General', kpis:'KPIs en Tiempo Real',
    alerts:'Alertas Activas', sensors:'Estado de Sensores',
    moc:'Gestión de Cambios (MOC)', actions:'Acciones Correctivas',
    compliance:'Cumplimiento GISTM', audit:'Registro de Auditoría'
  };
  document.getElementById('page-title').textContent = titles[view] || view;
  appState.currentView = view;
  renderView(view);
}

function renderView(view) {
  const renderers = {
    dashboard: renderDashboard,
    kpis: renderKPIs,
    alerts: renderAlerts,
    sensors: renderSensors,
    moc: renderMOC,
    actions: renderActions,
    compliance: renderCompliance,
    audit: renderAudit,
  };
  if (renderers[view]) renderers[view]();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ─── ROLE SWITCHER ───────────────────────────────────
function switchRole(level) {
  appState.currentRole = parseInt(level);
  const users = {
    1: {name:'Juan García', role:'Operador de Turno', avatar:'JG'},
    2: {name:'Carlos Mendoza', role:'Supervisor de Turno', avatar:'CM'},
    3: {name:'Ana Torres', role:'Gerente de Operaciones', avatar:'AT'},
    4: {name:'Dr. Luis Paredes', role:'Especialista Geotécnico', avatar:'LP'},
    5: {name:'Ing. Rosa Vega', role:'Ejecutivo Responsable', avatar:'RV'},
  };
  const u = users[level];
  document.getElementById('user-avatar').textContent = u.avatar;
  document.getElementById('user-name').textContent = u.name;
  document.getElementById('user-role').textContent = u.role;
  renderView(appState.currentView);
  showToast('info', `Vista: ${u.role}`, `Mostrando permisos de ${u.name}`);
}

// ─── UPDATE TOPBAR ───────────────────────────────────
function updateTopbar() {
  const t = appState.time;
  document.getElementById('topbar-time').textContent =
    t.toTimeString().slice(0,8);

  const redAlerts = appState.alerts.filter(a => a.status==='ACTIVE' && a.severity==='RED');
  const badge = document.getElementById('risk-badge');
  const text = document.getElementById('risk-text');
  if (redAlerts.length > 0) {
    badge.className = 'risk-badge red';
    text.textContent = 'RIESGO CRÍTICO';
  } else {
    const yellowAlerts = appState.alerts.filter(a => a.status==='ACTIVE' && a.severity==='YELLOW');
    if (yellowAlerts.length > 0) {
      badge.className = 'risk-badge yellow';
      text.textContent = 'ALERTA ACTIVA';
    } else {
      badge.className = 'risk-badge green';
      text.textContent = 'SISTEMA NORMAL';
    }
  }

  const activeCount = activeAlerts().length;
  document.getElementById('badge-alerts').textContent = activeCount;
}

// ─── DASHBOARD ───────────────────────────────────────
function renderDashboard() {
  const role = getRole();
  const kpi = APP_DATA.kpis.find(k=>k.id==='K01');
  const fs = APP_DATA.kpis.find(k=>k.id==='K02');
  const aa = activeAlerts();
  const pm = pendingMocs();

  let executiveSection = '';
  if (role >= 3) {
    executiveSection = `
    <div class="section">
      <div class="section-header"><div class="section-title">📊 Resumen Ejecutivo</div></div>
      <div class="grid-3">
        <div class="stat-card">
          <div class="stat-value" style="color:var(--yellow)">6.4</div>
          <div class="stat-label">Risk Score / 10</div>
          <div class="stat-sub" style="color:var(--green)">↓ desde 8.2 (post MOC-C-002)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${aa.length}</div>
          <div class="stat-label">Alertas Activas</div>
          <div class="stat-sub">${aa.filter(a=>a.severity==='RED').length} crítica(s)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:var(--blue)">${APP_DATA.compliance.gistm}%</div>
          <div class="stat-label">GISTM Conformance</div>
          <div class="stat-sub">${APP_DATA.compliance.met}/${APP_DATA.compliance.totalRequirements} requisitos</div>
        </div>
      </div>
    </div>`;
  }

  const html = `
  ${executiveSection}

  <div class="section">
    <div class="section-header">
      <div class="section-title">⚡ KPIs Críticos</div>
      <div class="section-actions">
        <button class="btn btn-ghost btn-sm" onclick="showView('kpis')">Ver todos →</button>
      </div>
    </div>
    <div class="kpi-grid" id="dash-kpi-grid"></div>
  </div>

  <div class="charts-grid">
    <div class="card">
      <div class="card-title">Presión Intersticial P4 — Últimas 24h</div>
      <div class="chart-wrap"><canvas id="chartPressure"></canvas></div>
    </div>
    <div class="card">
      <div class="card-title">Factor de Seguridad — Últimas 24h</div>
      <div class="chart-wrap"><canvas id="chartFS"></canvas></div>
    </div>
  </div>

  <div class="grid-2">
    <div class="section">
      <div class="section-header">
        <div class="section-title">🔔 Alertas Activas</div>
        <div class="section-count">${aa.length}</div>
        <div class="section-actions">
          <button class="btn btn-ghost btn-sm" onclick="showView('alerts')">Ver todas →</button>
        </div>
      </div>
      <div class="alert-list" id="dash-alerts-list"></div>
    </div>

    <div class="section">
      <div class="section-header">
        <div class="section-title">✅ Acciones en Progreso</div>
      </div>
      <div id="dash-actions-list"></div>
      ${canSee(2) ? `<div style="margin-top:12px">
        <div class="section-header">
          <div class="section-title">📋 MOC Pendientes</div>
          <div class="section-count">${pm.length}</div>
        </div>
        <div id="dash-moc-list"></div>
      </div>` : ''}
    </div>
  </div>`;

  document.getElementById('dashboard-content').innerHTML = html;
  renderDashboardKPIs();
  renderDashboardAlerts();
  renderDashboardActions();
  renderDashboardMocs();
  initDashboardCharts();
}

function renderDashboardKPIs() {
  const role = getRole();
  let kpisToShow;
  if (role === 1) kpisToShow = ['K01','K02','K07','K10'];
  else if (role === 2) kpisToShow = ['K01','K02','K03','K06','K07','K10'];
  else kpisToShow = APP_DATA.kpis.slice(0,8).map(k=>k.id);

  const grid = document.getElementById('dash-kpi-grid');
  if (!grid) return;
  grid.innerHTML = kpisToShow.map(id => {
    const k = APP_DATA.kpis.find(k2=>k2.id===id);
    if (!k) return '';
    return kpiCard(k);
  }).join('');
}

function kpiCard(k) {
  const trendClass = k.trend === 'up' ? (k.status==='RED'||k.status==='YELLOW' ? 'up' : 'stable') : k.trend;
  const trendIcon = k.trend==='up'?'↑':k.trend==='down'?'↓':'→';
  const predBadge = k.prediction7d !== undefined ?
    `<div class="pred-tag">📈 Pred. 7d: ${k.prediction7d}${k.unit}</div>` : '';
  return `<div class="kpi-card ${k.status}" onclick="showKpiDetail('${k.id}')">
    <div class="kpi-dim">${k.dimension}</div>
    <div class="kpi-name">${k.name}</div>
    <div>
      <span class="kpi-value ${k.status}">${k.value}</span>
      <span class="kpi-unit">${k.unit}</span>
    </div>
    <div class="kpi-meta">
      <div class="kpi-trend ${trendClass}">${trendIcon} ${k.trendValue}</div>
      <div class="kpi-threshold">⚠ ${k.threshold_yellow} ${k.unit}</div>
    </div>
    ${predBadge}
  </div>`;
}

function renderDashboardAlerts() {
  const el = document.getElementById('dash-alerts-list');
  if (!el) return;
  const alerts = activeAlerts().slice(0,3);
  el.innerHTML = alerts.length ? alerts.map(a => alertCard(a, true)).join('') :
    '<div style="color:var(--text3);font-size:12px;padding:12px">Sin alertas activas ✓</div>';
}

function alertCard(a, compact=false) {
  const statusLabels = {ACTIVE:'ACTIVA', ACKNOWLEDGED:'RECONOCIDA', RESOLVED:'RESUELTA'};
  return `<div class="alert-card ${a.severity}" onclick="showAlertDetail('${a.id}')">
    <div class="alert-header">
      ${severityTag(a.severity)}
      <div class="alert-title">${a.title}</div>
      <div class="alert-status ${a.status}">${statusLabels[a.status]||a.status}</div>
    </div>
    ${!compact ? `<div class="alert-desc">${a.description}</div>` : ''}
    <div class="alert-footer">
      <div class="alert-time">🕐 ${fmtDate(a.detected_at)}</div>
      <div class="alert-escalated">→ ${a.escalated_to}</div>
    </div>
  </div>`;
}

function renderDashboardActions() {
  const el = document.getElementById('dash-actions-list');
  if (!el) return;
  const actions = appState.actions.filter(a => a.status !== 'COMPLETED').slice(0,3);
  el.innerHTML = `<div class="alert-list">${actions.map(a => `
    <div class="alert-card YELLOW" style="cursor:default">
      <div class="alert-header">
        <span class="tag tag-${a.priority==='HIGH'?'red':a.priority==='MEDIUM'?'yellow':'gray'}">${a.priority}</span>
        <div class="alert-title" style="font-size:12px">${a.title}</div>
        <span class="tag tag-${a.status==='IN_PROGRESS'?'blue':'gray'}">${a.status==='IN_PROGRESS'?'EN PROGRESO':'PENDIENTE'}</span>
      </div>
      <div class="alert-footer">
        <div class="alert-time">👤 ${a.assigned_to}</div>
        <div class="alert-escalated" style="color:var(--text3)">⏰ ${fmtDate(a.deadline)}</div>
      </div>
    </div>
  `).join('')}</div>`;
}

function renderDashboardMocs() {
  const el = document.getElementById('dash-moc-list');
  if (!el) return;
  const mocs = pendingMocs();
  el.innerHTML = mocs.length ? mocs.map(m => `
    <div class="alert-card YELLOW" onclick="showMocDetail('${m.id}')" style="margin-bottom:8px">
      <div class="alert-header">
        <span class="tag tag-yellow">MOC-${m.level}</span>
        <div class="alert-title" style="font-size:12px">${m.title}</div>
      </div>
      <div class="alert-footer">
        <div class="alert-time">Por: ${m.created_by}</div>
        <div class="alert-escalated">USD ${m.estimated_cost.toLocaleString()}</div>
      </div>
    </div>
  `).join('') : '<div style="color:var(--text3);font-size:12px;padding:8px">Sin MOCs pendientes</div>';
}

function initDashboardCharts() {
  destroyChart('chartPressure');
  destroyChart('chartFS');
  const d = APP_DATA.timeSeries;
  const opts = (color, threshold, thresholdRed) => ({
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: { legend: { display: false }, tooltip: { backgroundColor:'#1a2235', titleColor:'#e2e8f0', bodyColor:'#94a3b8', borderColor:'#1e2d45', borderWidth:1 } },
    scales: {
      x: { grid: { color:'rgba(255,255,255,.04)' }, ticks: { color:'#64748b', font:{size:10} } },
      y: { grid: { color:'rgba(255,255,255,.04)' }, ticks: { color:'#64748b', font:{size:10} } }
    }
  });

  charts['chartPressure'] = new Chart(document.getElementById('chartPressure'), {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Presión kPa', data: d.presionP4, borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,.08)', tension:.4, fill:true, pointRadius:3, pointBackgroundColor:'#ef4444' },
        { label: 'Umbral Warning', data: Array(d.labels.length).fill(100), borderColor:'#f59e0b', borderDash:[4,4], pointRadius:0, borderWidth:1.5 },
        { label: 'Umbral Crítico', data: Array(d.labels.length).fill(120), borderColor:'#ef4444', borderDash:[4,4], pointRadius:0, borderWidth:1.5 },
      ]
    },
    options: opts('#ef4444')
  });

  charts['chartFS'] = new Chart(document.getElementById('chartFS'), {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Factor Seguridad', data: d.factorSeguridad, borderColor:'#f59e0b', backgroundColor:'rgba(245,158,11,.08)', tension:.4, fill:true, pointRadius:3, pointBackgroundColor:'#f59e0b' },
        { label: 'Mínimo (1.5)', data: Array(d.labels.length).fill(1.5), borderColor:'#f59e0b', borderDash:[4,4], pointRadius:0, borderWidth:1.5 },
        { label: 'Crítico (1.3)', data: Array(d.labels.length).fill(1.3), borderColor:'#ef4444', borderDash:[4,4], pointRadius:0, borderWidth:1.5 },
      ]
    },
    options: opts('#f59e0b')
  });
}

function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

// ─── KPIs VIEW ──────────────────────────────────────
function renderKPIs() {
  const html = `
  <div class="section">
    <div class="section-header">
      <div class="section-title">📡 15 KPIs — Actualización continua</div>
      <div class="sim-badge" style="font-size:10px"><div class="sim-dot"></div>Cada 5 min</div>
    </div>
    <div class="kpi-grid">${APP_DATA.kpis.map(k => kpiCard(k)).join('')}</div>
  </div>
  <div class="section">
    <div class="section-header"><div class="section-title">📈 Tendencias — Últimas 24h</div></div>
    <div class="charts-grid">
      <div class="card"><div class="card-title">Presión Intersticial — Todos los Piezómetros</div><div class="chart-wrap"><canvas id="chartAllPressure"></canvas></div></div>
      <div class="card"><div class="card-title">Caudal de Descarga (m³/h)</div><div class="chart-wrap"><canvas id="chartCaudal"></canvas></div></div>
    </div>
  </div>`;
  document.getElementById('kpis-content').innerHTML = html;
  setTimeout(() => {
    const d = APP_DATA.timeSeries;
    destroyChart('chartAllPressure');
    destroyChart('chartCaudal');
    charts['chartAllPressure'] = new Chart(document.getElementById('chartAllPressure'), {
      type:'line',
      data:{
        labels:d.labels,
        datasets:[
          {label:'P4 Talud Este', data:d.presionP4, borderColor:'#ef4444', tension:.4, fill:false, pointRadius:2},
          {label:'P1 Talud Norte', data:d.presionP1, borderColor:'#22c55e', tension:.4, fill:false, pointRadius:2},
          {label:'Umbral 100kPa', data:Array(d.labels.length).fill(100), borderColor:'#f59e0b', borderDash:[4,4], pointRadius:0, borderWidth:1},
        ]
      },
      options:{responsive:true,maintainAspectRatio:false,animation:{duration:0},plugins:{legend:{labels:{color:'#94a3b8',font:{size:10}}}},scales:{x:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#64748b',font:{size:10}}},y:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#64748b',font:{size:10}}}}}
    });
    charts['chartCaudal'] = new Chart(document.getElementById('chartCaudal'), {
      type:'line',
      data:{labels:d.labels,datasets:[{label:'Caudal m³/h', data:d.caudal, borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,.08)', tension:.4, fill:true, pointRadius:2}]},
      options:{responsive:true,maintainAspectRatio:false,animation:{duration:0},plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#64748b',font:{size:10}}},y:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#64748b',font:{size:10}}}}}
    });
  }, 50);
}

function showKpiDetail(id) {
  const k = APP_DATA.kpis.find(k=>k.id===id);
  if (!k) return;
  const statusColors = {GREEN:'green', YELLOW:'yellow', RED:'red'};
  const body = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
      ${statusTag(k.status)}
      <div style="font-size:11px;color:var(--text3)">${k.dimension} · ${k.id}</div>
    </div>
    <div style="font-size:36px;font-family:var(--mono);font-weight:700;color:var(--${statusColors[k.status]});margin-bottom:4px">
      ${k.value}<span style="font-size:16px;color:var(--text3);margin-left:4px">${k.unit}</span>
    </div>
    <div style="color:var(--text3);font-size:12px;margin-bottom:16px">${k.description||''}</div>
    <div class="card" style="margin-bottom:12px">
      <div class="card-title">Umbrales</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:6px;padding:10px;text-align:center">
          <div style="color:var(--yellow);font-weight:700;font-family:var(--mono);font-size:18px">${k.threshold_yellow} ${k.unit}</div>
          <div style="color:var(--text3);font-size:10px;margin-top:2px">⚠ ADVERTENCIA</div>
        </div>
        <div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:6px;padding:10px;text-align:center">
          <div style="color:var(--red);font-weight:700;font-family:var(--mono);font-size:18px">${k.threshold_red} ${k.unit}</div>
          <div style="color:var(--text3);font-size:10px;margin-top:2px">🔴 CRÍTICO</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Predicción ML — próximos 7 días</div>
      <div style="display:flex;align-items:center;gap:12px">
        <div style="font-size:28px;font-family:var(--mono);font-weight:700;color:${k.prediction7d > k.threshold_red ? 'var(--red)' : k.prediction7d > k.threshold_yellow ? 'var(--yellow)' : 'var(--green)'}">
          ${k.prediction7d}<span style="font-size:13px;margin-left:3px;color:var(--text3)">${k.unit}</span>
        </div>
        <div style="font-size:12px;color:var(--text3)">${k.trend === 'up' ? '⬆ Tendencia ascendente' : k.trend === 'down' ? '⬇ Tendencia descendente' : '→ Estable'}</div>
      </div>
    </div>
    <div style="color:var(--text3);font-size:11px;margin-top:12px;font-family:var(--mono)">Última actualización: ${k.lastUpdate}</div>
  `;
  openModal(`📊 ${k.name}`, body, `<button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>`);
}

// ─── ALERTS VIEW ────────────────────────────────────
function renderAlerts() {
  const all = appState.alerts;
  const tabs = ['TODAS','ACTIVAS','RESUELTAS'];
  const html = `
  <div class="section">
    <div class="section-header">
      <div class="section-title">🔔 Alertas del Sistema</div>
      ${canSee(3) ? `<div class="section-actions"><button class="btn btn-ghost btn-sm" onclick="exportReport()">📄 Exportar Reporte</button></div>` : ''}
    </div>
    <div style="display:flex;gap:8px;margin-bottom:16px">
      <button class="btn btn-primary btn-sm" onclick="filterAlerts('all', this)">TODAS (${all.length})</button>
      <button class="btn btn-ghost btn-sm" onclick="filterAlerts('active', this)">ACTIVAS (${activeAlerts().length})</button>
      <button class="btn btn-ghost btn-sm" onclick="filterAlerts('resolved', this)">RESUELTAS (${all.filter(a=>a.status==='RESOLVED').length})</button>
    </div>
    <div class="alert-list" id="alerts-list">${all.map(a=>alertCard(a,false)).join('')}</div>
  </div>`;
  document.getElementById('alerts-content').innerHTML = html;
}

function filterAlerts(type, btn) {
  document.querySelectorAll('#alerts-content .btn').forEach(b=>b.className='btn btn-ghost btn-sm');
  btn.className = 'btn btn-primary btn-sm';
  let filtered;
  if (type === 'active') filtered = appState.alerts.filter(a=>a.status==='ACTIVE');
  else if (type === 'resolved') filtered = appState.alerts.filter(a=>a.status==='RESOLVED');
  else filtered = appState.alerts;
  document.getElementById('alerts-list').innerHTML = filtered.map(a=>alertCard(a,false)).join('');
}

function showAlertDetail(id) {
  const a = appState.alerts.find(a=>a.id===id);
  if (!a) return;
  const canAck = canSee(1) && a.status === 'ACTIVE';
  const canEscalate = canSee(2) && a.status !== 'RESOLVED';
  const canFP = canSee(4);

  const body = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      ${severityTag(a.severity)}
      <span class="alert-status ${a.status}" style="font-size:11px">${a.status}</span>
      <span style="color:var(--text3);font-size:11px;margin-left:auto">Sensor: ${a.sensor}</span>
    </div>
    <div style="font-size:13px;color:var(--text);margin-bottom:12px;line-height:1.6">${a.description}</div>
    <div class="card" style="margin-bottom:12px">
      <div class="card-title">Causa probable (ML)</div>
      <div style="font-size:13px;color:var(--text2)">🤖 ${a.probable_cause}</div>
    </div>
    <div class="card" style="margin-bottom:12px">
      <div class="card-title">Acciones recomendadas</div>
      ${a.recommended_actions.map((r,i)=>`<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;color:var(--text2)">
        <span style="color:var(--blue);font-weight:700">${i+1}.</span>${r}
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:12px;font-size:11px;color:var(--text3)">
      <span>🕐 ${fmtDate(a.detected_at)}</span>
      <span>→ Escalado a: ${a.escalated_to}</span>
    </div>
    ${a.acknowledged_by ? `<div style="font-size:11px;color:var(--green);margin-top:6px">✓ Reconocida por ${a.acknowledged_by} · ${fmtDate(a.acknowledged_at)}</div>` : ''}
  `;

  let footer = `<button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>`;
  if (canAck) footer += ` <button class="btn btn-warning" onclick="acknowledgeAlert('${a.id}')">✓ Reconocer</button>`;
  if (canEscalate) footer += ` <button class="btn btn-danger" onclick="escalateAlert('${a.id}')">⬆ Escalar</button>`;
  if (canFP && a.status !== 'RESOLVED') footer += ` <button class="btn btn-ghost" onclick="markFalsePositive('${a.id}')">Falso Positivo</button>`;

  openModal(`🔔 ${a.id} — ${a.title}`, body, footer);
}

function acknowledgeAlert(id) {
  const a = appState.alerts.find(a=>a.id===id);
  if (!a) return;
  a.status = 'ACKNOWLEDGED';
  a.acknowledged_by = APP_DATA.users.find(u=>u.level===getRole())?.name || 'Usuario';
  a.acknowledged_at = appState.time.toISOString().slice(0,19).replace('T',' ');
  addAuditEntry('ALERTA RECONOCIDA', `Alerta ${id} reconocida`);
  closeModal();
  showToast('success', 'Alerta reconocida', `${a.title}`);
  updateTopbar();
  if (appState.currentView === 'alerts') renderAlerts();
  if (appState.currentView === 'dashboard') renderDashboard();
}

function escalateAlert(id) {
  const a = appState.alerts.find(a=>a.id===id);
  if (!a) return;
  const nextLevels = {1:'Supervisor de Turno', 2:'Gerente de Operaciones', 3:'Ejecutivo Responsable', 4:'Junta Directiva'};
  const next = nextLevels[getRole()] || 'Nivel Superior';
  a.escalated_to = next;
  addAuditEntry('ALERTA ESCALADA', `Alerta ${id} escalada a ${next}`);
  closeModal();
  showToast('info', 'Alerta escalada', `Notificación enviada a ${next} vía SMS + Email`);
  if (appState.currentView === 'alerts') renderAlerts();
}

function markFalsePositive(id) {
  const a = appState.alerts.find(a=>a.id===id);
  if (!a) return;
  a.status = 'RESOLVED';
  a.resolved_at = appState.time.toISOString().slice(0,19).replace('T',' ');
  addAuditEntry('FALSO POSITIVO MARCADO', `Alerta ${id} marcada como falso positivo por Especialista`);
  closeModal();
  showToast('info', 'Falso positivo registrado', 'El modelo ML se actualizará en el próximo ciclo de reentrenamiento');
  updateTopbar();
  if (appState.currentView === 'alerts') renderAlerts();
}

// ─── SENSORS VIEW ────────────────────────────────────
function renderSensors() {
  const html = `
  <div class="section">
    <div class="section-header">
      <div class="section-title">📡 Estado de Sensores e Instrumentos</div>
      <div class="section-actions"><button class="btn btn-ghost btn-sm" onclick="refreshSensors()">↻ Actualizar</button></div>
    </div>
    <div class="grid-3" style="margin-bottom:16px">
      <div class="stat-card">
        <div class="stat-value" style="color:var(--green)">${APP_DATA.sensors.filter(s=>s.status==='GOOD').length}</div>
        <div class="stat-label">Sensores Operativos</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:var(--yellow)">${APP_DATA.sensors.filter(s=>s.status==='WARNING').length}</div>
        <div class="stat-label">Con Advertencia</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:var(--red)">${APP_DATA.sensors.filter(s=>s.status==='BAD').length}</div>
        <div class="stat-label">Con Falla</div>
      </div>
    </div>
    <div class="sensor-grid">
      ${APP_DATA.sensors.map(s => `
        <div class="sensor-card">
          <div class="sensor-indicator ${s.status}"></div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:600;color:var(--text)">${s.name}</div>
            <div style="font-size:10px;color:var(--text3);margin-top:2px">${s.type.toUpperCase()} · Cal: ${s.lastCalibrated}</div>
            <div style="margin-top:4px">
              <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:2px">
                <span>Batería</span><span>${s.battery}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill ${s.battery>50?'green':s.battery>20?'yellow':'red'}" style="width:${s.battery}%"></div>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
  document.getElementById('sensors-content').innerHTML = html;
}

function refreshSensors() {
  showToast('info', 'Sensores actualizados', 'Polling completado. 9/9 respondieron.');
  renderSensors();
}

// ─── MOC VIEW ────────────────────────────────────────
function renderMOC() {
  const html = `
  <div class="section">
    <div class="section-header">
      <div class="section-title">📋 Gestión de Cambios (MOC)</div>
      ${canSee(2) ? `<div class="section-actions"><button class="btn btn-primary btn-sm" onclick="createMOC()">+ Nuevo MOC</button></div>` : ''}
    </div>
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      ${['PENDING_APPROVAL','APPROVED','CLOSED'].map(s=>{
        const labels = {PENDING_APPROVAL:'PENDIENTE',APPROVED:'APROBADO',CLOSED:'CERRADO'};
        const colors = {PENDING_APPROVAL:'warning',APPROVED:'success',CLOSED:'ghost'};
        const count = appState.mocs.filter(m=>m.status===s).length;
        return `<button class="btn btn-${colors[s]} btn-sm">${labels[s]} (${count})</button>`;
      }).join('')}
    </div>
    <div class="alert-list">
      ${appState.mocs.map(m => mocCard(m)).join('')}
    </div>
  </div>`;
  document.getElementById('moc-content').innerHTML = html;
}

function mocCard(m) {
  const statusColors = {PENDING_APPROVAL:'YELLOW', APPROVED:'GREEN', CLOSED:'GREEN', IN_IMPLEMENTATION:'YELLOW'};
  const statusLabels = {PENDING_APPROVAL:'PENDIENTE APROBACIÓN', APPROVED:'APROBADO', CLOSED:'CERRADO', IN_IMPLEMENTATION:'EN EJECUCIÓN'};
  const levelColors = {A:'blue', B:'yellow', C:'red'};
  const approvedCount = m.approvals.filter(a=>a.status==='APPROVED').length;
  return `<div class="alert-card ${statusColors[m.status]||'GREEN'}" onclick="showMocDetail('${m.id}')">
    <div class="alert-header">
      <span class="tag tag-${levelColors[m.level]||'gray'}">MOC-${m.level}</span>
      <div class="alert-title">${m.title}</div>
      <span class="tag tag-${statusColors[m.status]==='YELLOW'?'yellow':'green'}">${statusLabels[m.status]||m.status}</span>
    </div>
    <div class="alert-desc">${m.description.slice(0,100)}...</div>
    <div class="alert-footer">
      <div class="alert-time">Por: ${m.created_by} · ${fmtDate(m.created_at)}</div>
      <div style="font-size:11px;color:var(--text3)">Aprobaciones: ${approvedCount}/${m.approvals.length}</div>
      <div class="alert-escalated">USD ${m.estimated_cost.toLocaleString()}</div>
    </div>
  </div>`;
}

function showMocDetail(id) {
  const m = appState.mocs.find(m=>m.id===id);
  if (!m) return;
  const levelLabels = {A:'Nivel A (Supervisor)', B:'Nivel B (Gerente)', C:'Nivel C (Ejecutivo)'};
  const pendingApproval = m.approvals.find(a=>a.status==='PENDING');
  const canApprove = pendingApproval && (
    (pendingApproval.role === 'Gerente de Operaciones' && canSee(3)) ||
    (pendingApproval.role === 'Especialista Geotécnico' && canSee(4)) ||
    (pendingApproval.role === 'Ejecutivo Responsable' && canSee(5)) ||
    (pendingApproval.role === 'Supervisor de Turno' && canSee(2))
  );

  const body = `
    <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
      <span class="tag tag-blue">${m.id}</span>
      <span class="tag tag-${m.status==='CLOSED'?'green':m.status==='PENDING_APPROVAL'?'yellow':'green'}">${m.status}</span>
      <span class="tag tag-gray">${levelLabels[m.level]||m.level}</span>
    </div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px;line-height:1.6">${m.description}</div>
    <div class="grid-2" style="margin-bottom:12px">
      <div class="card">
        <div class="card-title">Impacto</div>
        <div style="font-size:12px;color:var(--text2)">${m.impact||m.risk_analysis}</div>
      </div>
      <div class="card">
        <div class="card-title">Recursos</div>
        <div style="font-size:13px;color:var(--text);font-weight:700;margin-bottom:4px">USD ${m.estimated_cost.toLocaleString()}</div>
        <div style="font-size:12px;color:var(--text3)">Plazo: ${m.estimated_time}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Flujo de Aprobaciones</div>
      <div class="approval-steps">
        ${m.approvals.map((ap, i) => `
          <div class="approval-step">
            <div class="step-num ${ap.status==='APPROVED'?'done':'pending'}">${ap.status==='APPROVED'?'✓':i+1}</div>
            <div class="step-info">
              <div class="step-role">${ap.role}</div>
              <div class="step-person">${ap.name} ${ap.date ? '· '+fmtDate(ap.date) : '· Pendiente'}</div>
              ${ap.comment ? `<div style="font-size:11px;color:var(--text3);margin-top:2px;font-style:italic">"${ap.comment}"</div>` : ''}
            </div>
            <span class="tag tag-${ap.status==='APPROVED'?'green':'yellow'}">${ap.status==='APPROVED'?'APROBADO':'PENDIENTE'}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ${m.effectiveness ? `<div style="margin-top:12px;padding:10px 14px;background:var(--green-dim);border:1px solid rgba(34,197,94,.2);border-radius:6px;font-size:12px;color:var(--green)">✓ Efectividad validada: ${m.effectiveness} · Cerrado: ${fmtDate(m.closed_at)}</div>` : ''}
  `;

  let footer = `<button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>`;
  if (canApprove && m.status === 'PENDING_APPROVAL') {
    footer += ` <button class="btn btn-success" onclick="approveMOC('${m.id}')">✓ Aprobar MOC</button>`;
    footer += ` <button class="btn btn-danger" onclick="rejectMOC('${m.id}')">✕ Rechazar</button>`;
  }

  openModal(`📋 ${m.id} — ${m.title}`, body, footer);
}

function approveMOC(id) {
  const m = appState.mocs.find(m=>m.id===id);
  if (!m) return;
  const pending = m.approvals.find(a=>a.status==='PENDING');
  if (pending) {
    pending.status = 'APPROVED';
    pending.date = appState.time.toISOString().slice(0,19).replace('T',' ');
    pending.comment = 'Aprobado. Proceder según plan.';
  }
  const allApproved = m.approvals.every(a=>a.status==='APPROVED');
  if (allApproved) m.status = 'APPROVED';
  addAuditEntry('MOC APROBADO', `${id} aprobado por ${roleLabel()}`);
  closeModal();
  showToast('success', 'MOC Aprobado', `${id} avanzó a siguiente etapa. Firma digital registrada.`);
  renderMOC();
}

function rejectMOC(id) {
  addAuditEntry('MOC RECHAZADO', `${id} rechazado. Requiere revisión.`);
  closeModal();
  showToast('error', 'MOC Rechazado', 'El autor será notificado por email con los comentarios.');
}

function createMOC() {
  const body = `
    <div class="field"><label>Título del Cambio</label><input type="text" placeholder="ej. Instalación de bomba adicional sector Norte"></div>
    <div class="field"><label>Tipo de Cambio</label>
      <select><option>OPERACIONAL (Nivel A)</option><option>DISEÑO (Nivel B)</option><option>MAYOR (Nivel C)</option></select>
    </div>
    <div class="field"><label>Descripción</label><textarea placeholder="Descripción detallada del cambio propuesto..."></textarea></div>
    <div class="grid-2">
      <div class="field"><label>Costo Estimado (USD)</label><input type="number" placeholder="0"></div>
      <div class="field"><label>Plazo Estimado</label><input type="text" placeholder="ej. 1 semana"></div>
    </div>
    <div class="field"><label>Alerta de Origen</label>
      <select>${appState.alerts.map(a=>`<option value="${a.id}">${a.id} — ${a.title.slice(0,40)}</option>`).join('')}</select>
    </div>
    <div class="field"><label>Justificación Técnica</label><textarea placeholder="Análisis de riesgo, impacto esperado..."></textarea></div>
  `;
  openModal('+ Nuevo MOC', body, `
    <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="submitMOC()">Crear y Enviar a Aprobación</button>
  `);
}

function submitMOC() {
  const newId = 'MOC-A-' + String(Date.now()).slice(-3);
  const newMoc = {
    id: newId, level: 'A',
    title: 'Nuevo MOC - Acción correctiva',
    description: 'MOC creado desde el sistema en tiempo real. Requiere aprobación del supervisor.',
    status: 'PENDING_APPROVAL',
    created_by: APP_DATA.users.find(u=>u.level===getRole())?.name || 'Usuario',
    created_at: appState.time.toISOString().slice(0,19).replace('T',' '),
    origin_alert: appState.alerts[0]?.id,
    estimated_cost: 0,
    estimated_time: 'A definir',
    approvals: [{ role:'Supervisor de Turno', name:'Carlos Mendoza', status:'PENDING', date:null, comment:null }],
    risk_analysis: 'Pendiente análisis',
    impact: 'Pendiente evaluación'
  };
  appState.mocs.unshift(newMoc);
  addAuditEntry('MOC CREADO', `${newId} creado y enviado a aprobación`);
  closeModal();
  showToast('success', 'MOC Creado', `${newId} enviado. Notificación por email al supervisor.`);
  renderMOC();
}

// ─── ACTIONS VIEW ────────────────────────────────────
function renderActions() {
  const html = `
  <div class="section">
    <div class="section-header">
      <div class="section-title">✅ Acciones Correctivas</div>
      ${canSee(2) ? `<div class="section-actions"><button class="btn btn-primary btn-sm" onclick="createAction()">+ Nueva Acción</button></div>` : ''}
    </div>
    <div class="grid-3" style="margin-bottom:16px">
      <div class="stat-card">
        <div class="stat-value" style="color:var(--blue)">${appState.actions.filter(a=>a.status==='IN_PROGRESS').length}</div>
        <div class="stat-label">En Progreso</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:var(--yellow)">${appState.actions.filter(a=>a.status==='PENDING').length}</div>
        <div class="stat-label">Pendientes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:var(--green)">${appState.actions.filter(a=>a.status==='COMPLETED').length}</div>
        <div class="stat-label">Completadas</div>
      </div>
    </div>
    <table class="data-table" style="background:var(--bg2);border-radius:var(--radius-lg);border:1px solid var(--border)">
      <thead><tr>
        <th>Acción</th><th>Asignado a</th><th>Prioridad</th><th>Estado</th><th>Deadline</th>${canSee(1)?'<th></th>':''}
      </tr></thead>
      <tbody>
        ${appState.actions.map(a => `<tr>
          <td><div style="font-weight:600;color:var(--text);font-size:12px">${a.title}</div>
            <div style="font-size:11px;color:var(--text3);margin-top:2px">${a.description.slice(0,60)}...</div></td>
          <td>${a.assigned_to}</td>
          <td><span class="tag tag-${a.priority==='HIGH'?'red':a.priority==='MEDIUM'?'yellow':'gray'}">${a.priority}</span></td>
          <td><span class="tag tag-${a.status==='COMPLETED'?'green':a.status==='IN_PROGRESS'?'blue':'gray'}">${a.status==='IN_PROGRESS'?'EN PROGRESO':a.status==='PENDING'?'PENDIENTE':'COMPLETADO'}</span></td>
          <td style="font-family:var(--mono);font-size:11px">${fmtDate(a.deadline)||fmtDate(a.completed_at)||'—'}</td>
          ${canSee(1) && a.status !== 'COMPLETED' ? `<td><button class="btn btn-success btn-sm" onclick="completeAction('${a.id}')">Completar</button></td>` : '<td></td>'}
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
  document.getElementById('actions-content').innerHTML = html;
}

function completeAction(id) {
  const a = appState.actions.find(a=>a.id===id);
  if (!a) return;
  a.status = 'COMPLETED';
  a.completed_at = appState.time.toISOString().slice(0,19).replace('T',' ');
  a.effectiveness = 'EFICAZ';
  addAuditEntry('ACCIÓN COMPLETADA', `Acción ${id}: ${a.title}`);
  showToast('success', 'Acción completada', a.title);
  renderActions();
}

function createAction() {
  const body = `
    <div class="field"><label>Título</label><input type="text" placeholder="ej. Inspeccionar bomba de drenaje B3"></div>
    <div class="field"><label>Descripción</label><textarea placeholder="Descripción detallada..."></textarea></div>
    <div class="grid-2">
      <div class="field"><label>Asignar a</label>
        <select>${APP_DATA.users.map(u=>`<option>${u.name} (${u.role})</option>`).join('')}</select>
      </div>
      <div class="field"><label>Prioridad</label>
        <select><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select>
      </div>
    </div>
    <div class="field"><label>Deadline</label><input type="datetime-local"></div>
    <div class="field"><label>Alerta Relacionada</label>
      <select><option value="">— Sin alerta —</option>${appState.alerts.map(a=>`<option>${a.id} — ${a.title.slice(0,40)}</option>`).join('')}</select>
    </div>
  `;
  openModal('+ Nueva Acción Correctiva', body, `
    <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="submitAction()">Crear Acción</button>
  `);
}

function submitAction() {
  const newId = 'AC' + String(Date.now()).slice(-3);
  appState.actions.unshift({
    id: newId,
    alert_id: null,
    title: 'Nueva acción correctiva',
    description: 'Acción creada desde el sistema',
    status: 'PENDING',
    assigned_to: 'Juan García',
    deadline: new Date(appState.time.getTime() + 86400000).toISOString().slice(0,19).replace('T',' '),
    created_at: appState.time.toISOString().slice(0,19).replace('T',' '),
    priority: 'MEDIUM'
  });
  addAuditEntry('ACCIÓN CREADA', `Acción ${newId} asignada`);
  closeModal();
  showToast('success', 'Acción creada', 'Notificación enviada al responsable asignado.');
  renderActions();
}

// ─── COMPLIANCE VIEW ────────────────────────────────
function renderCompliance() {
  const c = APP_DATA.compliance;
  const html = `
  <div class="section">
    <div class="section-header"><div class="section-title">🛡 Cumplimiento GISTM / MMG</div>
      ${canSee(3) ? `<div class="section-actions"><button class="btn btn-ghost btn-sm" onclick="exportCompliance()">📄 Generar Reporte PDF</button></div>` : ''}
    </div>
    <div class="grid-2">
      <div class="card" style="margin-bottom:16px">
        <div class="card-title">GISTM Conformance</div>
        <div class="compliance-widget">
          <div class="ring-container">
            <canvas id="ringChart" width="100" height="100"></canvas>
            <div class="ring-label"><div class="ring-pct">${c.gistm}%</div><div class="ring-sub">GISTM</div></div>
          </div>
          <div style="flex:1">
            <div style="font-size:13px;color:var(--text);margin-bottom:4px">${c.met} de ${c.totalRequirements} requisitos cumplidos</div>
            <div style="font-size:11px;color:var(--text3);margin-bottom:8px">Próxima auditoría: 15/Sep/2026</div>
            <div style="display:flex;gap:8px">
              <span class="tag tag-green">MET: ${c.items.filter(i=>i.status==='MET').length}</span>
              <span class="tag tag-yellow">PARCIAL: ${c.items.filter(i=>i.status==='PARTIAL').length}</span>
              <span class="tag tag-red">NO MET: ${c.items.filter(i=>i.status==='NOT_MET').length}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card" style="margin-bottom:16px">
        <div class="card-title">Métricas del Mes</div>
        <div class="compliance-items">
          ${[
            {label:'Alertas detectadas', value:'15'},
            {label:'Tiempo promedio escalación', value:'2.3 h'},
            {label:'Acciones completadas', value:'4/4 (100%)'},
            {label:'Falsos positivos', value:'1 (6.7%)'},
            {label:'Uptime sensores', value:'97.2%'},
            {label:'MOCs aprobados', value:'1/2'},
          ].map(row=>`<div class="comp-item"><span style="flex:1">${row.label}</span><span style="font-family:var(--mono);font-size:11px;color:var(--text)">${row.value}</span></div>`).join('')}
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Detalle de Requisitos GISTM</div>
      <table class="data-table">
        <thead><tr><th>#</th><th>Requisito</th><th>Estado</th></tr></thead>
        <tbody>
          ${c.items.map(item=>`<tr>
            <td style="font-family:var(--mono);color:var(--text3)">${item.id}</td>
            <td>${item.name}</td>
            <td><span class="tag tag-${item.status==='MET'?'green':item.status==='PARTIAL'?'yellow':'red'}">${item.status==='MET'?'CUMPLIDO':item.status==='PARTIAL'?'PARCIAL':'NO CUMPLIDO'}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
  document.getElementById('compliance-content').innerHTML = html;
  setTimeout(() => {
    const canvas = document.getElementById('ringChart');
    if (!canvas) return;
    destroyChart('ringChart');
    charts['ringChart'] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [c.gistm, 100-c.gistm],
          backgroundColor: ['#22c55e', '#1a2235'],
          borderWidth: 0,
        }]
      },
      options: { responsive: false, cutout:'75%', plugins:{legend:{display:false},tooltip:{enabled:false}}, animation:{duration:800} }
    });
  }, 50);
}

function exportCompliance() {
  showToast('success', 'Reporte Generado', 'Reporte GISTM PDF generado (demo). En producción se enviaría por email.');
}

// ─── AUDIT VIEW ─────────────────────────────────────
function renderAudit() {
  const html = `
  <div class="section">
    <div class="section-header">
      <div class="section-title">📖 Registro de Auditoría (Audit Log)</div>
      ${canSee(3) ? `<div class="section-actions"><button class="btn btn-ghost btn-sm" onclick="showToast('info','Exportado','Log completo generado en CSV.')">📥 Exportar CSV</button></div>` : ''}
    </div>
    <div class="card" style="margin-bottom:16px">
      <div class="card-title">Integridad del Log</div>
      <div style="display:flex;align-items:center;gap:12px">
        <span class="tag tag-green">✓ 100% ÍNTEGRO</span>
        <span style="font-size:12px;color:var(--text3)">0 registros alterados · Firma digital activa · Retención: 7 años (GISTM)</span>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Actividad Reciente</div>
      <div class="timeline">
        ${appState.auditLog.slice().reverse().map(entry => `
          <div class="tl-item">
            <div class="tl-icon">📝</div>
            <div class="tl-content">
              <div class="tl-action">${entry.action}</div>
              <div class="tl-meta">
                <span style="color:var(--text2)">${entry.user}</span>
                <span style="margin:0 6px">·</span>
                <span>${entry.resource}</span>
                <span style="margin:0 6px">·</span>
                <span style="font-family:var(--mono);color:var(--text3)">${fmtDate(entry.timestamp)}</span>
                ${entry.ip ? `<span style="margin:0 6px;color:var(--text3)">·</span><span style="font-family:var(--mono);color:var(--text3);font-size:10px">${entry.ip}</span>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
  document.getElementById('audit-content').innerHTML = html;
}

// ─── AUDIT HELPER ───────────────────────────────────
function addAuditEntry(action, resource) {
  const user = APP_DATA.users.find(u=>u.level===getRole());
  appState.auditLog.push({
    id: appState.auditLog.length + 1,
    user: user?.name || 'Sistema',
    action,
    resource,
    timestamp: appState.time.toISOString().slice(0,19).replace('T',' '),
    ip: `10.0.0.${getRole() * 10}`
  });
}

// ─── LIVE UPDATE ───────────────────────────────────
function updateDashboard() {
  updateTopbar();
  if (appState.currentView === 'dashboard') {
    renderDashboardKPIs();
    renderDashboardAlerts();
    // Update charts
    const k = APP_DATA.kpis.find(k=>k.id==='K01');
    if (charts['chartPressure'] && k) {
      const data = charts['chartPressure'].data.datasets[0].data;
      data.push(k.value);
      data.shift();
      charts['chartPressure'].update('none');
    }
  }
  if (appState.currentView === 'kpis') {
    document.querySelectorAll('.kpi-grid').forEach(grid => {
      if (grid.children.length > 0) renderKPIs();
    });
  }
}

// ─── EXPORT REPORT ─────────────────────────────────
function exportReport() {
  showToast('success', 'Reporte Exportado', 'Reporte de alertas del mes generado. En producción: PDF enviado por email.');
}

// ─── INIT ──────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  updateTopbar();
  startSimulation();

  // Clock
  setInterval(() => {
    appState.time = new Date(appState.time.getTime() + 1000);
    document.getElementById('topbar-time').textContent = appState.time.toTimeString().slice(0,8);
  }, 1000);

  // Alert notification on load
  setTimeout(() => {
    showToast('error', '🔴 ALERTA CRÍTICA', 'Presión Intersticial P4: 112 kPa — Por encima del umbral crítico');
  }, 1500);

  setTimeout(() => {
    showToast('info', 'Sistema activo', 'Simulación en tiempo real iniciada. Datos se actualizan cada 5s.');
  }, 3000);
});
