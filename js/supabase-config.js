/**
 * Módulo de Configuración y Conexión a Supabase
 * Maneja el almacenamiento remoto en Supabase y el respaldo dinámico local (localStorage).
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
        
        // Inicializar datos demo si no existen registros locales
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

    async saveResponse(data) {
        const responseRecord = {
            id: 'resp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            fecha_registro: new Date().toISOString(),
            ...data
        };

        let supabaseSuccess = false;

        // Intentar guardar en Supabase si está configurado
        if (this.isConfigured && this.supabaseClient) {
            try {
                const { data: dbData, error } = await this.supabaseClient
                    .from('respuestas_sifilis')
                    .insert([data]);

                if (error) {
                    console.warn("Supabase insert warning, fall-back to local:", error);
                } else {
                    supabaseSuccess = true;
                }
            } catch (err) {
                console.error("Error al conectar con Supabase:", err);
            }
        }

        // Siempre mantener copia en localStorage para disponibilidad sin conexión / demo
        const localData = this.getLocalResponses();
        localData.unshift(responseRecord);
        localStorage.setItem(LOCAL_RESPONSES_KEY, JSON.stringify(localData));

        return {
            success: true,
            syncedWithSupabase: supabaseSuccess,
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

    async clearAllResponses() {
        if (this.isConfigured && this.supabaseClient) {
            try {
                await this.supabaseClient
                    .from('respuestas_sifilis')
                    .delete()
                    .neq('id', '00000000-0000-0000-0000-000000000000');
            } catch (err) {
                console.error("Error al limpiar en Supabase:", err);
            }
        }
        localStorage.setItem(LOCAL_RESPONSES_KEY, JSON.stringify([]));
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
                    nombre_participante: "Pedro José Gómez",
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
                },
                {
                    id: "mock_2",
                    fecha_registro: new Date(Date.now() - 3600000 * 12).toISOString(),
                    nombre_participante: "Carlos Eduardo Silva",
                    edad: 19,
                    estado_origen: "Carabobo",
                    sexo: "Masculino",
                    sexo_otro: "",
                    estado_civil: "Soltero",
                    estado_civil_otro: "",
                    grado_academico: "Secundaria",
                    unidad_dependencia: "Batería de Artillería",
                    tiempo_servicio_valor: 8,
                    tiempo_servicio_unidad: "Meses",
                    b1_escuchado_sifilis: "SI",
                    b1_donde_escucho: "Redes sociales e internet",
                    b2_que_es_sifilis: "Enfermedad de transmisión sexual grave",
                    b3_transmision_opciones: ["Contacto directo llaga/sexo"],
                    b4_transmite_solo_anal_vaginal: "Solo por sexo",
                    b5_causada_por: "Bacteria",
                    b6_nombre_microorganismo: "NO",
                    b6_como_se_llama: "",
                    b7_sintomas_sifilis: ["Llaga/úlcera indolora", "Fiebre"],
                    b8_tratamiento_sifilis: ["Penicilina / Antibióticos inyectables"],
                    b9_factores_riesgo: ["Relaciones sin condón correcto"],
                    b10_contagio_its_general: ["Contacto sexual con infectados"],
                    b11_complicaciones_sifilis: ["Desconozco complicaciones"],
                    b12_pildoras_anticonceptivas: "No protegen contra ITS",
                    b13_uso_condon_efectividad: "Reduce riesgo pero no elimina por completo",
                    b14_probabilidad_sin_condon: "Aumenta drásticamente",
                    b15_simple_vista: "Desconozco",
                    b16_numero_parejas_riesgo: "Aumenta significativamente",
                    b17_diagnostico_sifilis: "Pruebas laboratorio (VDRL) o líquido de llaga",
                    b18_volver_relaciones: "Tiene cura, puede reanudar vida sexual",
                    b19_vih_mas_complicada: "SI",
                    b20_conducta_sospecha: "Usaría condón pensando 100% seguro",
                    b21_tiempo_infectante: "Desconozco",
                    b22_con_tratamiento: "Leve",
                    b22_sin_tratamiento: "Grave",
                    b22_desconozco: false,
                    c1_preocuparia_sifilis: 4,
                    c2_enfermedad_vergonzosa: 3,
                    c3_responsabilidad_institucion_pruebas: 4,
                    c4_no_decirle_pareja: 2,
                    c5_confia_servicio_medico_militar: 4,
                    c6_preservativos_eficaz: 4,
                    c7_atencion_medica_inmediata: 4,
                    d1_edad_primera_relacion: 17,
                    d2_numero_parejas_ultimos_meses: 1,
                    d3_pareja_sexual_es: "Mujer",
                    d4_parejas_ocasionales_12m: "NO",
                    d5_frecuencia_uso_preservativo_3m: "A menudo",
                    d6_prueba_sifilis_12m: "NO",
                    d7_motivo_sin_preservativo: "Confianza",
                    d7_motivo_otro: "",
                    d8_recibido_tratamiento_sifilis: "NO",
                    d9_habla_pareja_preservativos: "SI",
                    d10_asistido_conversatorios_its: "NO",
                    d11_conoce_donde_pruebas_rapidas: "SI"
                },
                {
                    id: "mock_3",
                    fecha_registro: new Date().toISOString(),
                    nombre_participante: "Miguel Ángel López",
                    edad: 25,
                    estado_origen: "Miranda",
                    sexo: "Masculino",
                    sexo_otro: "",
                    estado_civil: "Unión libre",
                    estado_civil_otro: "",
                    grado_academico: "Técnica",
                    unidad_dependencia: "Compañía de Mantenimiento",
                    tiempo_servicio_valor: 3,
                    tiempo_servicio_unidad: "Años",
                    b1_escuchado_sifilis: "SI",
                    b1_donde_escucho: "Liceo y formación militar",
                    b2_que_es_sifilis: "Infección bacteriana contagiada por relaciones sin protección.",
                    b3_transmision_opciones: ["Contacto directo llaga/sexo", "Madre a hijo (gestación/parto)"],
                    b4_transmite_solo_anal_vaginal: "No, también oral.",
                    b5_causada_por: "Bacteria",
                    b6_nombre_microorganismo: "SI",
                    b6_como_se_llama: "Treponema",
                    b7_sintomas_sifilis: ["Llaga/úlcera indolora", "Sarpullido palmas/plantas", "Ganglios inflamados", "Fiebre"],
                    b8_tratamiento_sifilis: ["Penicilina / Antibióticos inyectables"],
                    b9_factores_riesgo: ["Relaciones sin condón correcto", "Parejas múltiples/casuales", "Consumo de alcohol/sustancias"],
                    b10_contagio_its_general: ["Contacto sexual con infectados"],
                    b11_complicaciones_sifilis: ["Problemas cardiovasculares", "Neurosífilis / demencia / parálisis", "Ceguera / sordera / neuropatía"],
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
                    c2_enfermedad_vergonzosa: 1,
                    c3_responsabilidad_institucion_pruebas: 5,
                    c4_no_decirle_pareja: 1,
                    c5_confia_servicio_medico_militar: 5,
                    c6_preservativos_eficaz: 5,
                    c7_atencion_medica_inmediata: 5,
                    d1_edad_primera_relacion: 15,
                    d2_numero_parejas_ultimos_meses: 1,
                    d3_pareja_sexual_es: "Mujer",
                    d4_parejas_ocasionales_12m: "NO",
                    d5_frecuencia_uso_preservativo_3m: "Siempre",
                    d6_prueba_sifilis_12m: "SI",
                    d7_motivo_sin_preservativo: "",
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

// Instancia global
window.supabaseService = new SupabaseService();
