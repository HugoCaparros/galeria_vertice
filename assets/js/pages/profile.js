/* ==========================================================================
   USER PROFILE & RECOVERY LOGIC
   Ubicación: assets/js/pages/profile.js
   ========================================================================== */

function safeText(elementId, text) { 
    const el = document.getElementById(elementId); 
    if (el) el.textContent = text; 
}

window.initUserProfile = async function() {
    const usuario = await DataLoader.getUsuarioActual();
    if (usuario) {
        safeText('user-name', usuario.nombre);
        safeText('user-handle', usuario.handle);
        safeText('user-bio', usuario.bio);
        safeText('stats-followers', usuario.seguidores);
        safeText('stats-following', usuario.siguiendo);
        const avatarEl = document.getElementById('user-avatar-img');
        if (avatarEl) avatarEl.src = usuario.avatar;
    }
};

window.initRecoveryModal = function() {
    const modal = document.getElementById('forgotModal');
    const openBtn = document.getElementById('forgotLink'); 
    const closeBtn = document.getElementById('closeModal');
    const form = document.getElementById('recoveryForm');
    
    const pass1 = document.getElementById('newPassword');
    const pass2 = document.getElementById('confirmPassword');
    const errorMsg = document.getElementById('passwordError');
    const successMsg = document.getElementById('recoverySuccess');
    
    // Abrir
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            if(form) { form.reset(); form.style.display = 'block'; }
            if(successMsg) successMsg.style.display = 'none';
            if(errorMsg) errorMsg.textContent = '';
        });
    }

    // Cerrar
    const closeModal = () => modal.classList.remove('active');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // Validar y Enviar
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (pass1.value !== pass2.value) {
                errorMsg.textContent = "❌ Las contraseñas no coinciden.";
                return;
            }
            if (pass1.value.length < 6) {
                errorMsg.textContent = "⚠️ Mínimo 6 caracteres.";
                return;
            }
            
            // Simulación de éxito
            form.style.display = 'none';
            successMsg.style.display = 'block';
            setTimeout(() => closeModal(), 2000);
        });
    }
};