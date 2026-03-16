const Wardrobe = {
    currentCategory: 'all',
    currentTag: 'all',

    init() {
        // Слушаем категории
        document.querySelectorAll('.categories-scroll .cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.categories-scroll .cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.cat;
                this.render();
            });
        });

        // Слушаем теги
        document.querySelectorAll('.tags-scroll .tag-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tags-scroll .tag-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTag = btn.dataset.tag;
                this.render();
            });
        });

        document.getElementById('btn-add-item').addEventListener('click', () => AddItem.open());
    },

    render() {
        const grid = document.getElementById('wardrobe-grid');
        const items = this.getFilteredItems();

        if (items.length === 0) {
            grid.innerHTML = `<div class="empty-state"><p>Ничего не найдено...</p></div>`;
            return;
        }

        grid.innerHTML = items.map(item => `
            <div class="wardrobe-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
        `).join('');

        grid.querySelectorAll('.wardrobe-item').forEach(el => {
            el.addEventListener('click', () => ItemCard.open(el.dataset.id));
        });
    },

    getFilteredItems() {
        let items = Storage.getItems();
        
        // Фильтр по категории
        if (this.currentCategory !== 'all') {
            items = items.filter(i => i.category === this.currentCategory);
        }
        
        // Фильтр по тегу
        if (this.currentTag !== 'all') {
            items = items.filter(i => i.tags && i.tags.includes(this.currentTag));
        }
        
        return items;
    }
};