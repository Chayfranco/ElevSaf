document.addEventListener("DOMContentLoaded", function () {
    let slideIndex = 0;
    const slides = document.querySelector(".slides");
    const totalSlides = document.querySelectorAll(".slide").length;

    function showSlide(index) {
        slideIndex = index % totalSlides; // Garante que o índice nunca ultrapasse o número de slides
        const offset = -slideIndex * 100; // Move o slider corretamente
        slides.style.transform = `translateX(${offset}%)`;
    }

    function nextSlide() {
        showSlide(slideIndex + 1);
    }

    function prevSlide() {
        showSlide((slideIndex - 1 + totalSlides) % totalSlides);
    }

    // Alternância automática dos slides
    setInterval(nextSlide, 4500); // 3s de pausa + 1.5s de transição

    // Botões de navegação manual
    document.getElementById("prevSlide").addEventListener("click", prevSlide);
    document.getElementById("nextSlide").addEventListener("click", nextSlide);
});
