/* ============================================
   ONBOARDING — Приветствие и мини-тур
   ============================================ */

const Onboarding = {
    currentSlide: 0,
    totalSlides: 3,

    init() {
        // Кнопка "Начать" на первом экране
        document.getElementById('btn-start-tour').addEventListener('click', () => {
            this.startTour();
        });

        // Кнопка "Дальше" в туре
        document.getElementById('btn-tour-next').addEventListener('click', () => {
            this.nextSlide();
        });
    },

    startTour() {
        App.showScreen('tour');
    },

    nextSlide() {
        this.currentSlide++;

        if (this.currentSlide >= this.totalSlides) {
            // Тур завершён
            this.completeTour();
            return;
        }

        // Показываем следующий слайд
        const slides = document.querySelectorAll('.tour-slide');
        const dots = document.querySelectorAll('.dot');

        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));

        slides[this.currentSlide].classList.add('active');
        dots[this.currentSlide].classList.add('active');

        // На последнем слайде меняем текст кнопки
        if (this.currentSlide === this.totalSlides - 1) {
            document.getElementById('btn-tour-next').textContent = 'Поехали! 🚀';
        }
    },

    completeTour() {
        Storage.setOnboarded();
        App.showScreen('wardrobe');
        App.showNav();
        App.showToast(Drobi.greeting());
    }
};