/**
 * AUTH SERVICE
 * Ubicación: assets/js/services/auth.js
 * Misión: Gestionar Login, Registro, Panel Deslizante y Cambio de Contraseña.
 */

const AuthService = {

    init: () => {
        // 1. Detectar formularios principales
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.addEventListener('submit', AuthService.handleLogin);

        const registerForm = document.getElementById('registerForm');
        if (registerForm) registerForm.addEventListener('submit', AuthService.handleRegister);

        // 2. UI Helpers
        AuthService.setupPasswordToggles();
        AuthService.setupCustomSelect();
        AuthService.setupSlidingPanel(); 
        
        // 3. Lógica del Popup de Cambio de Contraseña
        AuthService.setupRecoveryModal();
    },

    // ========================================================================
    // A. LÓGICA DEL POPUP (CAMBIO DE CONTRASEÑA)
    // ========================================================================
    setupRecoveryModal: () => {
        const modal = document.getElementById('forgotModal');
        const openLink = document.getElementById('forgotLink');
        const closeBtn = document.getElementById('closeModal');
        const form = document.getElementById('recoveryForm');

        if (!modal || !openLink) return;

        const errorMsg = document.getElementById('resetError');
        const successMsg = document.getElementById('resetSuccess');
        const pass1 = document.getElementById('resetPass');
        const pass2 = document.getElementById('resetConfirmPass');

        // 1. Abrir Modal
        openLink.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            if(form) form.reset();
            if(errorMsg) errorMsg.style.display = 'none';
            if(successMsg) successMsg.style.display = 'none';
        });

        // 2. Cerrar Modal
        const closeModal = () => modal.classList.remove('active');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        // 3. PROCESAR EL CAMBIO
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Validación básica
                if (pass1.value !== pass2.value) {
                    errorMsg.textContent = "❌ Las contraseñas no coinciden.";
                    errorMsg.style.display = 'block';
                    return;
                }

                if (pass1.value.length < 6) {
                    errorMsg.textContent = "⚠️ La contraseña debe tener al menos 6 caracteres.";
                    errorMsg.style.display = 'block';
                    return;
                }

                // Si todo está bien:
                errorMsg.style.display = 'none';
                const btn = form.querySelector('button');
                const originalText = btn.textContent;
                
                btn.textContent = "Actualizando...";
                btn.disabled = true;

                // SIMULACIÓN INSTANTÁNEA
                setTimeout(() => {
                    // Mostrar éxito
                    successMsg.style.display = 'block';
                    btn.style.backgroundColor = "var(--color-verde)";
                    btn.textContent = "¡Hecho!";

                    // Cerrar a los 1.5 segundos
                    setTimeout(() => {
                        closeModal();
                        // Restaurar botón por si se vuelve a abrir
                        btn.textContent = originalText;
                        btn.disabled = false;
                        btn.style.backgroundColor = ""; 
                        successMsg.style.display = 'none';
                    }, 1500);

                }, 800); // Pequeño delay de 0.8s para dar sensación de proceso
            });
        }
    },

    // ========================================================================
    // B. LÓGICA DEL PANEL DESLIZANTE
    // ========================================================================
    setupSlidingPanel: () => {
        const container = document.getElementById('authContainer');
        const signUpBtn = document.getElementById('signUpBtn');
        const signInBtn = document.getElementById('signInBtn');

        if (container && signUpBtn && signInBtn) {
            signUpBtn.addEventListener('click', () => container.classList.add("right-panel-active"));
            signInBtn.addEventListener('click', () => container.classList.remove("right-panel-active"));
            
            const urlParams = new URLSearchParams(window.location.search);
            if(urlParams.get('mode') === 'register') {
                 container.classList.add("right-panel-active");
            }
        }
    },

    // ========================================================================
    // C. UTILIDADES UI
    // ========================================================================
    setupCustomSelect: () => {
        const wrapper = document.querySelector('.custom-select-wrapper');
        if (wrapper) {
            const trigger = wrapper.querySelector('.custom-select-trigger');
            const options = wrapper.querySelectorAll('.custom-option');
            const triggerText = trigger.querySelector('span');

            trigger.addEventListener('click', (e) => {
                wrapper.classList.toggle('open');
                e.stopPropagation();
            });

            options.forEach(option => {
                option.addEventListener('click', () => {
                    triggerText.textContent = option.textContent;
                    trigger.classList.add('selected');
                    options.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    wrapper.classList.remove('open');
                });
            });

            document.addEventListener('click', (e) => {
                if (!wrapper.contains(e.target)) wrapper.classList.remove('open');
            });
        }
    },

    setupPasswordToggles: () => {
        // Usamos delegación de eventos o re-consultamos el DOM para pillar los del modal
        // Lo más seguro es añadir el listener al document o ejecutarlo tras cargar el modal.
        // Aquí lo ejecutamos sobre todos los existentes en el DOM al inicio.
        const icons = document.querySelectorAll('.show-pass-icon');
        icons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                const input = e.target.previousElementSibling;
                if (input && input.tagName === 'INPUT') {
                    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                    input.setAttribute('type', type);
                    e.target.classList.toggle('fa-eye');
                    e.target.classList.toggle('fa-eye-slash');
                }
            });
        });
    },

    // ========================================================================
    // D. LOGIN
    // ========================================================================
    handleLogin: async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('email'); 
        const passInput = document.getElementById('password');
        const btn = e.target.querySelector('button[type="submit"]');
        let errorMsg = document.getElementById('loginError');
        
        if (!errorMsg) {
            errorMsg = document.createElement('p');
            errorMsg.id = 'loginError';
            errorMsg.classList.add('error-message');
            e.target.appendChild(errorMsg);
        }
        errorMsg.style.display = 'block';

        const originalText = btn.textContent;
        btn.textContent = "Verificando...";
        btn.disabled = true;
        errorMsg.textContent = "";

        try {
            if (typeof DataLoader === 'undefined') throw new Error("DataLoader no cargado");
            const usuarios = await DataLoader.getUsuarios();
            
            const usuarioEncontrado = usuarios.find(u => 
                u.email.toLowerCase() === emailInput.value.trim().toLowerCase() && 
                u.password === passInput.value
            );

            if (usuarioEncontrado) {
                localStorage.setItem('usuario_logueado', JSON.stringify(usuarioEncontrado));
                btn.style.backgroundColor = "var(--color-verde)"; 
                btn.textContent = "¡Bienvenido!";
                setTimeout(() => { window.location.href = '../../index.html'; }, 1000);
            } else {
                throw new Error("Credenciales incorrectas");
            }
        } catch (error) {
            errorMsg.textContent = "❌ Usuario o contraseña incorrectos.";
            btn.textContent = originalText;
            btn.disabled = false;
            btn.style.backgroundColor = "";
        }
    },

    // ========================================================================
    // E. REGISTRO
    // ========================================================================
    handleRegister: async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('nombre');
        const emailInput = document.getElementById('emailReg');
        const btn = e.target.querySelector('button[type="submit"]');
        
        const userTypeWrapper = document.querySelector('.custom-select-trigger span');
        const userType = userTypeWrapper ? userTypeWrapper.textContent : 'Usuario';

        let errorMsg = document.getElementById('regError');
        let successMsg = document.getElementById('regSuccess');

        if (!errorMsg) {
            errorMsg = document.createElement('p');
            errorMsg.id = 'regError';
            errorMsg.classList.add('error-message');
            e.target.appendChild(errorMsg);
        }
        errorMsg.style.display = 'block';

        if (userType === "Tipo de Usuario") {
             errorMsg.textContent = "⚠️ Por favor selecciona un tipo de usuario.";
             return;
        }

        const originalText = btn.textContent;
        btn.textContent = "Registrando...";
        btn.disabled = true;

        setTimeout(() => {
            const nuevoUsuario = {
                id: Date.now(),
                nombre: nameInput.value,
                email: emailInput.value,
                avatar: "../../assets/img/default-avatar.jpg",
                rol: userType,
                handle: "@" + nameInput.value.replace(/\s+/g, '').toLowerCase()
            };

            localStorage.setItem('usuario_logueado', JSON.stringify(nuevoUsuario));
            
            if(successMsg) successMsg.style.display = 'block';
            btn.style.backgroundColor = "var(--color-verde)";
            btn.textContent = "¡Cuenta creada!";
            
            setTimeout(() => { window.location.href = '../../index.html'; }, 1500);
        }, 1500);
    }
};

document.addEventListener('DOMContentLoaded', AuthService.init);