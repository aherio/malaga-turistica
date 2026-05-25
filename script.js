let currentSlide = 0;

function changeSlide(direction) {
    const slides = document.querySelectorAll('.carousel-item');
    
    // Quitamos la clase 'active' de la imagen actual
    slides[currentSlide].classList.remove('active');
    
    // Calculamos la nueva posición
    currentSlide += direction;
    
    // Si nos pasamos del final, volvemos al principio
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    }
    
    // Si nos vamos antes del principio, vamos a la última
    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }
    
    // Añadimos la clase 'active' a la nueva imagen
    slides[currentSlide].classList.add('active');
}
// --- LÓGICA DE LA VENTANA MODAL DE CONTACTO ---
const modal = document.getElementById('modal-contacto');
const btnContacto = document.getElementById('btn-contacto');
const btnCerrarModal = document.querySelector('.close-modal');

// Abrir la ventana al hacer clic en CONTACTO
btnContacto.addEventListener('click', (e) => {
    e.preventDefault(); // Evita que la página salte
    modal.style.display = 'flex';
});

// Cerrar la ventana al hacer clic en la (X)
btnCerrarModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Cerrar la ventana si el cliente hace clic fuera del recuadro blanco
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});
