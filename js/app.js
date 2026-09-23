/**
 * Módulo Principal del Cuestionario Dinámico con Consentimiento Informado & Firma Digital
 */

class SurveyEngine {
    constructor() {
        this.currentStep = 0; // Step 0: Consentimiento, Step 1: Section A, Step 2: Section B, Step 3: Section C, Step 4: Section D
        this.answers = {};
        this.data = SURVEY_DATA;
        this.isDrawing = false;
        this.signatureCanvas = null;
        this.signatureCtx = null;
        this.hasSigned = false;
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
        const totalSteps = this.data.sections.length;
        const pct = Math.round(((this.currentStep + 1) / totalSteps) * 100);
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

            const label = idx === 0 ? 'Consentimiento' : `Sec. ${sec.code}`;

            return `
                <div class="step-item ${stateClass}" onclick="surveyEngine.jumpToStep(${idx})">
                    <span class="step-num">${idx < this.currentStep ? '<i class="fas fa-check"></i>' : (idx)}</span>
                    <span class="step-label">${label}</span>
                </div>
            `;
        }).join('');
    }

    jumpToStep(stepIdx) {
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

        if (section.isConsentStep) {
            this.renderConsentStep(container, section);
        } else {
            this.renderStandardStep(container, section, stepIdx);
        }

        this.updateButtonsVisibility();
    }

    renderConsentStep(container, section) {
        const isAccepted = !!this.answers['consentimiento_aceptado'];

        container.innerHTML = `
            <div class="section-header-box">
                <span class="section-tag" style="background: #fef3c7; color: #d97706;">Paso Obligatorio</span>
                <h2 class="section-title"><i class="fas fa-file-contract" style="color: var(--primary);"></i> Consentimiento Informado</h2>
                <p class="section-desc">${section.description}</p>
            </div>

            <div class="consent-text-card">
                <p>${this.data.consentText}</p>
            </div>

            <div class="question-block" id="block_consent_checkbox">
                <label class="option-card ${isAccepted ? 'selected' : ''}" onclick="surveyEngine.toggleConsentAcceptance()">
                    <input type="checkbox" id="chk-accept-consent" ${isAccepted ? 'checked' : ''} />
                    <span class="option-text"><strong>Declaro que he leído la información y acepto participar voluntariamente.</strong></span>
                </label>
            </div>

            <div class="question-block" id="block_signature">
                <label class="question-label">
                    <i class="fas fa-signature" style="color: var(--primary);"></i> Firma Digital del Participante <span class="req-asterisk">*</span>
                </label>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                    Dibuje su firma en el recuadro gris usando su dedo (en teléfono) o el ratón:
                </p>
                <div class="signature-canvas-box">
                    <canvas id="signature-pad" width="400" height="160"></canvas>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                    <span id="signature-status-msg" style="font-size: 0.8rem; color: var(--text-muted);">
                        ${this.hasSigned ? '✓ Firma registrada' : 'Por favor firme en el recuadro'}
                    </span>
                    <button type="button" class="btn btn-sm btn-outline-light" style="color: var(--navy); border-color: var(--border);" onclick="surveyEngine.clearSignature()">
                        <i class="fas fa-eraser"></i> Limpiar Firma
                    </button>
                </div>
            </div>
        `;

        setTimeout(() => this.initSignatureCanvas(), 50);
    }

    toggleConsentAcceptance() {
        this.answers['consentimiento_aceptado'] = !this.answers['consentimiento_aceptado'];
        const chk = document.getElementById('chk-accept-consent');
        if (chk) chk.checked = this.answers['consentimiento_aceptado'];
        const card = chk ? chk.closest('.option-card') : null;
        if (card) card.classList.toggle('selected', this.answers['consentimiento_aceptado']);
    }

    initSignatureCanvas() {
        const canvas = document.getElementById('signature-pad');
        if (!canvas) return;

        this.signatureCanvas = canvas;
        this.signatureCtx = canvas.getContext('2d');
        
        // Ajustar resolución del canvas
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = 160;

        this.signatureCtx.strokeStyle = '#0f172a';
        this.signatureCtx.lineWidth = 2.5;
        this.signatureCtx.lineCap = 'round';
        this.signatureCtx.lineJoin = 'round';

        // Si ya había una firma guardada, restaurarla
        if (this.answers['firma_consentimiento']) {
            const img = new Image();
            img.onload = () => {
                this.signatureCtx.drawImage(img, 0, 0);
                this.hasSigned = true;
            };
            img.src = this.answers['firma_consentimiento'];
        }

        // Eventos Ratón y Táctil
        const getPos = (e) => {
            const r = canvas.getBoundingClientRect();
            let clientX = e.clientX;
            let clientY = e.clientY;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }
            return {
                x: clientX - r.left,
                y: clientY - r.top
            };
        };

        const startDraw = (e) => {
            e.preventDefault();
            this.isDrawing = true;
            const pos = getPos(e);
            this.signatureCtx.beginPath();
            this.signatureCtx.moveTo(pos.x, pos.y);
        };

        const draw = (e) => {
            if (!this.isDrawing) return;
            e.preventDefault();
            const pos = getPos(e);
            this.signatureCtx.lineTo(pos.x, pos.y);
            this.signatureCtx.stroke();
            this.hasSigned = true;
            const msg = document.getElementById('signature-status-msg');
            if (msg) {
                msg.textContent = '✓ Firma registrada';
                msg.style.color = 'var(--success)';
            }
        };

        const stopDraw = () => {
            if (this.isDrawing) {
                this.isDrawing = false;
                if (this.hasSigned) {
                    this.answers['firma_consentimiento'] = canvas.toDataURL();
                }
            }
        };

        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDraw);
        canvas.addEventListener('mouseleave', stopDraw);

        canvas.addEventListener('touchstart', startDraw, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDraw);
    }

    clearSignature() {
        if (this.signatureCtx && this.signatureCanvas) {
            this.signatureCtx.clearRect(0, 0, this.signatureCanvas.width, this.signatureCanvas.height);
            this.hasSigned = false;
            delete this.answers['firma_consentimiento'];
            const msg = document.getElementById('signature-status-msg');
            if (msg) {
                msg.textContent = 'Por favor firme en el recuadro';
                msg.style.color = 'var(--text-muted)';
            }
        }
    }

    renderStandardStep(container, section, stepIdx) {
        let html = `
            <div class="section-header-box">
                <span class="section-tag">Sección ${section.code} de ${this.data.sections.length - 1}</span>
                <h2 class="section-title">${section.title}</h2>
                <p class="section-desc">${section.description}</p>
            </div>
        `;

        if (stepIdx === 3) {
            // Sección C Leyenda
            html += `
                <div class="consent-box" style="margin-bottom: 1rem; padding: 0.85rem 1rem;">
                    <strong style="color: var(--navy); display: block; margin-bottom: 0.35rem; font-size: 0.85rem;"><i class="fas fa-info-circle"></i> Escala:</strong>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; font-size: 0.75rem;">
                        ${section.scaleLegend.map(l => `<span><strong>${l.val}</strong>=${l.label}</span>`).join(' | ')}
                    </div>
                </div>
            `;
        }

        html += section.questions.map(q => this.renderQuestionHTML(q)).join('');
        container.innerHTML = html;
        this.restoreStepAnswers();
    }

    renderQuestionHTML(q) {
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
                <div style="display: flex; gap: 0.5rem;">
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
                    ${q.options.map(opt => {
                        const isChecked = selectedVal === opt.value;
                        let specifyFieldHTML = '';

                        if (opt.hasSpecify && isChecked) {
                            specifyFieldHTML = `
                                <div class="specify-input-box" style="margin-top: 0.35rem; margin-left: 1.5rem;">
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
                    <div style="display: flex; gap: 0.5rem;">
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
                        <div style="margin-top: 0.5rem;">
                            <label class="question-label" style="font-size: 0.85rem;">${q.followupLabel}</label>
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
                <div class="likert-grid">
                    ${[1, 2, 3, 4, 5].map(val => {
                        const isSel = currentVal == val;
                        return `
                            <div class="likert-btn-option ${isSel ? 'selected' : ''}" onclick="surveyEngine.selectLikert('${q.id}', ${val})">
                                <span class="likert-val">${val}</span>
                                <span class="likert-lbl">${this.data.sections[3].scaleLegend[val - 1].label}</span>
                            </div>
                        `;
                    }).join('')}
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
                    <div style="margin-top: 0.5rem;">
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
        this.renderStep(this.currentStep);
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
        if (this.currentStep === 1 && !this.answers['a6_tiempo_servicio_unidad']) {
            this.answers['a6_tiempo_servicio_unidad'] = 'Meses';
        }
    }

    validateCurrentStep() {
        const section = this.data.sections[this.currentStep];

        if (section.isConsentStep) {
            if (!this.answers['consentimiento_aceptado']) {
                alert('Debe marcar la casilla de aceptación del consentimiento informado para continuar.');
                return false;
            }
            if (!this.hasSigned || !this.answers['firma_consentimiento']) {
                alert('Por favor firme en el recuadro digital de consentimiento antes de continuar.');
                return false;
            }
            return true;
        }

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
            alert('Por favor complete todas las preguntas obligatorias (*) en esta sección.');
        }

        return isValid;
    }

    updateButtonsVisibility() {
        const prevBtn = document.getElementById('btn-prev-step');
        const nextBtn = document.getElementById('btn-next-step');
        const submitBtn = document.getElementById('btn-submit-survey');

        if (prevBtn) prevBtn.style.display = this.currentStep === 0 ? 'none' : 'inline-flex';
        if (nextBtn) {
            nextBtn.style.display = this.currentStep === this.data.sections.length - 1 ? 'none' : 'inline-flex';
            if (this.currentStep === 0) {
                nextBtn.innerHTML = 'Aceptar y Comenzar <i class="fas fa-arrow-right"></i>';
            } else {
                nextBtn.innerHTML = 'Siguiente <i class="fas fa-arrow-right"></i>';
            }
        }
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
            await window.supabaseService.saveResponse(this.answers);
            
            const modal = document.getElementById('success-modal');
            if (modal) modal.classList.add('open');

            this.answers = {};
            this.currentStep = 0;
            this.hasSigned = false;
            this.renderStepper();
            this.renderStep(0);
        } catch (e) {
            console.error("Error guardando encuesta:", e);
            alert("Ocurrió un inconveniente al guardar. Intente de nuevo.");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Encuesta';
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.surveyEngine = new SurveyEngine();
});
