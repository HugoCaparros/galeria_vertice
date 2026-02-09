/**
 * AUTH SERVICE
 * Ubicación: assets/js/services/auth.js
 * Misión: Gestionar Login, Registro y Logout interactuando con DataLoader.
 */

const AuthService = {

    // INICIALIZADOR: Se ejecuta al cargar la página
    init: () => {
        // 1. Detectar Login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', AuthService.handleLogin);
        }

        // 2. Detectar Registro
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', AuthService.handleRegister);
        }

        // 3. Activar los botones de "Ver contraseña" (ojitos)
        AuthService.setupPasswordToggles();

        // 4. ACTIVAR EL DESPLEGABLE PERSONALIZADO (NUEVO)
        AuthService.setupCustomSelect();
    },

    // ========================================================================
    // LÓGICA DEL DESPLEGABLE (TIPO DE USUARIO) - ¡NUEVO!
    // ========================================================================
    setupCustomSelect: () => {
        const wrapper = document.querySelector('.custom-select-wrapper');
        
        if (wrapper) {
            const trigger = wrapper.querySelector('.custom-select-trigger');
            const options = wrapper.querySelectorAll('.custom-option');
            const triggerText = trigger.querySelector('span');

            // 1. Abrir / Cerrar al hacer clic
            trigger.addEventListener('click', (e) => {
                wrapper.classList.toggle('open');
                e.stopPropagation(); // Evita que el clic se propague al document
            });

            // 2. Seleccionar una opción
            options.forEach(option => {
                option.addEventListener('click', () => {
                    // Cambiar el texto del botón
                    triggerText.textContent = option.textContent;
                    trigger.classList.add('selected'); // Cambia color a negro
                    
                    // Marcar visualmente la opción elegida
                    options.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    
                    // Cerrar
                    wrapper.classList.remove('open');
                });
            });

            // 3. Cerrar si hago clic fuera
            document.addEventListener('click', (e) => {
                if (!wrapper.contains(e.target)) {
                    wrapper.classList.remove('open');
                }
            });
        }
    },

    // ========================================================================
    // 1. LÓGICA DE LOGIN
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
            errorMsg.style.color = "#d9534f"; errorMsg.style.textAlign = "center"; errorMsg.style.marginTop = "10px";
            e.target.appendChild(errorMsg);
        }

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
                btn.style.backgroundColor = "#4CAF50"; 
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
    // 2. LÓGICA DE REGISTRO
    // ========================================================================
    handleRegister: async (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('nombre');
        const emailInput = document.getElementById('email');
        const passInput = document.getElementById('password');
        const passConfirmInput = document.getElementById('confirmPassword');
        const btn = e.target.querySelector('button[type="submit"]');
        
        // Obtener el tipo de usuario del desplegable
        const userTypeWrapper = document.querySelector('.custom-select-trigger span');
        const userType = userTypeWrapper ? userTypeWrapper.textContent : 'Usuario';

        let errorMsg = document.getElementById('registerError');
        if (!errorMsg) {
            errorMsg = document.createElement('p');
            errorMsg.id = 'registerError';
            errorMsg.style.color = "#d9534f"; errorMsg.style.textAlign = "center";
            e.target.appendChild(errorMsg);
        }

        if (passConfirmInput && passInput.value !== passConfirmInput.value) {
            errorMsg.textContent = "⚠️ Las contraseñas no coinciden.";
            return;
        }

        // Validar que haya seleccionado un tipo (Opcional)
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
                rol: userType, // Guardamos el rol seleccionado
                handle: "@" + nameInput.value.replace(/\s+/g, '').toLowerCase()
            };

            localStorage.setItem('usuario_logueado', JSON.stringify(nuevoUsuario));
            btn.style.backgroundColor = "#4CAF50";
            btn.textContent = "¡Cuenta creada!";
            setTimeout(() => { window.location.href = '../../index.html'; }, 1500);
        }, 1500);
    },

    // ========================================================================
    // 3. UTILIDADES
    // ========================================================================
    setupPasswordToggles: () => {
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
    }
};

document.addEventListener('DOMContentLoaded', AuthService.init);