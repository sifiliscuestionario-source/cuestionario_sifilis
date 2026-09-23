/**
 * Módulo Principal del Cuestionario Dinámico
 * Maneja el flujo multi-pasos, renderizado de preguntas, validación y envío de datos.
 */

class SurveyEngine {
    constructor() {
        this.currentStep = 0; // 0: Section A, 1: Section B, 2: Section C, 3: Section D
        this.answers = {};
        this.data = SURVEY_DATA;
        this.init();
    }

    init() {
        this.renderStepper();
        this.renderStep(this.currentStep);
        this.bindEvents();
    }

    bindEvents() {
        const prevBtn = document.getElementById('btn-prev-step');
        const nextBtn = document.getElementById('btn-next-step');
        const submitBtn = document.getElementById('btn-submit-survey');

        if (prevBtn) prevBtn.addEventListener('click', () => this.prevStep());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
        if (submitBtn) submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.submitSurvey();
        });
    }

    renderStepper() {
        const pct = Math.round(((this.currentStep + 1) / this.data.sections.length) * 100);
        const fill = document.getElementById('progress-fill');
        const textPct = document.getElementById('progress-pct-text');
        
        if (fill) fill.style.width = `${pct}%`;
        if (textPct) textPct.textContent = `${pct}% Completado`;

        const container = document.getElementById('steps-indicator');
        if (!container) return;

        container.innerHTML = this.data.sections.map((sec, idx) => {
            let stateClass = '';
            if (idx === this.currentStep) stateClass = 'active';
            else if (idx < this.currentStep) stateClass = 'completed';

            return `
                <div class="step-item ${stateClass}" onclick="surveyEngine.jumpToStep(${idx})">
                    <span class="step-num">${idx < this.currentStep ? '<i class="fas fa-check"></i>' : (idx + 1)}</span>
                    <span class="step-label">Sección ${sec.code}</span>
                </div>
            `;
        }).join('');
    }

    jumpToStep(stepIdx) {
        // Solo permitir saltar a pasos ya completados o el siguiente si actual es válido
        if (stepIdx < this.currentStep) {
            this.currentStep = stepIdx;
            this.renderStep(this.currentStep);
            this.renderStepper();
        } else if (stepIdx === this.currentStep + 1 && this.validateCurrentStep()) {
            this.currentStep = stepIdx;
            this.renderStep(this.currentStep);
            this.renderStepper();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep(this.currentStep);
            this.renderStepper();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.data.sections.length - 1) {
                this.currentStep++;
                this.renderStep(this.currentStep);
                this.renderStepper();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    renderStep(stepIdx) {
        const section = this.data.sections[stepIdx];
        const container = document.getElementById('survey-form-container');
        if (!container) return;

        let html = `
            <div class="section-header-box">
                <span class="section-tag">Sección ${section.code} de ${this.data.sections.length}</span>
                <h2 class="section-title">${section.title}</h2>
                <p class="section-desc">${section.description}</p>
            </div>
        `;

        if (stepIdx === 2) {
            // Sección C: Escala Likert Leyenda
            html += `
                <div class="consent-box" style="margin-bottom: 1.5rem; padding: 1rem 1.25rem;">
                    <strong style="color: var(--navy); display: block; margin-bottom: 0.5rem;"><i class="fas fa-info-circle"></i> Leyenda de la Escala:</strong>
                    <div style="display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.85rem;">
                        ${section.scaleLegend.map(l => `<span><strong>${l.val}</strong> = ${l.label}</span>`).join(' | ')}
                    </div>
                </div>
            `;
        }

        html += section.questions.map(q => this.renderQuestionHTML(q, section.code)).join('');

        container.innerHTML = html;
        this.updateButtonsVisibility();
        this.restoreStepAnswers();
    }

    renderQuestionHTML(q, sectionCode) {
        const reqBadge = q.required ? '<span class="req-asterisk">*</span>' : '';
        let inputFieldHTML = '';

        if (q.type === 'number') {
            inputFieldHTML = `
                <input type="number" 
                       id="${q.id}" 
                       class="form-control" 
                       placeholder="${q.placeholder || ''}" 
                       min="${q.min || 0}" 
                       max="${q.max || 120}"
                       value="${this.answers[q.id] || ''}"
                       onchange="surveyEngine.setAnswer('${q.id}', this.value)" />
            `;
        } else if (q.type === 'number_unit') {
            const val = this.answers[q.id] || '';
            const unitVal = this.answers[q.unitId] || q.unitOptions[0].value;

            inputFieldHTML = `
                <div style="display: flex; gap: 0.75rem;">
                    <input type="number" 
                           id="${q.id}" 
                           class="form-control" 
                           placeholder="${q.placeholder || ''}" 
                           style="flex: 2;"
                           value="${val}"
                           onchange="surveyEngine.setAnswer('${q.id}', this.value)" />
                    <select id="${q.unitId}" 
                            class="form-control" 
                            style="flex: 1;"
                            onchange="surveyEngine.setAnswer('${q.unitId}', this.value)">
                        ${q.unitOptions.map(opt => `<option value="${opt.value}" ${opt.value === unitVal ? 'selected' : ''}>${opt.label}</option>`).join('')}
                    </select>
                </div>
            `;
        } else if (q.type === 'text') {
            inputFieldHTML = `
                <input type="text" 
                       id="${q.id}" 
                       class="form-control" 
                       placeholder="${q.placeholder || ''}" 
                       value="${this.answers[q.id] || ''}"
                       onchange="surveyEngine.setAnswer('${q.id}', this.value)" />
            `;
        } else if (q.type === 'textarea') {
            inputFieldHTML = `
                <textarea id="${q.id}" 
                          class="form-control" 
                          placeholder="${q.placeholder || ''}"
                          onchange="surveyEngine.setAnswer('${q.id}', this.value)">${this.answers[q.id] || ''}</textarea>
            `;
        } else if (q.type === 'radio') {
            const selectedVal = this.answers[q.id] || '';
            inputFieldHTML = `
                <div class="options-grid">
                    ${q.options.map((opt, i) => {
                        const isChecked = selectedVal === opt.value;
                        let specifyFieldHTML = '';

                        if (opt.hasSpecify && isChecked) {
                            specifyFieldHTML = `
                                <div class="specify-input-box">
                                    <input type="text" 
                                           id="${opt.specifyId}" 
                                           class="form-control form-control-sm" 
                                           placeholder="Especifique..." 
                                           value="${this.answers[opt.specifyId] || ''}"
                                           onchange="surveyEngine.setAnswer('${opt.specifyId}', this.value)" />
                                </div>
                            `;
                        }

                        return `
                            <div>
                                <label class="option-card ${isChecked ? 'selected' : ''}" onclick="surveyEngine.selectRadioOption('${q.id}', '${opt.value}', '${opt.specifyId || ''}')">
                                    <input type="radio" name="${q.id}" value="${opt.value}" ${isChecked ? 'checked' : ''} />
                                    <span class="option-text">${opt.label}</span>
                                </label>
                                ${specifyFieldHTML}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else if (q.type === 'radio_with_followup') {
            const selectedVal = this.answers[q.id] || '';
            const showFollowup = selectedVal === q.followupIf;

            inputFieldHTML = `
                <div class="options-grid">
                    <div style="display: flex; gap: 1rem;">
                        ${q.options.map(opt => {
                            const isChecked = selectedVal === opt.value;
                            return `
                                <label class="option-card ${isChecked ? 'selected' : ''}" style="flex: 1;" onclick="surveyEngine.selectRadioOption('${q.id}', '${opt.value}')">
                                    <input type="radio" name="${q.id}" value="${opt.value}" ${isChecked ? 'checked' : ''} />
                                    <span class="option-text">${opt.label}</span>
                                </label>
                            `;
                        }).join('')}
                    </div>
                    ${showFollowup ? `
                        <div style="margin-top: 0.75rem;">
                            <label class="question-label" style="font-size: 0.875rem;">${q.followupLabel}</label>
                            <input type="text" 
                                   id="${q.followupId}" 
                                   class="form-control" 
                                   placeholder="${q.followupPlaceholder}" 
                                   value="${this.answers[q.followupId] || ''}"
                                   onchange="surveyEngine.setAnswer('${q.followupId}', this.value)" />
                        </div>
                    ` : ''}
                </div>
            `;
        } else if (q.type === 'checkbox_group') {
            const currentArr = this.answers[q.id] || [];

            inputFieldHTML = `
                <div class="options-grid">
                    ${q.options.map(opt => {
                        const isChecked = currentArr.includes(opt.value);
                        return `
                            <label class="option-card ${isChecked ? 'selected' : ''}" onclick="surveyEngine.toggleCheckboxOption('${q.id}', '${opt.value}')">
                                <input type="checkbox" value="${opt.value}" ${isChecked ? 'checked' : ''} />
                                <span class="option-text">${opt.label}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            `;
        } else if (q.type === 'likert') {
            const currentVal = this.answers[q.id] || null;

            inputFieldHTML = `
                <div class="likert-container">
                    <div class="likert-grid">
                        ${[1, 2, 3, 4, 5].map(val => {
                            const isSel = currentVal == val;
                            return `
                                <div class="likert-btn-option ${isSel ? 'selected' : ''}" onclick="surveyEngine.selectLikert('${q.id}', ${val})">
                                    <span class="likert-val">${val}</span>
                                    <span class="likert-lbl">${this.data.sections[2].scaleLegend[val - 1].label}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        } else if (q.type === 'gravity_matrix') {
            const isUnknown = !!this.answers[q.unknownId];

            inputFieldHTML = `
                <div class="options-grid">
                    <table class="matrix-table" style="${isUnknown ? 'opacity: 0.5; pointer-events: none;' : ''}">
                        <thead>
                            <tr>
                                <th>Condición</th>
                                <th>Leve</th>
                                <th>Moderada</th>
                                <th>Grave</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${q.categories.map(cat => {
                                const selVal = this.answers[cat.id] || '';
                                return `
                                    <tr>
                                        <td>${cat.label}</td>
                                        ${cat.options.map(opt => `
                                            <td>
                                                <input type="radio" 
                                                       name="${cat.id}" 
                                                       value="${opt}" 
                                                       ${selVal === opt ? 'checked' : ''} 
                                                       onchange="surveyEngine.setAnswer('${cat.id}', '${opt}')" />
                                            </td>
                                        `).join('')}
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                    <div style="margin-top: 0.75rem;">
                        <label class="option-card ${isUnknown ? 'selected' : ''}" onclick="surveyEngine.toggleUnknownGravity('${q.unknownId}')">
                            <input type="checkbox" ${isUnknown ? 'checked' : ''} />
                            <span class="option-text">${q.unknownLabel}</span>
                        </label>
                    </div>
                </div>
            `;
        }

        return `
            <div class="question-block" id="block_${q.id}">
                <label class="question-label">
                    ${q.number ? `<strong>${q.number}.</strong> ` : ''}${q.label} ${reqBadge}
                </label>
                ${inputFieldHTML}
            </div>
        `;
    }

    setAnswer(key, val) {
        this.answers[key] = val;
    }

    selectRadioOption(qId, val, specifyId = '') {
        this.answers[qId] = val;
        if (!specifyId) {
            // re-render current step to reflect updated states & optional specify fields
            this.renderStep(this.currentStep);
        } else {
            this.renderStep(this.currentStep);
        }
    }

    toggleCheckboxOption(qId, val) {
        if (!this.answers[qId]) {
            this.answers[qId] = [];
        }
        const index = this.answers[qId].indexOf(val);
        if (index > -1) {
            this.answers[qId].splice(index, 1);
        } else {
            this.answers[qId].push(val);
        }
        this.renderStep(this.currentStep);
    }

    selectLikert(qId, val) {
        this.answers[qId] = val;
        this.renderStep(this.currentStep);
    }

    toggleUnknownGravity(unknownId) {
        this.answers[unknownId] = !this.answers[unknownId];
        if (this.answers[unknownId]) {
            delete this.answers['b22_con_tratamiento'];
            delete this.answers['b22_sin_tratamiento'];
        }
        this.renderStep(this.currentStep);
    }

    restoreStepAnswers() {
        // Asegurar que valores por defecto existan si aplica
        if (this.currentStep === 0 && !this.answers['a6_tiempo_servicio_unidad']) {
            this.answers['a6_tiempo_servicio_unidad'] = 'Meses';
        }
    }

    validateCurrentStep() {
        const section = this.data.sections[this.currentStep];
        let isValid = true;
        let firstErrorBlock = null;

        section.questions.forEach(q => {
            const block = document.getElementById(`block_${q.id}`);
            if (block) block.classList.remove('has-error');

            if (q.required) {
                if (q.type === 'checkbox_group') {
                    if (!this.answers[q.id] || this.answers[q.id].length === 0) {
                        isValid = false;
                        if (block) block.classList.add('has-error');
                        if (!firstErrorBlock) firstErrorBlock = block;
                    }
                } else if (q.type === 'gravity_matrix') {
                    if (!this.answers[q.unknownId]) {
                        if (!this.answers['b22_con_tratamiento'] || !this.answers['b22_sin_tratamiento']) {
                            isValid = false;
                            if (block) block.classList.add('has-error');
                            if (!firstErrorBlock) firstErrorBlock = block;
                        }
                    }
                } else if (q.type === 'number_unit') {
                    if (!this.answers[q.id]) {
                        isValid = false;
                        if (block) block.classList.add('has-error');
                        if (!firstErrorBlock) firstErrorBlock = block;
                    }
                } else {
                    const val = this.answers[q.id];
                    if (val === undefined || val === null || val === '') {
                        isValid = false;
                        if (block) block.classList.add('has-error');
                        if (!firstErrorBlock) firstErrorBlock = block;
                    }
                }
            }
        });

        if (!isValid) {
            if (firstErrorBlock) {
                firstErrorBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            alert('Por favor complete todas las preguntas obligatorias (*) marcadas en la sección antes de continuar.');
        }

        return isValid;
    }

    updateButtonsVisibility() {
        const prevBtn = document.getElementById('btn-prev-step');
        const nextBtn = document.getElementById('btn-next-step');
        const submitBtn = document.getElementById('btn-submit-survey');

        if (prevBtn) prevBtn.style.display = this.currentStep === 0 ? 'none' : 'inline-flex';
        if (nextBtn) nextBtn.style.display = this.currentStep === this.data.sections.length - 1 ? 'none' : 'inline-flex';
        if (submitBtn) submitBtn.style.display = this.currentStep === this.data.sections.length - 1 ? 'inline-flex' : 'none';
    }

    async submitSurvey() {
        if (!this.validateCurrentStep()) return;

        const submitBtn = document.getElementById('btn-submit-survey');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        }

        try {
            const res = await window.supabaseService.saveResponse(this.answers);
            
            // Mostrar modal de éxito
            const modal = document.getElementById('success-modal');
            if (modal) modal.classList.add('open');

            // Resetear estado
            this.answers = {};
            this.currentStep = 0;
            this.renderStepper();
            this.renderStep(0);
        } catch (e) {
            console.error("Error guardando encuesta:", e);
            alert("Ocurrió un inconveniente al guardar las respuestas. Intente de nuevo.");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Finalizar y Enviar Encuesta';
            }
        }
    }
}

// Inicializar motor de cuestionario cuando cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    window.surveyEngine = new SurveyEngine();
});
