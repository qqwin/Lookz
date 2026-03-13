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

                // Устанавливаем цвет хедера
                Telegram.WebApp.setHeaderColor('#FFF8F5');
                Telegram.WebApp.setBackgroundColor('#FFF8F5');
            }
        } catch (e) {
            console.log('Not in Telegram environment');
        }
    },

    showScreen(name) {
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.add('hidden');
        });

        // Показываем нужный
        const screen = document.getElementById('screen-' + name);
        if (screen) {
            screen.classList.remove('hidden');
            this.currentScreen = name;
        }

        // Обновляем контент при переходе
        if (name === 'wardrobe') Wardrobe.render();
        if (name === 'looks') Looks.render();
        if (name === 'profile') Profile.render();
    },

    navigate(screen) {
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

    showToast(message) {
        // Удаляем старый тост
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

// ============================================
// ЗАПУСК
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});