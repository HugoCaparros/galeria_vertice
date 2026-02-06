document.addEventListener("DOMContentLoaded", () => {
    // 1. Manejo de enlaces de transición (Login <-> Register)
    const transitionLinks = document.querySelectorAll('.transition-link');

    transitionLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Evita la carga inmediata
            const targetUrl = link.getAttribute('href');

            // Añade la clase que hace el fade-out en CSS
            document.body.classList.add('fade-out');

            // Espera 400ms (lo que dura la transición CSS) y cambia de página
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 400);
        });
    });
});