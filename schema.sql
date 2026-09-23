-- =========================================================================
-- ESQUEMA DE BASE DE DATOS PARA SUPABASE
-- Proyecto: Cuestionario de Conocimientos, Actitudes y Prácticas sobre Sífilis
-- Cuartel "Abelardo Mérida"
-- =========================================================================

-- 1. Crear tabla principal para almacenar todas las respuestas
CREATE TABLE IF NOT EXISTS respuestas_sifilis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    
    -- Sección A: Datos sociodemográficos
    nombre_participante TEXT,
    edad INTEGER,
    estado_origen TEXT,
    sexo TEXT,
    sexo_otro TEXT,
    estado_civil TEXT,
    estado_civil_otro TEXT,
    grado_academico TEXT,
    unidad_dependencia TEXT,
    tiempo_servicio_valor NUMERIC,
    tiempo_servicio_unidad TEXT,
    
    -- Sección B: Conocimientos sobre Sífilis
    b1_escuchado_sifilis TEXT,
    b1_donde_escucho TEXT,
    b2_que_es_sifilis TEXT,
    b3_transmision_opciones JSONB, -- Array de opciones seleccionadas
    b4_transmite_solo_anal_vaginal TEXT,
    b5_causada_por TEXT,
    b6_nombre_microorganismo TEXT,
    b6_como_se_llama TEXT,
    b7_sintomas_sifilis JSONB, -- Array de síntomas seleccionados
    b8_tratamiento_sifilis JSONB, -- Array de tratamientos marcados
    b9_factores_riesgo JSONB, -- Array de factores marcados
    b10_contagio_its_general JSONB, -- Array de vías de contagio
    b11_complicaciones_sifilis JSONB, -- Array de complicaciones
    b12_pildoras_anticonceptivas TEXT,
    b13_uso_condon_efectividad TEXT,
    b14_probabilidad_sin_condon TEXT,
    b15_simple_vista TEXT,
    b16_numero_parejas_riesgo TEXT,
    b17_diagnostico_sifilis TEXT,
    b18_volver_relaciones TEXT,
    b19_vih_mas_complicada TEXT,
    b20_conducta_sospecha TEXT,
    b21_tiempo_infectante TEXT,
    b22_con_tratamiento TEXT,
    b22_sin_tratamiento TEXT,
    b22_desconozco BOOLEAN DEFAULT FALSE,
    
    -- Sección C: Actitudes (Escala Likert 1-5)
    c1_preocuparia_sifilis INTEGER,
    c2_enfermedad_vergonzosa INTEGER,
    c3_responsabilidad_institucion_pruebas INTEGER,
    c4_no_decirle_pareja INTEGER,
    c5_confia_servicio_medico_militar INTEGER,
    c6_preservativos_eficaz INTEGER,
    c7_atencion_medica_inmediata INTEGER,
    
    -- Sección D: Prácticas
    d1_edad_primera_relacion INTEGER,
    d2_numero_parejas_ultimos_meses INTEGER,
    d3_pareja_sexual_es TEXT,
    d4_parejas_ocasionales_12m TEXT,
    d5_frecuencia_uso_preservativo_3m TEXT,
    d6_prueba_sifilis_12m TEXT,
    d7_motivo_sin_preservativo TEXT,
    d7_motivo_otro TEXT,
    d8_recibido_tratamiento_sifilis TEXT,
    d9_habla_pareja_preservativos TEXT,
    d10_asistido_conversatorios_its TEXT,
    d11_conoce_donde_pruebas_rapidas TEXT,
    
    -- Metadata adicional
    origen_dispositivo TEXT DEFAULT 'Web'
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE respuestas_sifilis ENABLE ROW LEVEL SECURITY;

-- 3. Crear Política para permitir inserciones públicas (Anon)
CREATE POLICY "Permitir inserción pública de respuestas" 
ON respuestas_sifilis 
FOR INSERT 
WITH CHECK (true);

-- 4. Crear Política para permitir lectura pública (o mediante Service Key)
CREATE POLICY "Permitir lectura de respuestas" 
ON respuestas_sifilis 
FOR SELECT 
USING (true);

-- 5. Crear Política para permitir eliminación de respuestas
CREATE POLICY "Permitir eliminacion de respuestas" 
ON respuestas_sifilis 
FOR DELETE 
USING (true);
