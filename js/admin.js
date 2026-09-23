/**
 * Módulo Administrativo & Estadístico
 * Control de acceso (Clave: "Sifilis2026"), Gráficas Chart.js, Tabla de datos,
 * Configuración Supabase y Exportación a PDF / Excel (.xlsx).
 */

class AdminModule {
    constructor() {
        this.isAuthenticated = false;
        this.responses = [];
        this.charts = {};
        this.filteredResponses = [];
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const loginBtn = document.getElementById('btn-admin-login');
        const passInput = document.getElementById('admin-password-input');
        const exportExcelBtn = document.getElementById('btn-export-excel');
        const exportPdfBtn = document.getElementById('btn-export-pdf');
        const configSupabaseBtn = document.getElementById('btn-config-supabase');
        const saveSupabaseBtn = document.getElementById('btn-save-supabase-config');
        const searchInput = document.getElementById('table-search-input');

        if (loginBtn) loginBtn.addEventListener('click', () => this.handleLogin());
        if (passInput) passInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        if (exportExcelBtn) exportExcelBtn.addEventListener('click', () => this.exportToExcel());
        if (exportPdfBtn) exportPdfBtn.addEventListener('click', () => this.exportToPDF());
        if (configSupabaseBtn) configSupabaseBtn.addEventListener('click', () => this.openSupabaseConfigModal());
        if (saveSupabaseBtn) saveSupabaseBtn.addEventListener('click', () => this.saveSupabaseConfig());
        if (searchInput) searchInput.addEventListener('input', (e) => this.filterTable(e.target.value));
    }

