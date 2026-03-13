/* ============================================
   CONSTRUCTOR — Конструктор луков
   Drag & drop вещей на холст
   ============================================ */

const Constructor = {
    currentLook: null,
    canvasItems: [],
    dragState: null,
    activeCategory: null,

    init() {
        // Кнопка "Назад"
        document.getElementById('btn-back-constructor').addEventListener('click', () => {
            this.close();
        });

        // Кнопка "Сохранить"
        document.getElementById('btn-save-look').addEventListener('click', () => {
            this.saveLook();
        });

        // Боковые категории
        document.querySelectorAll('.side-cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleCategory(btn.dataset.cat);
            });
        });

        // Закрыть боковую панель при клике на холст
        document.getElementById('canvas-area').addEventListener('click', (e) => {
            if (e.target === document.getElementById('canvas-area') ||
                e.target === document.getElementById('canvas-hint')) {
                this.closeSideItems();
            }
        });
    },

    openNew() {
        this.currentLook = {
            name: 'Мой лук',
            items: []
        };
        this.canvasItems = [];
        document.getElementById('look-name').value = 'Мой лук';
        this.clearCanvas();
        this.closeSideItems();
        App.showScreen('constructor');
        App.hideNav();
    },

    openExisting(lookId) {
        const look = Storage.getLookById(lookId);
        if (!look) return;

        this.currentLook = JSON.parse(JSON.stringify(look));
        this.canvasItems = [];
        document.getElementById('look-name').value = look.name;
        this.clearCanvas();

        // Восстанавливаем вещи на холсте
        look.items.forEach(li => {
            const item = Storage.getItemById(li.itemId);
            if (item) {
                this.addToCanvas(item, li.x, li.y, li.width, li.height);
            }
        });

        this.closeSideItems();
        App.showScreen('constructor');
        App.hideNav();
    },

    close() {
        App.showScreen('looks');
        App.showNav();
        Looks.render();
    },

    clearCanvas() {
        const canvas = document.getElementById('canvas-area');
        canvas.querySelectorAll('.canvas-item').forEach(el => el.remove());
        const hint = document.getElementById('canvas-hint');
        if (hint) hint.classList.remove('hidden');
    },

    toggleCategory(cat) {
        const btns = document.querySelectorAll('.side-cat-btn');
        const panel = document.getElementById('side-items');

        if (this.activeCategory === cat) {
            this.closeSideItems();
            return;
        }

        this.activeCategory = cat;

        btns.forEach(b => b.classList.toggle('active', b.dataset.cat === cat));

        // Загружаем вещи этой категории
        const items = Storage.getItemsByCategory(cat);
        panel.innerHTML = '';

        if (items.length === 0) {
            panel.innerHTML = '<p style="text-align:center;color:#999;font-size:12px;padding:16px;">Пусто</p>';
        } else {
            items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'side-item';
                div.innerHTML = `<img src="${item.image}" alt="${item.name}">`;
                div.addEventListener('click', () => {
                    this.addToCanvas(item);
                    this.closeSideItems();
                });
                panel.appendChild(div);
            });
        }

        panel.classList.remove('hidden');
    },

    closeSideItems() {
        this.activeCategory = null;
        document.getElementById('side-items').classList.add('hidden');
        document.querySelectorAll('.side-cat-btn').forEach(b => b.classList.remove('active'));
    },

    addToCanvas(item, x, y, width, height) {
        const canvas = document.getElementById('canvas-area');
        const hint = document.getElementById('canvas-hint');
        if (hint) hint.classList.add('hidden');

        const defaultSize = 120;
        const canvasRect = canvas.getBoundingClientRect();

        const el = document.createElement('div');
        el.className = 'canvas-item';
        el.style.width = (width || defaultSize) + 'px';
        el.style.height = (height || defaultSize) + 'px';
        el.style.left = (x !== undefined ? x : (canvasRect.width / 2 - defaultSize / 2)) + 'px';
        el.style.top = (y !== undefined ? y : (canvasRect.height / 2 - defaultSize / 2)) + 'px';

        el.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <button class="remove-btn">×</button>
            <div class="resize-handle"></div>
        `;

        el.dataset.itemId = item.id;

        // Удаление с холста
        el.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            el.remove();
            this.updateCanvasItems();
            // Показать хинт если пусто
            if (!canvas.querySelector('.canvas-item')) {
                hint.classList.remove('hidden');
            }
        });

        // Выделение
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.canvas-item').forEach(ci => ci.classList.remove('selected'));
            el.classList.add('selected');
        });

        // Перетаскивание
        this.makeDraggable(el, canvas);

        // Ресайз
        this.makeResizable(el, canvas);

        canvas.appendChild(el);
        this.updateCanvasItems();
    },

    makeDraggable(el, canvas) {
        let startX, startY, origLeft, origTop;
        let isDragging = false;

        const onStart = (e) => {
            if (e.target.classList.contains('remove-btn') ||
                e.target.classList.contains('resize-handle')) return;

            isDragging = true;
            const touch = e.touches ? e.touches[0] : e;
            const rect = canvas.getBoundingClientRect();

            startX = touch.clientX;
            startY = touch.clientY;
            origLeft = parseInt(el.style.left) || 0;
            origTop = parseInt(el.style.top) || 0;

            el.style.zIndex = 100;
            document.querySelectorAll('.canvas-item').forEach(ci => ci.classList.remove('selected'));
            el.classList.add('selected');

            e.preventDefault();
        };

        const onMove = (e) => {
            if (!isDragging) return;
            const touch = e.touches ? e.touches[0] : e;

            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;

            el.style.left = (origLeft + dx) + 'px';
            el.style.top = (origTop + dy) + 'px';

            e.preventDefault();
        };

        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            el.style.zIndex = '';
            this.updateCanvasItems();
        };

        // Touch events
        el.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);

        // Mouse events
        el.addEventListener('mousedown', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
    },

    makeResizable(el, canvas) {
        const handle = el.querySelector('.resize-handle');
        let startX, startY, origW, origH;
        let isResizing = false;

        const onStart = (e) => {
            isResizing = true;
            const touch = e.touches ? e.touches[0] : e;
            startX = touch.clientX;
            startY = touch.clientY;
            origW = parseInt(el.style.width);
            origH = parseInt(el.style.height);
            e.preventDefault();
            e.stopPropagation();
        };

        const onMove = (e) => {
            if (!isResizing) return;
            const touch = e.touches ? e.touches[0] : e;
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            const delta = Math.max(dx, dy);
            const newSize = Math.max(50, origW + delta);
            el.style.width = newSize + 'px';
            el.style.height = newSize + 'px';
            e.preventDefault();
        };

        const onEnd = () => {
            if (!isResizing) return;
            isResizing = false;
            this.updateCanvasItems();
        };

        handle.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);

        handle.addEventListener('mousedown', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
    },

    updateCanvasItems() {
        const canvas = document.getElementById('canvas-area');
        const items = canvas.querySelectorAll('.canvas-item');
        this.canvasItems = [];

        items.forEach(el => {
            this.canvasItems.push({
                itemId: el.dataset.itemId,
                x: parseInt(el.style.left) || 0,
                y: parseInt(el.style.top) || 0,
                width: parseInt(el.style.width) || 120,
                height: parseInt(el.style.height) || 120
            });
        });
    },

    saveLook() {
        const name = document.getElementById('look-name').value.trim() || 'Мой лук';
        this.updateCanvasItems();

        if (this.canvasItems.length === 0) {
            App.showToast('Добавь хотя бы одну вещь на холст 👆');
            return;
        }

        if (this.currentLook.id) {
            // Обновляем существующий
            this.currentLook.name = name;
            this.currentLook.items = this.canvasItems;
            Storage.updateLook(this.currentLook);
        } else {
            // Создаём новый
            this.currentLook.name = name;
            this.currentLook.items = this.canvasItems;
            Storage.addLook(this.currentLook);
        }

        App.showToast(Drobi.getLookCreated());
        Profile.updateStats();
        this.close();
    }
};