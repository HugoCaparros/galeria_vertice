/**
 * AUTH SERVICE
 * Ubicación: assets/js/services/auth.js
 * Misión: Gestionar Login, Registro y Logout interactuando con DataLoader.
 */

const AuthService = {

    // INICIALIZADOR: Se ejecuta al cargar la página
    init: () => {
        // 1. Detectar si estamos en la página de Login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', AuthService.handleLogin);
        }

        // 2. Detectar si estamos en la página de Registro
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', AuthService.handleRegister);
        }

        // 3. Activar los botones de "Ver contraseña" (ojitos)
        AuthService.setupPasswordToggles();
    },

    // ========================================================================
    // 1. LÓGICA DE LOGIN
    // ========================================================================
    handleLogin: async (e) => {
        e.preventDefault(); // Evita que la página se recargue sola
        
        // Referencias a los inputs (Asegúrate de que tus IDs en HTML coinciden)
        const emailInput = document.getElementById('email'); 
        const passInput = document.getElementById('password');
        const btn = e.target.querySelector('button[type="submit"]');
        
        // Elemento para mostrar errores (si no existe, lo creamos al vuelo)
        let errorMsg = document.getElementById('loginError');
        if (!errorMsg) {
            errorMsg = document.createElement('p');
            errorMsg.id = 'loginError';
            errorMsg.style.color = "#d9534f"; // Rojo error
            errorMsg.style.textAlign = "center";
            errorMsg.style.marginTop = "10px";
            e.target.appendChild(errorMsg);
        }

        // Feedback visual (Cargando...)
        const originalText = btn.textContent;
        btn.textContent = "Verificando...";
        btn.disabled = true;
        errorMsg.textContent = "";

        try {
            // A. Pedimos los usuarios al DataLoader (que lee usuarios.json)
            if (typeof DataLoader === 'undefined') throw new Error("DataLoader no cargado");
            
            const usuarios = await DataLoader.getUsuarios();
            
            // B. Buscamos coincidencia exacta
            const usuarioEncontrado = usuarios.find(u => 
                u.email.toLowerCase() === emailInput.value.trim().toLowerCase() && 
                u.password === passInput.value
            );

            if (usuarioEncontrado) {
                // C. ÉXITO: Guardamos sesión
                // Guardamos los datos del usuario en el navegador
                localStorage.setItem('usuario_logueado', JSON.stringify(usuarioEncontrado));

                // Cambio visual de éxito
                btn.style.backgroundColor = "#4CAF50"; // Verde
                btn.textContent = "¡Bienvenido!";
                
                // Redirección al Home (ajustando la ruta desde pages/auth/)
                setTimeout(() => {
                    window.location.href = '../../index.html'; 
                }, 1000);

            } else {
                // D. ERROR: No coincide
                throw new Error("Credenciales incorrectas");
            }

        } catch (error) {
            console.warn("Login fallido:", error);
            errorMsg.textContent = "❌ Usuario o contraseña incorrectos.";
            
            // Restaurar botón
            btn.textContent = originalText;
            btn.disabled = false;
            btn.style.backgroundColor = ""; // Volver al color original
        }
    },

    // ========================================================================
    // 2. LÓGICA DE REGISTRO (Simulado)
    // ========================================================================
    handleRegister: async (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('nombre');
        const emailInput = document.getElementById('email');
        const passInput = document.getElementById('password');
        const passConfirmInput = document.getElementById('confirmPassword');
        const btn = e.target.querySelector('button[type="submit"]');
        
        // Elemento de error
        let errorMsg = document.getElementById('registerError');
        if (!errorMsg) {
            errorMsg = document.createElement('p');
            errorMsg.id = 'registerError';
            errorMsg.style.color = "#d9534f";
            errorMsg.style.textAlign = "center";
            e.target.appendChild(errorMsg);
        }

        // Validación de contraseñas
        if (passConfirmInput && passInput.value !== passConfirmInput.value) {
            errorMsg.textContent = "⚠️ Las contraseñas no coinciden.";
            return;
        }

        // Feedback visual
        const originalText = btn.textContent;
        btn.textContent = "Registrando...";
        btn.disabled = true;

        // Simulamos petición al servidor (espera 1.5 segundos)
        setTimeout(() => {
            // Creamos un usuario nuevo objeto
            const nuevoUsuario = {
                id: Date.now(), // ID único basado en la hora
                nombre: nameInput.value,
                email: emailInput.value,
                password: passInput.value, // (En una app real esto no se guarda así)
                avatar: "../../assets/img/default-avatar.jpg", // Avatar por defecto
                rol: "usuario",
                handle: "@" + nameInput.value.replace(/\s+/g, '').toLowerCase()
            };

            // Lo guardamos directamente como logueado
            localStorage.setItem('usuario_logueado', JSON.stringify(nuevoUsuario));

            btn.style.backgroundColor = "#4CAF50";
            btn.textContent = "¡Cuenta creada!";
            
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 1500);

        }, 1500);
    },

    // ========================================================================
    // 3. UTILIDAD: Ver/Ocultar contraseña (Ojitos)
    // ========================================================================
    setupPasswordToggles: () => {
        // Busca cualquier elemento con la clase .show-pass-icon
        const icons = document.querySelectorAll('.show-pass-icon');
        
        icons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                // El input suele ser el hermano anterior en el HTML
                const input = e.target.previousElementSibling;
                
                if (input && input.tagName === 'INPUT') {
                    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                    input.setAttribute('type', type);
                    
                    // Cambiar icono (Dependiendo de si usas FontAwesome)
                    e.target.classList.toggle('fa-eye');
                    e.target.classList.toggle('fa-eye-slash');
                }
            });
        });
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', AuthService.init);