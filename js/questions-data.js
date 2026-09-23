/**
 * Estructura de Datos Oficial del Cuestionario (Anónimo)
 * "Conocimientos, actitudes y prácticas sobre la sífilis en soldados del Cuartel Abelardo Mérida"
 */

const SURVEY_DATA = {
    title: "Conocimientos, actitudes y prácticas sobre la sífilis en soldados del Cuartel Abelardo Mérida",
    estimatedTime: "20 min (15 min participante)",
    modality: "Entrevistador / Autoadministrado",
    resumen: "Este instrumento tiene la finalidad de evaluar los conocimientos, actitudes y prácticas sobre la sífilis en soldados del cuartel \"Abelardo Mérida\". La información proporcionada será totalmente anónima y confidencial. La participación es totalmente voluntaria y se recolecta con fines académicos.",
    consentText: "Estimado(a) participante: le invitamos a participar en el estudio titulado: CONOCIMIENTO, ACTITUDES Y PRÁCTICAS SOBRE LA SÍFILIS EN SOLDADOS DEL CUARTEL \"ABELARDO MÉRIDA\". La información proporcionada por usted será totalmente anónima y confidencial. La participación es totalmente voluntaria y puede interrumpirla en cualquier momento que usted considere. La información que se recoja será usada sólo con fines académicos. El cuestionario toma aproximadamente: 15 min.",
    sections: [
        {
            id: "sec_consent",
            code: "Consentimiento",
            title: "Consentimiento Informado",
            description: "Lea atenta y completamente la información antes de continuar.",
            isConsentStep: true
        },
        {
            id: "sec_a",
            code: "A",
            title: "Datos Sociodemográficos",
            description: "Información general del participante para fines estadísticos (Anónimo).",
            questions: [
                {
                    id: "a1_edad",
                    number: "1",
                    label: "Edad (años)",
                    type: "number",
                    placeholder: "Ej: 21",
                    required: true,
                    min: 15,
                    max: 80
                },
                {
                    id: "a1_estado_origen",
                    number: "1b",
                    label: "Estado de origen",
                    type: "text",
                    placeholder: "Ej: Aragua, Carabobo, Miranda...",
                    required: true
                },
                {
                    id: "a2_sexo",
                    number: "2",
                    label: "Sexo",
                    type: "radio",
                    options: [
                        { label: "Masculino", value: "Masculino" },
                        { label: "Femenino", value: "Femenino" },
                        { label: "Otro", value: "Otro", hasSpecify: true, specifyId: "a2_sexo_otro" }
                    ],
                    required: true
                },
                {
                    id: "a3_estado_civil",
                    number: "3",
                    label: "Estado civil",
                    type: "radio",
                    options: [
                        { label: "Soltero", value: "Soltero" },
                        { label: "Casado", value: "Casado" },
                        { label: "Unión libre", value: "Unión libre" },
                        { label: "Otro", value: "Otro", hasSpecify: true, specifyId: "a3_estado_civil_otro" }
                    ],
                    required: true
                },
                {
                    id: "a4_grado_academico",
                    number: "4",
                    label: "Grado académico",
                    type: "radio",
                    options: [
                        { label: "Primaria", value: "Primaria" },
                        { label: "Secundaria", value: "Secundaria" },
                        { label: "Técnica", value: "Técnica" },
                        { label: "Universitario", value: "Universitario" }
                    ],
                    required: true
                },
                {
                    id: "a5_unidad_dependencia",
                    number: "5",
                    label: "Unidad / Dependencia militar",
                    type: "text",
                    placeholder: "Ingrese su unidad o dependencia",
                    required: true
                },
                {
                    id: "a6_tiempo_servicio_valor",
                    number: "6",
                    label: "Tiempo de servicio en las F.A.B",
                    type: "number_unit",
                    placeholder: "Ej: 18",
                    unitId: "a6_tiempo_servicio_unidad",
                    unitOptions: [
                        { label: "Meses", value: "Meses" },
                        { label: "Años", value: "Años" }
                    ],
                    required: true
                }
            ]
        },
        {
            id: "sec_b",
            code: "B",
            title: "Conocimientos sobre Sífilis",
            description: "Responda a las siguientes interrogantes marcando las opciones que considere correctas.",
            questions: [
                {
                    id: "b1_escuchado_sifilis",
                    number: "1",
                    label: "¿Ha escuchado usted anteriormente sobre la sífilis?",
                    type: "radio_with_followup",
                    options: [
                        { label: "SÍ", value: "SI" },
                        { label: "NO", value: "NO" }
                    ],
                    followupIf: "SI",
                    followupId: "b1_donde_escucho",
                    followupLabel: "¿En dónde?",
                    followupPlaceholder: "Ej: Escuela militar, charlas, internet, TV, familiares...",
                    required: true
                },
                {
                    id: "b2_que_es_sifilis",
                    number: "2",
                    label: "¿Qué es la sífilis?",
                    type: "textarea",
                    placeholder: "Escriba en sus palabras qué entiende por sífilis...",
                    required: true
                },
                {
                    id: "b3_transmision_opciones",
                    number: "3",
                    label: "¿Sabe usted cómo se transmite la sífilis? (Marque las opciones que considere correctas)",
                    type: "checkbox_group",
                    options: [
                        { label: "Por contacto directo con una llaga (chancro) o sarpullido de sífilis durante el sexo vaginal, anal u oral", value: "Contacto directo llaga/sexo" },
                        { label: "De una madre embarazada a su hijo durante la gestación o el parto", value: "Madre a hijo (gestación/parto)" },
                        { label: "A través de la saliva al compartir vasos, cubiertos, cigarrillos con un compañero", value: "Saliva / compartir vasos" },
                        { label: "Al usar los mismos baños o duchas de la base militar", value: "Baños o duchas comunes" },
                        { label: "Por contacto casual del día a día, como dar la mano, abrazar, compartir camas", value: "Contacto casual cotidiano" }
                    ],
                    required: true
                },
                {
                    id: "b4_transmite_solo_anal_vaginal",
                    number: "4",
                    label: "¿La sífilis se transmite solo por sexo anal y/o vaginal?",
                    type: "text",
                    placeholder: "Responda o explique brevemente...",
                    required: true
                },
                {
                    id: "b5_causada_por",
                    number: "5",
                    label: "La sífilis es causada por:",
                    type: "radio",
                    options: [
                        { label: "Bacteria", value: "Bacteria" },
                        { label: "Hongo", value: "Hongo" },
                        { label: "Virus", value: "Virus" }
                    ],
                    required: true
                },
                {
                    id: "b6_nombre_microorganismo",
                    number: "6",
                    label: "¿Sabe cómo se llama el microorganismo que causa la sífilis?",
                    type: "radio_with_followup",
                    options: [
                        { label: "SÍ", value: "SI" },
                        { label: "NO", value: "NO" }
                    ],
                    followupIf: "SI",
                    followupId: "b6_como_se_llama",
                    followupLabel: "¿Cómo se llama?",
                    followupPlaceholder: "Ej: Treponema pallidum...",
                    required: true
                },
                {
                    id: "b7_sintomas_sifilis",
                    number: "7",
                    label: "A continuación marque cuál o cuáles son los síntomas de la sífilis:",
                    type: "checkbox_group",
                    options: [
                        { label: "Llaga o úlcera única e indolora en la zona genital, rectal o bucal", value: "Llaga/úlcera indolora" },
                        { label: "Manchas rojas o sarpullido en el cuerpo, especialmente palma de las manos o planta de los pies (que no se deban al roce de las botas)", value: "Sarpullido palmas/plantas" },
                        { label: "Fiebre", value: "Fiebre" },
                        { label: "Dolor de garganta", value: "Dolor de garganta" },
                        { label: "Inflamación de los ganglios (en cuello o ingle) sin tener gripe", value: "Ganglios inflamados" },
                        { label: "No sabe", value: "No sabe" },
                        { label: "No quiere responder", value: "No quiere responder" }
                    ],
                    required: true
                },
                {
                    id: "b8_tratamiento_sifilis",
                    number: "8",
                    label: "¿Conoce usted de tratamiento para la sífilis?",
                    type: "checkbox_group",
                    options: [
                        { label: "Antibióticos inyectables, como la penicilina", value: "Penicilina / Antibióticos inyectables" },
                        { label: "Desconozco cuál es el tratamiento adecuado", value: "Desconozco tratamiento" },
                        { label: "Remedios caseros, pomadas, se cura solo", value: "Remedios caseros / pomadas" }
                    ],
                    required: true
                },
                {
                    id: "b9_factores_riesgo",
                    number: "9",
                    label: "¿Sabe usted cuáles son los factores que predisponen o favorecen el contagio de sífilis?",
                    type: "checkbox_group",
                    options: [
                        { label: "Tener relaciones sexuales (vaginales, anales u orales) sin usar preservativo/condón de forma correcta", value: "Relaciones sin condón correcto" },
                        { label: "Mantener relaciones sexuales con parejas múltiples o casuales (especialmente durante permisos o misiones)", value: "Parejas múltiples/casuales" },
                        { label: "Consumir licor o sustancias que disminuyan el autocuidado antes de una relación sexual", value: "Consumo de alcohol/sustancias" },
                        { label: "Tener relaciones con alguien que tiene heridas, llagas o sarpullidos visibles en piel o genitales", value: "Relación con persona con llagas" }
                    ],
                    required: true
                },
                {
                    id: "b10_contagio_its_general",
                    number: "10",
                    label: "¿Cómo se puede contagiar una infección de transmisión sexual (ITS)?",
                    type: "checkbox_group",
                    options: [
                        { label: "Al compartir el baño, las duchas comunes de la base", value: "Compartir baños comunes" },
                        { label: "Al compartir cubiertos, vasos, el termo con una persona que tenga una ITS", value: "Compartir vasos/termo" },
                        { label: "Por contacto casual del día a día, como saludar, abrazar, compartir camas", value: "Contacto casual cotidiano" },
                        { label: "Contacto con personas infectadas", value: "Contacto sexual con infectados" }
                    ],
                    required: true
                },
                {
                    id: "b11_complicaciones_sifilis",
                    number: "11",
                    label: "¿Sabe cuáles son las complicaciones de la sífilis si no es tratada a tiempo?",
                    type: "checkbox_group",
                    options: [
                        { label: "Puede generar problemas cardiovasculares", value: "Problemas cardiovasculares" },
                        { label: "Puede afectar el sistema nervioso provocando demencia, parálisis o pérdida de la coordinación motora (neurosífilis)", value: "Neurosífilis / demencia / parálisis" },
                        { label: "Puede causar ceguera, sordera o pérdida de la sensibilidad en las extremidades", value: "Ceguera / sordera / neuropatía" },
                        { label: "No causa complicación grave; la enfermedad desaparece sola con el tiempo sin dejar secuelas", value: "No causa complicación grave" },
                        { label: "Desconozco cuáles son las complicaciones que puede producir la sífilis no tratada", value: "Desconozco complicaciones" }
                    ],
                    required: true
                },
                {
                    id: "b12_pildoras_anticonceptivas",
                    number: "12",
                    label: "¿Cuál o cuáles de las siguientes afirmaciones sobre el uso de píldoras anticonceptivas y las ITS son ciertas?",
                    type: "radio",
                    options: [
                        { label: "Las píldoras anticonceptivas previenen el embarazo y también protegen contra el contagio de sífilis y otras ITS", value: "Protegen embarazo e ITS" },
                        { label: "Las píldoras anticonceptivas previenen el embarazo, pero NO protegen contra el contagio de sífilis y otras ITS", value: "Previenen embarazo pero NO ITS" },
                        { label: "Las píldoras anticonceptivas solo protegen contra las ITS si se toman inmediatamente antes de la relación sexual", value: "Protegen si se toman antes" },
                        { label: "Las píldoras anticonceptivas no protegen contra las ITS", value: "No protegen contra ITS" },
                        { label: "Desconozco si las píldoras anticonceptivas ofrecen protección contra las ITS", value: "Desconozco" }
                    ],
                    required: true
                },
                {
                    id: "b13_uso_condon_efectividad",
                    number: "13",
                    label: "¿Cuál o cuáles de las siguientes afirmaciones sobre el uso correcto del preservativo (condón) y la sífilis son correctas?",
                    type: "radio",
                    options: [
                        { label: "El uso correcto del condón elimina por completo (al 100%) el riesgo de contraer sífilis en cualquier tipo de relación sexual", value: "Elimina 100% el riesgo" },
                        { label: "El uso correcto del condón reduce enormemente el riesgo, pero no lo elimina por completo, ya que el microorganismo se transmite por contacto con las llagas en zonas no cubiertas", value: "Reduce riesgo pero no elimina por completo" },
                        { label: "El preservativo protege contra HIV y embarazo, pero no ofrece protección contra la sífilis", value: "Protege HIV pero no sífilis" },
                        { label: "Desconozco si el uso del condón elimina o no el riesgo de contraer esta enfermedad", value: "Desconozco" }
                    ],
                    required: true
                },
                {
                    id: "b14_probabilidad_sin_condon",
                    number: "14",
                    label: "¿Cómo se afecta la probabilidad de contraer sífilis cuando no se usa preservativos?",
                    type: "radio",
                    options: [
                        { label: "La probabilidad de contraer sífilis aumenta drásticamente, ya que la falta del condón permite el contacto directo con fluidos o lesiones", value: "Aumenta drásticamente" },
                        { label: "La probabilidad se mantiene igual, ya que el contagio depende de la suerte y de la higiene personal", value: "Se mantiene igual" },
                        { label: "La probabilidad no cambia, porque la sífilis solo se transmite si hay grandes lesiones en los genitales", value: "No cambia" },
                        { label: "Desconozco si no usar preservativos altera o no la probabilidad", value: "Desconozco" }
                    ],
                    required: true
                },
                {
                    id: "b15_simple_vista",
                    number: "15",
                    label: "¿Puede saber a simple vista quién tiene sífilis?",
                    type: "radio",
                    options: [
                        { label: "Sí, una persona con sífilis siempre se ve demacrado, con mala higiene y tiene llagas visibles en la cara", value: "Sí, siempre se ve demacrado con llagas en cara" },
                        { label: "No, muchas personas con sífilis no presentan ningún síntoma visible o sus llagas están ocultas en zonas genitales e internas", value: "No, pueden asintomáticos o llagas ocultas" },
                        { label: "Desconozco si se puede o no identificar a simple vista una persona infectada", value: "Desconozco" }
                    ],
                    required: true
                },
                {
                    id: "b16_numero_parejas_riesgo",
                    number: "16",
                    label: "¿Cómo afecta el riesgo de contraer sífilis al tener mayor número de parejas sexuales?",
                    type: "radio",
                    options: [
                        { label: "Aumenta significativamente, porque la exposición a tener sexo con una persona con enfermedad activa aumenta", value: "Aumenta significativamente" },
                        { label: "El riesgo no aumenta por el número de parejas, la probabilidad de contagio es siempre la misma", value: "No aumenta por número de parejas" },
                        { label: "El riesgo es menor si las parejas pertenecen al mismo entorno conocido", value: "Es menor si es el mismo entorno" },
                        { label: "Desconozco si el número de parejas sexuales aumenta o no el riesgo", value: "Desconozco" }
                    ],
                    required: true
                },
                {
                    id: "b17_diagnostico_sifilis",
                    number: "17",
                    label: "¿Conoce usted la forma de diagnosticar la sífilis?",
                    type: "radio",
                    options: [
                        { label: "Se diagnostica únicamente con el examen físico que hace el médico", value: "Únicamente examen físico" },
                        { label: "Mediante pruebas de laboratorio (VDRL) o analizando el líquido de una llaga", value: "Pruebas laboratorio (VDRL) o líquido de llaga" },
                        { label: "Se diagnostica si la persona presenta fiebre por tres días seguidos", value: "Fiebre por 3 días seguidos" },
                        { label: "Desconozco cómo se hace el diagnóstico de sífilis", value: "Desconozco" }
                    ],
                    required: true
                },
                {
                    id: "b18_volver_relaciones",
                    number: "18",
                    label: "¿Si tiene sífilis, no podrá volver a tener relaciones sexuales?",
                    type: "radio",
                    options: [
                        { label: "No, porque una vez que tienes sífilis quedas portador de por vida y nunca más podrás tener relaciones", value: "Queda portador de por vida" },
                        { label: "Sí, la sífilis tiene cura; una vez que se confirme por análisis de sangre que la infección se eliminó, puede reanudar su vida sexual", value: "Tiene cura, puede reanudar vida sexual" },
                        { label: "Sí, pero solo con personas que también hayan tenido sífilis", value: "Solo con quienes hayan tenido sífilis" },
                        { label: "Desconozco si una persona recuperada de sífilis puede volver a tener una vida sexual activa", value: "Desconozco" }
                    ],
                    required: true
                },
                {
                    id: "b19_vih_mas_complicada",
                    number: "19",
                    label: "¿Las personas con VIH pueden tener sífilis más complicada?",
                    type: "radio",
                    options: [
                        { label: "SÍ", value: "SI" },
                        { label: "NO", value: "NO" }
                    ],
                    required: true
                },
                {
                    id: "b20_conducta_sospecha",
                    number: "20",
                    label: "Si sospecha que una pareja casual o estable tiene sífilis activa, ¿qué decisión tomaría respecto a tener relaciones sexuales?",
                    type: "radio",
                    options: [
                        { label: "Evitaría tener relaciones sexuales hasta que se confirme que ya está curada", value: "Evitaría hasta confirmación de cura" },
                        { label: "Tendría relaciones sexuales usando preservativo porque es 100% seguro y no me voy a contagiar", value: "Usaría condón pensando 100% seguro" },
                        { label: "Tendría relaciones sexuales sin condón, ya que puedo lavarme bien después del acto para no contagiarme", value: "Sin condón y lavarse después" },
                        { label: "Desconozco cuál es la conducta más segura para mí en esta situación", value: "Desconozco" }
                    ],
                    required: true
                },
                {
                    id: "b21_tiempo_infectante",
                    number: "21",
                    label: "¿Sabe usted por cuánto tiempo una persona con sífilis que no recibe tratamiento es infectante?",
                    type: "radio",
                    options: [
                        { label: "Solo durante las tres primeras semanas después del contagio", value: "Primeras 3 semanas" },
                        { label: "Aproximadamente durante el primer año de la infección (etapa primaria y secundaria activas)", value: "Primer año de infección" },
                        { label: "Durante toda la vida (hasta 20 a 30 años después)", value: "Toda la vida (20-30 años)" },
                        { label: "Desconozco cuánto tiempo dura el periodo de contagio", value: "Desconozco" }
                    ],
                    required: true
                },
                {
                    id: "b22_clasificacion_gravedad",
                    number: "22",
                    label: "De acuerdo a la gravedad de las consecuencias para la salud física y mental a largo plazo, ¿cómo se clasifica la sífilis?",
                    type: "gravity_matrix",
                    categories: [
                        { id: "b22_con_tratamiento", label: "Si recibe tratamiento:", options: ["Leve", "Moderada", "Grave"] },
                        { id: "b22_sin_tratamiento", label: "No recibe tratamiento:", options: ["Leve", "Moderada", "Grave"] }
                    ],
                    allowUnknown: true,
                    unknownId: "b22_desconozco",
                    unknownLabel: "Desconozco el nivel de gravedad que puede alcanzar esta enfermedad",
                    required: true
                }
            ]
        },
        {
            id: "sec_c",
            code: "C",
            title: "Actitudes",
            description: "Indique su grado de acuerdo con cada una de las siguientes afirmaciones (Escala del 1 al 5).",
            scaleLegend: [
                { val: 1, label: "Totalmente en desacuerdo" },
                { val: 2, label: "En desacuerdo" },
                { val: 3, label: "Ni me gusta ni me desagrada" },
                { val: 4, label: "De acuerdo" },
                { val: 5, label: "Totalmente de acuerdo" }
            ],
            questions: [
                {
                    id: "c1_preocuparia_sifilis",
                    number: "1",
                    label: "Se preocuparía mucho si tuviera sífilis.",
                    type: "likert",
                    required: true
                },
                {
                    id: "c2_enfermedad_vergonzosa",
                    number: "2",
                    label: "La sífilis es una enfermedad vergonzosa.",
                    type: "likert",
                    required: true
                },
                {
                    id: "c3_responsabilidad_institucion_pruebas",
                    number: "3",
                    label: "Es responsabilidad personal y de la institución hacer pruebas periódicas de infección de transmisión sexual.",
                    type: "likert",
                    required: true
                },
                {
                    id: "c4_no_decirle_pareja",
                    number: "4",
                    label: "Preferiría no decirle a mi pareja si me diagnosticarán sífilis.",
                    type: "likert",
                    required: true
                },
                {
                    id: "c5_confia_servicio_medico_militar",
                    number: "5",
                    label: "Confío en la confidencialidad del servicio médico militar.",
                    type: "likert",
                    required: true
                },
                {
                    id: "c6_preservativos_eficaz",
                    number: "6",
                    label: "Usar preservativos es una forma eficaz de protegerse.",
                    type: "likert",
                    required: true
                },
                {
                    id: "c7_atencion_medica_inmediata",
                    number: "7",
                    label: "Buscaría atención médica inmediatamente si tuviera síntomas.",
                    type: "likert",
                    required: true
                }
            ]
        },
        {
            id: "sec_d",
            code: "D",
            title: "Prácticas",
            description: "Información sobre hábitos, conductas preventivas y antecedentes.",
            questions: [
                {
                    id: "d1_edad_primera_relacion",
                    number: "1",
                    label: "Edad de la primera relación sexual:",
                    type: "number",
                    placeholder: "Ej: 16",
                    min: 10,
                    max: 60,
                    required: true
                },
                {
                    id: "d2_numero_parejas_ultimos_meses",
                    number: "2",
                    label: "Número de parejas sexuales en los últimos meses:",
                    type: "number",
                    placeholder: "Ej: 1",
                    min: 0,
                    max: 50,
                    required: true
                },
                {
                    id: "d3_pareja_sexual_es",
                    number: "3",
                    label: "Su pareja sexual es:",
                    type: "radio",
                    options: [
                        { label: "Mujer", value: "Mujer" },
                        { label: "Hombre", value: "Hombre" },
                        { label: "Ambas", value: "Ambas" }
                    ],
                    required: true
                },
                {
                    id: "d4_parejas_ocasionales_12m",
                    number: "4",
                    label: "En los últimos 12 meses, ¿tuvo relaciones con parejas ocasionales?",
                    type: "radio",
                    options: [
                        { label: "SÍ", value: "SI" },
                        { label: "NO", value: "NO" }
                    ],
                    required: true
                },
                {
                    id: "d5_frecuencia_uso_preservativo_3m",
                    number: "5",
                    label: "Frecuencia de uso de preservativos en los últimos tres meses:",
                    type: "radio",
                    options: [
                        { label: "Siempre", value: "Siempre" },
                        { label: "A menudo", value: "A menudo" },
                        { label: "Algunas veces", value: "Algunas veces" },
                        { label: "Nunca", value: "Nunca" }
                    ],
                    required: true
                },
                {
                    id: "d6_prueba_sifilis_12m",
                    number: "6",
                    label: "¿Se ha realizado una prueba para sífilis en los últimos 12 meses?",
                    type: "radio",
                    options: [
                        { label: "SÍ", value: "SI" },
                        { label: "NO", value: "NO" }
                    ],
                    required: true
                },
                {
                    id: "d7_motivo_sin_preservativo",
                    number: "7",
                    label: "Si tuvo relaciones sin preservativo, ¿por qué motivo fue?",
                    type: "radio",
                    options: [
                        { label: "Confianza", value: "Confianza" },
                        { label: "Alcohol", value: "Alcohol" },
                        { label: "Falta de preservativo", value: "Falta de preservativo" },
                        { label: "Otro", value: "Otro", hasSpecify: true, specifyId: "d7_motivo_otro" }
                    ],
                    required: false
                },
                {
                    id: "d8_recibido_tratamiento_sifilis",
                    number: "8",
                    label: "¿Ha recibido tratamiento para sífilis?",
                    type: "radio",
                    options: [
                        { label: "SÍ", value: "SI" },
                        { label: "NO", value: "NO" }
                    ],
                    required: true
                },
                {
                    id: "d9_habla_pareja_preservativos",
                    number: "9",
                    label: "¿Habla con su pareja sobre el uso de preservativos?",
                    type: "radio",
                    options: [
                        { label: "SÍ", value: "SI" },
                        { label: "NO", value: "NO" }
                    ],
                    required: true
                },
                {
                    id: "d10_asistido_conversatorios_its",
                    number: "10",
                    label: "¿Ha asistido anteriormente a conversatorios sobre infecciones de transmisión sexual en los últimos años?",
                    type: "radio",
                    options: [
                        { label: "SÍ", value: "SI" },
                        { label: "NO", value: "NO" }
                    ],
                    required: true
                },
                {
                    id: "d11_conoce_donde_pruebas_rapidas",
                    number: "11",
                    label: "¿Conoce dónde solicitar pruebas rápidas en la institución?",
                    type: "radio",
                    options: [
                        { label: "SÍ", value: "SI" },
                        { label: "NO", value: "NO" }
                    ],
                    required: true
                }
            ]
        }
    ]
};
