/* ============================================
  WARDROBE — Экран гардероба
  ============================================ */

const Wardrobe = {

    currentCategory: 'all',

    init() {
        // Обработчики категорий
        document.querySelectorAll('.categories-scroll .cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.categories-scroll .cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.cat;
                this.render();
            });
        });

        // Кнопка добавления вещи (Плюс)
        const addBtn = document.getElementById('btn-add-item');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                // Важно вызывать open(), чтобы сбросить форму!
                AddItem.open(); 
            });
        }
    },

    render() {
        const grid = document.getElementById('wardrobe-grid');
        if (!grid) return;

        const items = this.getFilteredItems();

        if (items.length === 0) {
            const emptyText = this.currentCategory === 'all' 
                ? Drobi.getEmptyWardrobe() 
                : 'В этой категории пусто...';
                
            grid.innerHTML = `
                <div class="empty-state" id="empty-wardrobe">
                    <div class="drobi-character">🧝</div>
                    <p>${emptyText}<br><strong>Добавь новую вещь!</strong></p>
                </div>
            `;
            return;
        }

        grid.innerHTML = items.map(item => `
            <div class="wardrobe-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name || ''}" loading="lazy">
            </div>
        `).join('');

        // Клик по вещи — открыть карточку
        grid.querySelectorAll('.wardrobe-item').forEach(el => {
            el.addEventListener('click', () => {
                ItemCard.open(el.dataset.id);
            });
        });
    },

    getFilteredItems() {
        const all = Storage.getItems();
        if (this.currentCategory === 'all') return all;
        return all.filter(item => item.category === this.currentCategory);
    }
};