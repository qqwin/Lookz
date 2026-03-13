/* ============================================
   PROFILE — Экран профиля
   ============================================ */

const Profile = {

    init() {
        // Получаем данные из Telegram WebApp
        this.loadTelegramUser();
    },

    loadTelegramUser() {
        try {
            if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe) {
                const user = Telegram.WebApp.initDataUnsafe.user;
                if (user) {
                    const name = user.first_name + (user.last_name ? ' ' + user.last_name : '');
                    document.getElementById('profile-name').textContent = name;

                    if (user.photo_url) {
                        document.getElementById('profile-avatar').innerHTML =
                            `<img src="${user.photo_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
                    }
                }
            }
        } catch (e) {
            console.log('Not in Telegram WebApp');
        }
    },

    updateStats() {
        const items = Storage.getItems();
        const looks = Storage.getLooks();

        document.getElementById('stat-items').textContent = items.length;
        document.getElementById('stat-looks').textContent = looks.length;
    },

    render() {
        this.updateStats();

        // Рендерим луки в профиле
        const grid = document.getElementById('profile-looks-grid');
        const looks = Storage.getLooks();

        grid.innerHTML = '';

        if (looks.length === 0) {
            grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:40px 0;">Пока нет луков</p>';
            return;
        }

        looks.forEach(look => {
            const div = document.createElement('div');
            div.className = 'profile-look-item';

            let previewHTML = '';
            look.items.slice(0, 4).forEach(li => {
                const item = Storage.getItemById(li.itemId);
                if (item) {
                    previewHTML += `<img src="${item.image}" alt="">`;
                }
            });

            div.innerHTML = previewHTML || '<span style="font-size:24px;">✨</span>';

            div.addEventListener('click', () => {
                Constructor.openExisting(look.id);
            });

            grid.appendChild(div);
        });
    }
};