/* ============================================
   LOOKS — Список луков
   ============================================ */

const Looks = {

    init() {
        // Кнопка "Новый лук"
        document.getElementById('btn-new-look').addEventListener('click', () => {
            Constructor.openNew();
        });
    },

    render() {
        const grid = document.getElementById('looks-grid');
        const looks = Storage.getLooks();

        grid.innerHTML = '';

        if (looks.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="drobi-character">🧝</div>
                    <p>${Drobi.getEmptyLooks()}</p>
                </div>
            `;
            return;
        }

        looks.forEach(look => {
            const card = document.createElement('div');
            card.className = 'look-card';

            // Превью — показываем до 4 вещей
            let previewHTML = '';
            const previewItems = look.items.slice(0, 4);
            previewItems.forEach(li => {
                const item = Storage.getItemById(li.itemId);
                if (item) {
                    previewHTML += `<img src="${item.image}" alt="">`;
                }
            });

            card.innerHTML = `
                <div class="look-card-preview">
                    ${previewHTML || '<span style="color:#ccc;font-size:32px;">✨</span>'}
                </div>
                <div class="look-card-footer">
                    <span class="look-card-name">${look.name}</span>
                    <div class="look-card-actions">
                        <button class="look-action-btn btn-share-look" data-id="${look.id}">📤</button>
                        <button class="look-action-btn btn-delete-look" data-id="${look.id}">🗑️</button>
                    </div>
                </div>
            `;

            // Клик по карточке — открыть конструктор
            card.querySelector('.look-card-preview').addEventListener('click', () => {
                Constructor.openExisting(look.id);
            });

            // Кнопка шеринга
            card.querySelector('.btn-share-look').addEventListener('click', (e) => {
                e.stopPropagation();
                Share.open(look.id);
            });

            // Кнопка удаления
            card.querySelector('.btn-delete-look').addEventListener('click', (e) => {
                e.stopPropagation();
                this.confirmDelete(look.id);
            });

            grid.appendChild(card);
        });
    },

    confirmDelete(lookId) {
        if (confirm('Удалить этот лук?')) {
            Storage.deleteLook(lookId);
            this.render();
            App.showToast('Лук удалён 🗑️');
            Profile.updateStats();
        }
    }
};