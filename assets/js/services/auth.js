document.addEventListener('DOMContentLoaded', function() {
    
    /* =========================================================
       1. LÓGICA DEL SELECT PERSONALIZADO (Register)
       ========================================================= */
    const wrapper = document.querySelector('.custom-select-wrapper');
    
    if (wrapper) {
        const trigger = document.querySelector('.custom-select-trigger');
        const triggerText = document.querySelector('.custom-select-text');
        const options = document.querySelectorAll('.custom-option');
        const hiddenInput = document.getElementById('tipoUsuarioValue');

        trigger.addEventListener('click', () => wrapper.classList.toggle('open'));

        options.forEach(option => {
            option.addEventListener('click', function() {
                options.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                triggerText.textContent = this.textContent;
                trigger.classList.add('selected');
                hiddenInput.value = this.getAttribute('data-value');
                wrapper.classList.remove('open');
            });
        });

        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) wrapper.classList.remove('open');
        });
    }

    /* =========================================================
       2. LÓGICA GENERAL: VER/OCULTAR CONTRASEÑAS (Global)
       ========================================================= */
    // Esto hace que CUALQUIER icono de ojo funcione, sea del login o del modal
    document.querySelectorAll('.show-pass-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            // Buscamos el input hermano anterior (el campo de contraseña)
            const input = this.previousElementSibling;
            if (input && input.tagName === 'INPUT') {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                
                // Cambiar el icono (ojo abierto/tachado)
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            }
        });
    });

    /* =========================================================
       3. LÓGICA DEL MODAL "RESTABLECER CONTRASEÑA"
       ========================================================= */
    const forgotLink = document.getElementById('forgotPasswordLink');
    const modal = document.getElementById('forgotModal');

    if (forgotLink && modal) {
        const closeModalBtn = document.getElementById('closeModal');
        const recoveryForm = document.getElementById('recoveryForm');
        const successMsg = document.getElementById('recoverySuccess');
        
        // Elementos específicos del formulario de cambio
        const newPassInput = document.getElementById('newPassword');
        const confirmPassInput = document.getElementById('confirmPassword');
        const errorMsg = document.getElementById('passwordError');
        
        // --- ABRIR MODAL ---
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            
            // Reseteo completo al abrir
            successMsg.style.display = 'none';
            recoveryForm.style.display = 'block';
            errorMsg.style.display = 'none';
            recoveryForm.reset();
        });

        // --- CERRAR MODAL ---
        const closeModal = () => modal.classList.remove('active');
        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // --- VALIDAR Y ENVIAR ---
        recoveryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 1. Validación: ¿Coinciden las contraseñas?
            if (newPassInput.value !== confirmPassInput.value) {
                errorMsg.textContent = "Las contraseñas no coinciden.";
                errorMsg.style.display = 'block';
                // Pequeña animación de vibración si quieres
                confirmPassInput.parentElement.style.animation = "shake 0.3s";
                setTimeout(() => confirmPassInput.parentElement.style.animation = "", 300);
                return;
            }

            // 2. Validación: Longitud mínima (opcional, aunque el HTML ya tiene minlength)
            if (newPassInput.value.length < 6) {
                errorMsg.textContent = "La contraseña debe tener al menos 6 caracteres.";
                errorMsg.style.display = 'block';
                return;
            }

            // Si pasa validaciones, ocultamos error y procesamos
            errorMsg.style.display = 'none';
            
            const btn = recoveryForm.querySelector('button');
            const originalText = btn.innerText;
            
            // Feedback visual de "Cargando"
            btn.innerText = "ACTUALIZANDO...";
            btn.style.opacity = "0.7";
            btn.disabled = true;

            setTimeout(() => {
                // Éxito
                recoveryForm.style.display = 'none';
                successMsg.style.display = 'block';
                
                // Restaurar botón
                btn.innerText = originalText;
                btn.style.opacity = "1";
                btn.disabled = false;

                // Cerrar auto tras 3 seg
                setTimeout(() => {
                    closeModal();
                }, 3000);

            }, 1500); // Simula 1.5s de petición al servidor
        });
        
        // Quitar mensaje de error cuando el usuario empieza a escribir de nuevo
        confirmPassInput.addEventListener('input', () => {
             errorMsg.style.display = 'none';
        });
    }

});