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