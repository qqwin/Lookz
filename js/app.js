/* ============================================
   APP — Главный контроллер приложения
   ============================================ */

const App = {
    currentScreen: null,

    init() {
        // Инициализируем все модули
        Onboarding.init();
        Wardrobe.init();
        AddItem.init();
        ItemCard.init();
        Looks.init();
        Constructor.init();
        Profile.init();
        Share.init();

        // Навигация
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.haptic('light'); // Легкая вибрация при клике на меню
                const target = btn.dataset.screen;
                this.navigate(target);
            });
        });

        // Telegram WebApp
        this.initTelegram();

        // Определяем стартовый экран
        if (Storage.isOnboarded()) {
            this.showScreen('wardrobe');
            this.showNav();
            Wardrobe.render();
        } else {
            this.showScreen('onboarding');
            this.hideNav();
        }
    },

    initTelegram() {
        try {
            if (window.Telegram && Telegram.WebApp) {
                Telegram.WebApp.ready();
                Telegram.WebApp.expand();

                // Устанавливаем цвет хедера под наш новый дизайн
                Telegram.WebApp.setHeaderColor('#FDFBF7');
                Telegram.WebApp.setBackgroundColor('#FDFBF7');
            }
        } catch (e) {
            console.log('Not in Telegram environment');
        }
    },

    // НОВАЯ ФУНКЦИЯ: Тактильная отдача (вибрация)
    haptic(style = 'light') {
        try {
            if (window.Telegram && Telegram.WebApp && Telegram.WebApp.HapticFeedback) {
                // style может быть: 'light', 'medium', 'heavy', 'success', 'warning', 'error'
                if (['light', 'medium', 'heavy'].includes(style)) {
                    Telegram.WebApp.HapticFeedback.impactOccurred(style);
                } else {
                    Telegram.WebApp.HapticFeedback.notificationOccurred(style);
                }
            }
        } catch (e) {
            // Игнорируем ошибки на ПК
        }
    },

    showScreen(name) {
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active'); // Убираем класс активного экрана
            
            // Ждем окончания анимации скрытия (0.3s) и делаем display: none
            setTimeout(() => {
                if (!s.classList.contains('active')) {
                    s.classList.add('hidden');
                }
            }, 300);
        });

        // Показываем нужный
        const screen = document.getElementById('screen-' + name);
        if (screen) {
            screen.classList.remove('hidden');
            // Маленькая задержка, чтобы CSS успел отработать появление
            setTimeout(() => {
                screen.classList.add('active');
            }, 10);
            
            this.currentScreen = name;
        }

        // Обновляем контент при переходе
        if (name === 'wardrobe') Wardrobe.render();
        if (name === 'looks') Looks.render();
        if (name === 'profile') Profile.render();
    },

    navigate(screen) {
        if (this.currentScreen === screen) return; // Не переключаем, если уже тут
        this.showScreen(screen);

        // Обновляем активную кнопку навигации
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.screen === screen);
        });
    },

    showNav() {
        document.getElementById('bottom-nav').classList.remove('hidden');
        document.getElementById('btn-add-item').classList.remove('hidden');
    },

    hideNav() {
        document.getElementById('bottom-nav').classList.add('hidden');
        document.getElementById('btn-add-item').classList.add('hidden');
    },

    showToast(message, type = 'success') {
        // Вибрация в зависимости от типа тоста
        this.haptic(type);

        const old = document.querySelector('.toast');
        if (old) old.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 2500);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});