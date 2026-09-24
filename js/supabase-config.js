/**
 * Módulo de Configuración y Conexión a Supabase con Diagnóstico y Validación de Tabla
 */

const SUPABASE_STORAGE_KEY = 'sifilis_supabase_credentials';
const LOCAL_RESPONSES_KEY = 'sifilis_respuestas_local';

class SupabaseService {
    constructor() {
        this.supabaseClient = null;
        this.isConfigured = false;
        this.init();
    }

    init() {
        const stored = localStorage.getItem(SUPABASE_STORAGE_KEY);
        if (stored) {
            try {
                const { url, key } = JSON.parse(stored);
                if (url && key && window.supabase) {
                    this.supabaseClient = window.supabase.createClient(url, key);
                    this.isConfigured = true;
                }
            } catch (e) {
                console.error("Error al inicializar cliente de Supabase:", e);
            }
        }
        this.ensureInitialMockData();
    }

    saveCredentials(url, key) {
        if (!url || !key) return false;
        try {
            if (window.supabase) {
                this.supabaseClient = window.supabase.createClient(url, key);
                this.isConfigured = true;
                localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify({ url, key }));
                return true;
            }
        } catch (e) {
            console.error("Error guardando credenciales Supabase:", e);
            return false;
        }
        return false;
    }

    clearCredentials() {
        localStorage.removeItem(SUPABASE_STORAGE_KEY);
        this.supabaseClient = null;
        this.isConfigured = false;
    }

    getCredentials() {
        const stored = localStorage.getItem(SUPABASE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : { url: '', key: '' };
    }

    /**
     * Prueba de conexión activa a Supabase y validación de la tabla `respuestas_sifilis`
     */
    async testConnection() {
        if (!this.isConfigured || !this.supabaseClient) {
            return {
                ok: false,
                message: "No se han configurado credenciales de Supabase (URL / Key)."
            };
        }

        try {
            // Intenta realizar una consulta select simple
            const { data, error } = await this.supabaseClient
                .from('respuestas_sifilis')
                .select('id')
                .limit(1);

            if (error) {
                if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
                    return {
                        ok: false,
                        message: "Conexión a Supabase exitosa, pero la tabla 'respuestas_sifilis' NO EXISTE. Ejecute el script schema.sql en el SQL Editor de Supabase."
                    };
                }
                return {
                    ok: false,
                    message: `Error de Supabase: [${error.code || 'ERR'}] ${error.message}`
                };
            }

            return {
                ok: true,
                message: "🟢 ¡Conexión exitosa! La tabla 'respuestas_sifilis' está lista para recibir respuestas."
            };
        } catch (err) {
            return {
                ok: false,
                message: `Error al conectar con Supabase: ${err.message}`
            };
        }
    }

    /**
     * Limpia y normaliza el objeto de respuestas para asegurar compatibilidad exacta con los tipos SQL
     */
    normalizePayload(data) {
        const payload = {};

        // Booleanos y firma
        payload.consentimiento_aceptado = !!data.consentimiento_aceptado;
        payload.firma_consentimiento = data.firma_consentimiento || null;

        // Numéricos Sección A
        if (data.edad !== undefined && data.edad !== '') payload.edad = parseInt(data.edad, 10);
        if (data.estado_origen) payload.estado_origen = data.estado_origen;
        if (data.sexo) payload.sexo = data.sexo;
        if (data.sexo_otro) payload.sexo_otro = data.sexo_otro;
        if (data.estado_civil) payload.estado_civil = data.estado_civil;
        if (data.estado_civil_otro) payload.estado_civil_otro = data.estado_civil_otro;
        if (data.grado_academico) payload.grado_academico = data.grado_academico;
        if (data.unidad_dependencia) payload.unidad_dependencia = data.unidad_dependencia;
        if (data.tiempo_servicio_valor !== undefined && data.tiempo_servicio_valor !== '') payload.tiempo_servicio_valor = parseFloat(data.tiempo_servicio_valor);
        if (data.tiempo_servicio_unidad) payload.tiempo_servicio_unidad = data.tiempo_servicio_unidad;

        // Sección B: Conocimientos
        if (data.b1_escuchado_sifilis) payload.b1_escuchado_sifilis = data.b1_escuchado_sifilis;
        if (data.b1_donde_escucho) payload.b1_donde_escucho = data.b1_donde_escucho;
        if (data.b2_que_es_sifilis) payload.b2_que_es_sifilis = data.b2_que_es_sifilis;
        if (data.b3_transmision_opciones) payload.b3_transmision_opciones = Array.isArray(data.b3_transmision_opciones) ? data.b3_transmision_opciones : [data.b3_transmision_opciones];
        if (data.b4_transmite_solo_anal_vaginal) payload.b4_transmite_solo_anal_vaginal = data.b4_transmite_solo_anal_vaginal;
        if (data.b5_causada_por) payload.b5_causada_por = data.b5_causada_por;
        if (data.b6_nombre_microorganismo) payload.b6_nombre_microorganismo = data.b6_nombre_microorganismo;
        if (data.b6_como_se_llama) payload.b6_como_se_llama = data.b6_como_se_llama;
        if (data.b7_sintomas_sifilis) payload.b7_sintomas_sifilis = Array.isArray(data.b7_sintomas_sifilis) ? data.b7_sintomas_sifilis : [data.b7_sintomas_sifilis];
        if (data.b8_tratamiento_sifilis) payload.b8_tratamiento_sifilis = Array.isArray(data.b8_tratamiento_sifilis) ? data.b8_tratamiento_sifilis : [data.b8_tratamiento_sifilis];
        if (data.b9_factores_riesgo) payload.b9_factores_riesgo = Array.isArray(data.b9_factores_riesgo) ? data.b9_factores_riesgo : [data.b9_factores_riesgo];
        if (data.b10_contagio_its_general) payload.b10_contagio_its_general = Array.isArray(data.b10_contagio_its_general) ? data.b10_contagio_its_general : [data.b10_contagio_its_general];
        if (data.b11_complicaciones_sifilis) payload.b11_complicaciones_sifilis = Array.isArray(data.b11_complicaciones_sifilis) ? data.b11_complicaciones_sifilis : [data.b11_complicaciones_sifilis];
        if (data.b12_pildoras_anticonceptivas) payload.b12_pildoras_anticonceptivas = data.b12_pildoras_anticonceptivas;
        if (data.b13_uso_condon_efectividad) payload.b13_uso_condon_efectividad = data.b13_uso_condon_efectividad;
        if (data.b14_probabilidad_sin_condon) payload.b14_probabilidad_sin_condon = data.b14_probabilidad_sin_condon;
        if (data.b15_simple_vista) payload.b15_simple_vista = data.b15_simple_vista;
        if (data.b16_numero_parejas_riesgo) payload.b16_numero_parejas_riesgo = data.b16_numero_parejas_riesgo;
        if (data.b17_diagnostico_sifilis) payload.b17_diagnostico_sifilis = data.b17_diagnostico_sifilis;
        if (data.b18_volver_relaciones) payload.b18_volver_relaciones = data.b18_volver_relaciones;
        if (data.b19_vih_mas_complicada) payload.b19_vih_mas_complicada = data.b19_vih_mas_complicada;
        if (data.b20_conducta_sospecha) payload.b20_conducta_sospecha = data.b20_conducta_sospecha;
        if (data.b21_tiempo_infectante) payload.b21_tiempo_infectante = data.b21_tiempo_infectante;
        if (data.b22_con_tratamiento) payload.b22_con_tratamiento = data.b22_con_tratamiento;
        if (data.b22_sin_tratamiento) payload.b22_sin_tratamiento = data.b22_sin_tratamiento;
        payload.b22_desconozco = !!data.b22_desconozco;

        // Sección C: Actitudes
        for (let i = 1; i <= 7; i++) {
            const key = `c${i}_${['preocuparia_sifilis', 'enfermedad_vergonzosa', 'responsabilidad_institucion_pruebas', 'no_decirle_pareja', 'confia_servicio_medico_militar', 'preservativos_eficaz', 'atencion_medica_inmediata'][i-1]}`;
            if (data[key] !== undefined && data[key] !== '') {
                payload[key] = parseInt(data[key], 10);
            }
        }

        // Sección D: Prácticas
        if (data.d1_edad_primera_relacion !== undefined && data.d1_edad_primera_relacion !== '') payload.d1_edad_primera_relacion = parseInt(data.d1_edad_primera_relacion, 10);
        if (data.d2_numero_parejas_ultimos_meses !== undefined && data.d2_numero_parejas_ultimos_meses !== '') payload.d2_numero_parejas_ultimos_meses = parseInt(data.d2_numero_parejas_ultimos_meses, 10);
        if (data.d3_pareja_sexual_es) payload.d3_pareja_sexual_es = data.d3_pareja_sexual_es;
        if (data.d4_parejas_ocasionales_12m) payload.d4_parejas_ocasionales_12m = data.d4_parejas_ocasionales_12m;
        if (data.d5_frecuencia_uso_preservativo_3m) payload.d5_frecuencia_uso_preservativo_3m = data.d5_frecuencia_uso_preservativo_3m;
        if (data.d6_prueba_sifilis_12m) payload.d6_prueba_sifilis_12m = data.d6_prueba_sifilis_12m;
        if (data.d7_motivo_sin_preservativo) payload.d7_motivo_sin_preservativo = data.d7_motivo_sin_preservativo;
        if (data.d7_motivo_otro) payload.d7_motivo_otro = data.d7_motivo_otro;
        if (data.d8_recibido_tratamiento_sifilis) payload.d8_recibido_tratamiento_sifilis = data.d8_recibido_tratamiento_sifilis;
        if (data.d9_habla_pareja_preservativos) payload.d9_habla_pareja_preservativos = data.d9_habla_pareja_preservativos;
        if (data.d10_asistido_conversatorios_its) payload.d10_asistido_conversatorios_its = data.d10_asistido_conversatorios_its;
        if (data.d11_conoce_donde_pruebas_rapidas) payload.d11_conoce_donde_pruebas_rapidas = data.d11_conoce_donde_pruebas_rapidas;

        return payload;
    }

    async saveResponse(data) {
        const normalizedPayload = this.normalizePayload(data);

        const responseRecord = {
            id: 'resp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            fecha_registro: new Date().toISOString(),
            ...normalizedPayload
        };

        let supabaseSuccess = false;
        let supabaseErrorMessage = null;

        // Intentar guardar en Supabase si está configurado
        if (this.isConfigured && this.supabaseClient) {
            try {
                const { error } = await this.supabaseClient
                    .from('respuestas_sifilis')
                    .insert([normalizedPayload]);

                if (error) {
                    console.error("Error al guardar en Supabase:", error);
                    supabaseErrorMessage = `[${error.code || 'ERR'}] ${error.message}`;
                } else {
                    supabaseSuccess = true;
                }
            } catch (err) {
                console.error("Excepción al conectar con Supabase:", err);
                supabaseErrorMessage = err.message;
            }
        }

        // Guardar siempre respaldo en localStorage
        const localData = this.getLocalResponses();
        localData.unshift(responseRecord);
        localStorage.setItem(LOCAL_RESPONSES_KEY, JSON.stringify(localData));

        return {
            success: true,
            syncedWithSupabase: supabaseSuccess,
            supabaseError: supabaseErrorMessage,
            record: responseRecord
        };
    }

    async getAllResponses() {
        if (this.isConfigured && this.supabaseClient) {
            try {
                const { data, error } = await this.supabaseClient
                    .from('respuestas_sifilis')
                    .select('*')
                    .order('fecha_registro', { ascending: false });

                if (!error && data && data.length > 0) {
                    return data;
                }
            } catch (err) {
                console.warn("No se pudieron consultar respuestas de Supabase, usando locales:", err);
            }
        }
        return this.getLocalResponses();
    }

    async deleteResponse(id) {
        if (this.isConfigured && this.supabaseClient) {
            try {
                await this.supabaseClient
                    .from('respuestas_sifilis')
                    .delete()
                    .eq('id', id);
            } catch (err) {
                console.error("Error al borrar en Supabase:", err);
            }
        }

        let localData = this.getLocalResponses();
        localData = localData.filter(r => r.id !== id);
        localStorage.setItem(LOCAL_RESPONSES_KEY, JSON.stringify(localData));
        return true;
    }

    getLocalResponses() {
        const stored = localStorage.getItem(LOCAL_RESPONSES_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    ensureInitialMockData() {
        const current = this.getLocalResponses();
        if (current.length === 0) {
            const mockData = [
                {
                    id: "mock_1",
                    fecha_registro: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
                    consentimiento_aceptado: true,
                    edad: 22,
                    estado_origen: "Aragua",
                    sexo: "Masculino",
                    sexo_otro: "",
                    estado_civil: "Soltero",
                    estado_civil_otro: "",
                    grado_academico: "Secundaria",
                    unidad_dependencia: "Compañía de Infantería A",
                    tiempo_servicio_valor: 14,
                    tiempo_servicio_unidad: "Meses",
                    b1_escuchado_sifilis: "SI",
                    b1_donde_escucho: "Charla médica en el cuartel",
                    b2_que_es_sifilis: "Una infección de transmisión sexual producida por bacterias.",
                    b3_transmision_opciones: ["Contacto directo llaga/sexo", "Madre a hijo (gestación/parto)"],
                    b4_transmite_solo_anal_vaginal: "No, también se transmite por sexo oral y madre a hijo.",
                    b5_causada_por: "Bacteria",
                    b6_nombre_microorganismo: "SI",
                    b6_como_se_llama: "Treponema pallidum",
                    b7_sintomas_sifilis: ["Llaga/úlcera indolora", "Sarpullido palmas/plantas", "Ganglios inflamados"],
                    b8_tratamiento_sifilis: ["Penicilina / Antibióticos inyectables"],
                    b9_factores_riesgo: ["Relaciones sin condón correcto", "Parejas múltiples/casuales"],
                    b10_contagio_its_general: ["Contacto sexual con infectados"],
                    b11_complicaciones_sifilis: ["Problemas cardiovasculares", "Neurosífilis / demencia / parálisis"],
                    b12_pildoras_anticonceptivas: "Previenen embarazo pero NO ITS",
                    b13_uso_condon_efectividad: "Reduce riesgo pero no elimina por completo",
                    b14_probabilidad_sin_condon: "Aumenta drásticamente",
                    b15_simple_vista: "No, pueden asintomáticos o llagas ocultas",
                    b16_numero_parejas_riesgo: "Aumenta significativamente",
                    b17_diagnostico_sifilis: "Pruebas laboratorio (VDRL) o líquido de llaga",
                    b18_volver_relaciones: "Tiene cura, puede reanudar vida sexual",
                    b19_vih_mas_complicada: "SI",
                    b20_conducta_sospecha: "Evitaría hasta confirmación de cura",
                    b21_tiempo_infectante: "Primer año de infección",
                    b22_con_tratamiento: "Leve",
                    b22_sin_tratamiento: "Grave",
                    b22_desconozco: false,
                    c1_preocuparia_sifilis: 5,
                    c2_enfermedad_vergonzosa: 2,
                    c3_responsabilidad_institucion_pruebas: 5,
                    c4_no_decirle_pareja: 1,
                    c5_confia_servicio_medico_militar: 4,
                    c6_preservativos_eficaz: 5,
                    c7_atencion_medica_inmediata: 5,
                    d1_edad_primera_relacion: 16,
                    d2_numero_parejas_ultimos_meses: 2,
                    d3_pareja_sexual_es: "Mujer",
                    d4_parejas_ocasionales_12m: "SI",
                    d5_frecuencia_uso_preservativo_3m: "Siempre",
                    d6_prueba_sifilis_12m: "SI",
                    d7_motivo_sin_preservativo: "Falta de preservativo",
                    d7_motivo_otro: "",
                    d8_recibido_tratamiento_sifilis: "NO",
                    d9_habla_pareja_preservativos: "SI",
                    d10_asistido_conversatorios_its: "SI",
                    d11_conoce_donde_pruebas_rapidas: "SI"
                }
            ];
            localStorage.setItem(LOCAL_RESPONSES_KEY, JSON.stringify(mockData));
        }
    }
}

window.supabaseService = new SupabaseService();
