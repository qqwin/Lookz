const Wardrobe = {
    currentCategory: 'all',
    currentTag: 'all',

    init() {
        // Категории
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.cat;
                this.render();
            });
        });

        // Теги
        document.querySelectorAll('.tag-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tag-filter').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTag = e.target.dataset.tag;
                this.render();
            });
        });

        document.getElementById('btn-add-item').addEventListener('click', () => AddItem.open());
    },

    render() {
        const grid = document.getElementById('wardrobe-grid');
        if (!grid) return;

        const items = this.getFilteredItems();
        
        // Очищаем перед рендером
        grid.innerHTML = ''; 

        if (items.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <img src="drobi_sad.png" alt="Дроби" style="width:120px; margin-bottom:16px;">
                    <p>Тут пока пусто.<br><strong>Добавь первую вещь!</strong></p>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'wardrobe-item';
            div.innerHTML = `<img src="${item.image}" alt="${item.name}" loading="lazy">`;
            div.addEventListener('click', () => ItemCard.open(item.id));
            grid.appendChild(div);
        });
    },

    getFilteredItems() {
        let items = Storage.getItems();
        if (this.currentCategory !== 'all') {
            items = items.filter(i => i.category === this.currentCategory);
        }
        if (this.currentTag !== 'all') {
            items = items.filter(i => i.tags && i.tags.includes(this.currentTag));
        }
        return items;
    }
};