    promptLogin() {
        if (this.isAuthenticated) {
            this.showAdminView();
            return;
        }
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.add('open');
            document.getElementById('admin-password-input').focus();
        }
    }

    handleLogin() {
        const passInput = document.getElementById('admin-password-input');
        const errorMsg = document.getElementById('auth-error-msg');
        const val = passInput ? passInput.value.trim() : '';

        if (val === 'Sifilis2026') {
            this.isAuthenticated = true;
            if (errorMsg) errorMsg.style.display = 'none';
            
            const modal = document.getElementById('auth-modal');
            if (modal) modal.classList.remove('open');

            this.showAdminView();
        } else {
            if (errorMsg) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Contraseña incorrecta. Verifique e intente de nuevo.';
            }
        }
    }

    async showAdminView() {
        document.getElementById('view-questionnaire').classList.remove('active');
        document.getElementById('view-admin').classList.add('active');

        this.responses = await window.supabaseService.getAllResponses();
        this.filteredResponses = [...this.responses];

        this.renderMetrics();
        this.renderCharts();
        this.renderDataTable();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showQuestionnaireView() {
        document.getElementById('view-admin').classList.remove('active');
        document.getElementById('view-questionnaire').classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderMetrics() {
        const total = this.responses.length;
        const avgAge = total > 0 ? (this.responses.reduce((acc, r) => acc + (parseInt(r.edad) || 0), 0) / total).toFixed(1) : 0;
        
        const correctBacteriaCount = this.responses.filter(r => r.b5_causada_por === 'Bacteria').length;
        const pctBacteria = total > 0 ? Math.round((correctBacteriaCount / total) * 100) : 0;

        const condomUsersCount = this.responses.filter(r => r.d5_frecuencia_uso_preservativo_3m === 'Siempre' || r.d5_frecuencia_uso_preservativo_3m === 'A menudo').length;
        const pctCondom = total > 0 ? Math.round((condomUsersCount / total) * 100) : 0;

        document.getElementById('metric-total-count').textContent = total;
        document.getElementById('metric-avg-age').textContent = `${avgAge} años`;
        document.getElementById('metric-pct-bacteria').textContent = `${pctBacteria}%`;
        document.getElementById('metric-pct-condom').textContent = `${pctCondom}%`;
    }

    renderCharts() {
        if (!window.Chart) return;

        const colorsPie = ['#0d9488', '#2563eb', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

        // 1. Chart: Sex Distribution
        const sexCounts = { Masculino: 0, Femenino: 0, Otro: 0 };
        this.responses.forEach(r => {
            if (r.sexo) sexCounts[r.sexo] = (sexCounts[r.sexo] || 0) + 1;
        });
        this.createOrUpdateChart('chart-sexo', 'doughnut', {
            labels: Object.keys(sexCounts),
            datasets: [{ data: Object.values(sexCounts), backgroundColor: colorsPie }]
        }, { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } });

        // 2. Chart: Microorganismo Causante
        const causeCounts = { Bacteria: 0, Hongo: 0, Virus: 0 };
        this.responses.forEach(r => {
            if (r.b5_causada_por) causeCounts[r.b5_causada_por] = (causeCounts[r.b5_causada_por] || 0) + 1;
        });
        this.createOrUpdateChart('chart-causa', 'pie', {
            labels: Object.keys(causeCounts),
            datasets: [{ data: Object.values(causeCounts), backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }]
        }, { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } });

        // 3. Chart: Frecuencia Uso Condón
        const condomCounts = { Siempre: 0, 'A menudo': 0, 'Algunas veces': 0, Nunca: 0 };
        this.responses.forEach(r => {
            if (r.d5_frecuencia_uso_preservativo_3m) {
                condomCounts[r.d5_frecuencia_uso_preservativo_3m] = (condomCounts[r.d5_frecuencia_uso_preservativo_3m] || 0) + 1;
            }
        });
        this.createOrUpdateChart('chart-condom', 'doughnut', {
            labels: Object.keys(condomCounts),
            datasets: [{ data: Object.values(condomCounts), backgroundColor: ['#059669', '#3b82f6', '#f59e0b', '#ef4444'] }]
        }, { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } });

        // 4. Chart: Síntomas Identificados
        const symptomCounts = {};
        this.responses.forEach(r => {
            let list = r.b7_sintomas_sifilis;
            if (typeof list === 'string') {
                try { list = JSON.parse(list); } catch (e) { list = [list]; }
            }
            if (Array.isArray(list)) {
                list.forEach(s => { symptomCounts[s] = (symptomCounts[s] || 0) + 1; });
            }
        });

        this.createOrUpdateChart('chart-sintomas', 'bar', {
            labels: Object.keys(symptomCounts),
            datasets: [{ label: 'Respuestas', data: Object.values(symptomCounts), backgroundColor: '#0d9488', borderRadius: 6 }]
        }, { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } });

        // 5. Chart: Escala de Actitudes
        const likertKeys = [
            { key: 'c1_preocuparia_sifilis', label: '1. Se preocuparía' },
            { key: 'c2_enfermedad_vergonzosa', label: '2. Vergonzosa' },
            { key: 'c3_responsabilidad_institucion_pruebas', label: '3. Responsabilidad Pruebas' },
            { key: 'c4_no_decirle_pareja', label: '4. No decirle a pareja' },
            { key: 'c5_confia_servicio_medico_militar', label: '5. Confía Serv. Médico' },
            { key: 'c6_preservativos_eficaz', label: '6. Preservativo Eficaz' },
            { key: 'c7_atencion_medica_inmediata', label: '7. Atención Inmediata' }
        ];

        const totalResp = this.responses.length || 1;
        const likertAverages = likertKeys.map(lk => {
            const sum = this.responses.reduce((acc, r) => acc + (parseInt(r[lk.key]) || 0), 0);
            return (sum / totalResp).toFixed(2);
        });

        this.createOrUpdateChart('chart-actitudes', 'bar', {
            labels: likertKeys.map(lk => lk.label),
            datasets: [{ label: 'Promedio Escala (1 a 5)', data: likertAverages, backgroundColor: '#2563eb', borderRadius: 6 }]
        }, { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { min: 1, max: 5 } } });
    }

    createOrUpdateChart(canvasId, type, data, options) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        this.charts[canvasId] = new Chart(ctx, { type, data, options });
    }

    renderDataTable() {
        const tbody = document.getElementById('data-table-body');
        if (!tbody) return;

        if (this.filteredResponses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                        No se encontraron encuestas registradas.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredResponses.map((r, i) => {
            const dateStr = r.fecha_registro ? new Date(r.fecha_registro).toLocaleString('es-VE') : 'N/A';
            const nombre = r.a0_nombre_participante || r.nombre_participante || 'Anónimo';
            return `
                <tr>
                    <td><strong>#${i + 1}</strong></td>
                    <td><strong>${nombre}</strong></td>
                    <td>${dateStr}</td>
                    <td>${r.edad || '-'} a</td>
                    <td>${r.sexo || '-'}</td>
                    <td>${r.unidad_dependencia || '-'}</td>
                    <td>
                        <div style="display: flex; gap: 0.35rem;">
                            <button class="btn btn-sm btn-outline-primary" onclick="adminModule.viewDetail('${r.id}')" title="Ver Detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-light" style="color: var(--danger); border-color: var(--border);" onclick="adminModule.deleteRecord('${r.id}')" title="Eliminar">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    filterTable(searchTerm) {
        const term = searchTerm.toLowerCase();
        this.filteredResponses = this.responses.filter(r => {
            const nombre = (r.a0_nombre_participante || r.nombre_participante || '').toLowerCase();
            const unidad = (r.unidad_dependencia || '').toLowerCase();
            const origen = (r.estado_origen || '').toLowerCase();
            return nombre.includes(term) || unidad.includes(term) || origen.includes(term) || (r.edad && r.edad.toString().includes(term));
        });
        this.renderDataTable();
    }

    viewDetail(id) {
        const r = this.responses.find(item => item.id === id);
        if (!r) return;

        const body = document.getElementById('detail-modal-body');
        if (!body) return;

        const formatArr = (val) => {
            if (!val) return 'No especificado';
            if (Array.isArray(val)) return val.join(', ');
            if (typeof val === 'string' && val.startsWith('[')) {
                try { return JSON.parse(val).join(', '); } catch (e) { return val; }
            }
            return val;
        };

        const nombre = r.a0_nombre_participante || r.nombre_participante || 'Anónimo';

        body.innerHTML = `
            <div class="detail-grid">
                <div class="detail-section-title">A. Datos Sociodemográficos & Identificación</div>
                <div class="detail-item"><span class="lbl">Nombre Participante:</span><span class="val" style="color: var(--primary);">${nombre}</span></div>
                <div class="detail-item"><span class="lbl">Edad:</span><span class="val">${r.edad} años</span></div>
                <div class="detail-item"><span class="lbl">Estado de Origen:</span><span class="val">${r.estado_origen || '-'}</span></div>
                <div class="detail-item"><span class="lbl">Sexo:</span><span class="val">${r.sexo} ${r.sexo_otro ? `(${r.sexo_otro})` : ''}</span></div>
                <div class="detail-item"><span class="lbl">Estado Civil:</span><span class="val">${r.estado_civil} ${r.estado_civil_otro ? `(${r.estado_civil_otro})` : ''}</span></div>
                <div class="detail-item"><span class="lbl">Grado Académico:</span><span class="val">${r.grado_academico}</span></div>
                <div class="detail-item"><span class="lbl">Unidad:</span><span class="val">${r.unidad_dependencia}</span></div>
                <div class="detail-item"><span class="lbl">Tiempo Servicio:</span><span class="val">${r.tiempo_servicio_valor} ${r.tiempo_servicio_unidad}</span></div>

                <div class="detail-section-title">B. Conocimientos sobre Sífilis</div>
                <div class="detail-item"><span class="lbl">¿Escuchó sobre sífilis?:</span><span class="val">${r.b1_escuchado_sifilis} ${r.b1_donde_escucho ? `(${r.b1_donde_escucho})` : ''}</span></div>
                <div class="detail-item"><span class="lbl">¿Qué es la sífilis?:</span><span class="val">${r.b2_que_es_sifilis || '-'}</span></div>
                <div class="detail-item"><span class="lbl">Vías de Transmisión:</span><span class="val">${formatArr(r.b3_transmision_opciones)}</span></div>
                <div class="detail-item"><span class="lbl">Causada por:</span><span class="val">${r.b5_causada_por}</span></div>
                <div class="detail-item"><span class="lbl">Nombre Microorganismo:</span><span class="val">${r.b6_nombre_microorganismo} ${r.b6_como_se_llama ? `(${r.b6_como_se_llama})` : ''}</span></div>
                <div class="detail-item"><span class="lbl">Síntomas Reconocidos:</span><span class="val">${formatArr(r.b7_sintomas_sifilis)}</span></div>
                <div class="detail-item"><span class="lbl">Tratamientos:</span><span class="val">${formatArr(r.b8_tratamiento_sifilis)}</span></div>
                <div class="detail-item"><span class="lbl">Factores de Riesgo:</span><span class="val">${formatArr(r.b9_factores_riesgo)}</span></div>

                <div class="detail-section-title">C. Actitudes (Escala 1 al 5)</div>
                <div class="detail-item"><span class="lbl">Se preocuparía si tuviera:</span><span class="val">${r.c1_preocuparia_sifilis || '-'} / 5</span></div>
                <div class="detail-item"><span class="lbl">Enfermedad vergonzosa:</span><span class="val">${r.c2_enfermedad_vergonzosa || '-'} / 5</span></div>
                <div class="detail-item"><span class="lbl">Responsabilidad hacer pruebas:</span><span class="val">${r.c3_responsabilidad_institucion_pruebas || '-'} / 5</span></div>
                <div class="detail-item"><span class="lbl">Preservativo es eficaz:</span><span class="val">${r.c6_preservativos_eficaz || '-'} / 5</span></div>

                <div class="detail-section-title">D. Prácticas</div>
                <div class="detail-item"><span class="lbl">Edad 1ª relación:</span><span class="val">${r.d1_edad_primera_relacion} años</span></div>
                <div class="detail-item"><span class="lbl">Parejas últimos meses:</span><span class="val">${r.d2_numero_parejas_ultimos_meses}</span></div>
                <div class="detail-item"><span class="lbl">Frecuencia uso condón:</span><span class="val">${r.d5_frecuencia_uso_preservativo_3m}</span></div>
                <div class="detail-item"><span class="lbl">Prueba en últimos 12 meses:</span><span class="val">${r.d6_prueba_sifilis_12m}</span></div>
            </div>
        `;

        const modal = document.getElementById('detail-modal');
        if (modal) modal.classList.add('open');
    }

    async deleteRecord(id) {
        if (confirm('¿Está seguro de que desea eliminar esta encuesta?')) {
            await window.supabaseService.deleteResponse(id);
            this.responses = await window.supabaseService.getAllResponses();
            this.filteredResponses = [...this.responses];
            this.renderMetrics();
            this.renderCharts();
            this.renderDataTable();
        }
    }

    openSupabaseConfigModal() {
        const creds = window.supabaseService.getCredentials();
        document.getElementById('supabase-url-input').value = creds.url || '';
        document.getElementById('supabase-key-input').value = creds.key || '';
        
        const modal = document.getElementById('supabase-config-modal');
        if (modal) modal.classList.add('open');
    }

    saveSupabaseConfig() {
        const url = document.getElementById('supabase-url-input').value.trim();
        const key = document.getElementById('supabase-key-input').value.trim();

        if (url && key) {
            const success = window.supabaseService.saveCredentials(url, key);
            if (success) {
                alert('Credenciales de Supabase guardadas correctamente.');
                document.getElementById('supabase-config-modal').classList.remove('open');
                this.showAdminView();
            } else {
                alert('Error al conectar con Supabase.');
            }
        } else {
            window.supabaseService.clearCredentials();
            alert('Credenciales removidas. Usando modo de almacenamiento local.');
            document.getElementById('supabase-config-modal').classList.remove('open');
        }
    }

    exportToExcel() {
        if (!window.XLSX) {
            alert('Librería Excel no cargada.');
            return;
        }

        const dataToExport = this.responses.map((r, index) => ({
            'N°': index + 1,
            'Nombre Participante': r.a0_nombre_participante || r.nombre_participante || 'Anónimo',
            'Fecha Registro': r.fecha_registro ? new Date(r.fecha_registro).toLocaleString() : '',
            'Edad': r.edad,
            'Estado Origen': r.estado_origen,
            'Sexo': r.sexo,
            'Estado Civil': r.estado_civil,
            'Grado Académico': r.grado_academico,
            'Unidad/Dependencia': r.unidad_dependencia,
            'Tiempo Servicio': `${r.tiempo_servicio_valor} ${r.tiempo_servicio_unidad}`,
            'Escuchó sobre Sífilis': r.b1_escuchado_sifilis,
            'Causada Por': r.b5_causada_por,
            'Frecuencia Uso Condón (3m)': r.d5_frecuencia_uso_preservativo_3m,
            'Prueba Sífilis 12m': r.d6_prueba_sifilis_12m
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Encuestas Sífilis");

        XLSX.writeFile(workbook, `Reporte_Encuestas_Sifilis_${new Date().toISOString().slice(0,10)}.xlsx`);
    }

    exportToPDF() {
        window.print();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.adminModule = new AdminModule();
});
