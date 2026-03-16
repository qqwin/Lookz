/* ============================================
   CONSTRUCTOR — Умный Drag & Drop (Pinch-to-Zoom)
   ============================================ */

const Constructor = {
    currentLook: null,
    canvasItems: [],
    activeCategory: null,
    highestZIndex: 10,

    init() {
        document.getElementById('btn-back-constructor').addEventListener('click', () => this.close());
        document.getElementById('btn-save-look').addEventListener('click', () => this.saveLook());

        document.querySelectorAll('.side-cat-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleCategory(btn.dataset.cat));
        });

        // Снятие выделения при клике на пустой холст
        const canvas = document.getElementById('canvas-area');
        if (canvas) {
            canvas.addEventListener('click', (e) => {
                if (e.target === canvas || e.target.id === 'canvas-hint') {
                    this.closeSideItems();
                    document.querySelectorAll('.canvas-item').forEach(ci => ci.classList.remove('selected'));
                }
            });
        }
    },

    openNew() {
        this.currentLook = { name: 'Новый лук', items: [] };
        this.canvasItems = [];
        document.getElementById('look-name').value = 'Новый лук';
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

        look.items.forEach(li => {
            const item = Storage.getItemById(li.itemId);
            if (item) {
                this.addToCanvas(item, li.x, li.y, li.width, li.height, li.flipX || 1, li.zIndex || this.highestZIndex++);
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
        this.highestZIndex = 10;
    },

    toggleCategory(cat) {
        const panel = document.getElementById('side-items');
        if (this.activeCategory === cat) {
            this.closeSideItems();
            return;
        }

        this.activeCategory = cat;
        document.querySelectorAll('.side-cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));

        const items = Storage.getItemsByCategory(cat);
        panel.innerHTML = items.length === 0 
            ? '<p style="text-align:center;color:#999;font-size:12px;padding:16px;">Пусто</p>' 
            : '';

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

        panel.classList.remove('hidden');
    },

    closeSideItems() {
        this.activeCategory = null;
        document.getElementById('side-items').classList.add('hidden');
        document.querySelectorAll('.side-cat-btn').forEach(b => b.classList.remove('active'));
    },

    // ДОБАВЛЕНИЕ ВЕЩИ НА ХОЛСТ
    addToCanvas(item, x, y, width, height, flipX = 1, zIndex) {
        const canvas = document.getElementById('canvas-area');
        const hint = document.getElementById('canvas-hint');
        if (hint) hint.classList.add('hidden');

        // Увеличенный размер для телефонов
        const defaultSize = 240; 
        const canvasRect = canvas.getBoundingClientRect();

        const el = document.createElement('div');
        el.className = 'canvas-item selected';
        
        document.querySelectorAll('.canvas-item').forEach(ci => ci.classList.remove('selected'));

        el.style.width = (width || defaultSize) + 'px';
        el.style.height = (height || defaultSize) + 'px';
        el.style.left = (x !== undefined ? x : (canvasRect.width / 2 - defaultSize / 2)) + 'px';
        el.style.top = (y !== undefined ? y : (canvasRect.height / 2 - defaultSize / 2)) + 'px';
        
        const currentZ = zIndex || this.highestZIndex++;
        el.style.zIndex = currentZ;

        el.dataset.flipX = flipX;
        el.dataset.itemId = item.id;
        el.dataset.z = currentZ;

        // Никаких невидимых рамок, только картинка и тулбар
        el.innerHTML = `
            <img src="${item.image}" style="transform: scaleX(${flipX});">
            
            <div class="item-toolbar">
                <button class="toolbar-btn" data-action="flip">↔️</button>
                <button class="toolbar-btn" data-action="up">🔼</button>
                <button class="toolbar-btn" data-action="down">🔽</button>
                <button class="toolbar-btn delete" data-action="delete">🗑️</button>
            </div>
        `;

        // ОБРАБОТКА КНОПОК ТУЛБАРА
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const btn = e.target.closest('.toolbar-btn');
            if (btn) {
                const action = btn.dataset.action;
                
                if (action === 'delete') {
                    el.remove();
                    if (!canvas.querySelector('.canvas-item') && hint) hint.classList.remove('hidden');
                } 
                else if (action === 'flip') {
                    let currentFlip = parseInt(el.dataset.flipX) || 1;
                    currentFlip = currentFlip * -1; 
                    el.dataset.flipX = currentFlip;
                    el.querySelector('img').style.transform = `scaleX(${currentFlip})`;
                }
                else if (action === 'up') {
                    this.highestZIndex++;
                    el.dataset.z = this.highestZIndex;
                    el.style.zIndex = this.highestZIndex;
                }
                else if (action === 'down') {
                    let z = parseInt(el.dataset.z) || 1;
                    if (z > 1) {
                        z--;
                        el.dataset.z = z;
                        el.style.zIndex = z;
                    }
                }
                this.updateCanvasItems();
                return;
            }

            // Выделение вещи
            document.querySelectorAll('.canvas-item').forEach(ci => ci.classList.remove('selected'));
            el.classList.add('selected');
        });

        // ПОДКЛЮЧАЕМ МУЛЬТИТАЧ (ЗУМ И ДРАГ)
        this.makeInteractable(el, canvas);

        canvas.appendChild(el);
        this.updateCanvasItems();
    },

    // УНИВЕРСАЛЬНАЯ ФУНКЦИЯ: ТОЛЬКО 1 ПАЛЕЦ (ПЕРЕМЕЩЕНИЕ) ИЛИ 2 ПАЛЬЦА (ЗУМ)
    makeInteractable(el, canvas) {
        let isDragging = false;
        let isPinching = false;
        
        let startX, startY;
        let origLeft, origTop, origWidth, origHeight;
        let initialDistance = 0;

        const getDistance = (touches) => {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        const onStart = (e) => {
            if (e.target.closest('.item-toolbar')) return;
App.haptic('light');
            document.querySelectorAll('.canvas-item').forEach(ci => ci.classList.remove('selected'));
            el.classList.add('selected');

            origLeft = parseInt(el.style.left) || 0;
            origTop = parseInt(el.style.top) || 0;
            origWidth = parseInt(el.style.width) || 240;
            origHeight = parseInt(el.style.height) || 240;

            if (e.touches && e.touches.length === 2) {
                // Включен мультитач (Зум)
                isPinching = true;
                initialDistance = getDistance(e.touches);
                e.preventDefault();
            } else {
                // Перетаскивание одним пальцем (или мышкой)
                isDragging = true;
                const touch = e.touches ? e.touches[0] : e;
                startX = touch.clientX;
                startY = touch.clientY;
            }
        };

        const onMove = (e) => {
            if (!isDragging && !isPinching) return;
            e.preventDefault();

            if (isPinching && e.touches && e.touches.length === 2) {
                // Логика Зума двумя пальцами
                const currentDistance = getDistance(e.touches);
                const scale = currentDistance / initialDistance;
                
                const newSize = Math.max(100, origWidth * scale); // Не даем уменьшить меньше 100px
                
                // Чтобы вещь увеличивалась из центра
                const diff = (newSize - origWidth) / 2;
                
                el.style.width = newSize + 'px';
                el.style.height = newSize + 'px';
                el.style.left = (origLeft - diff) + 'px';
                el.style.top = (origTop - diff) + 'px';
            } 
            else if (isDragging) {
                // Логика Перетаскивания одним пальцем
                const touch = e.touches ? e.touches[0] : e;
                const dx = touch.clientX - startX;
                const dy = touch.clientY - startY;

                el.style.left = (origLeft + dx) + 'px';
                el.style.top = (origTop + dy) + 'px';
            }
        };

        const onEnd = () => {
            isDragging = false;
            isPinching = false;
            this.updateCanvasItems();
        };

        el.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);

        el.addEventListener('mousedown', onStart);
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
                width: parseInt(el.style.width) || 240,
                height: parseInt(el.style.height) || 240,
                flipX: parseInt(el.dataset.flipX) || 1,
                zIndex: parseInt(el.dataset.z) || 10
            });
        });
    },

    saveLook() {
        const name = document.getElementById('look-name').value.trim() || 'Новый лук';
        this.updateCanvasItems();

        if (this.canvasItems.length === 0) {
            App.showToast('Добавь хотя бы одну вещь на холст 👆');
            return;
        }

        if (this.currentLook.id) {
            this.currentLook.name = name;
            this.currentLook.items = this.canvasItems;
            Storage.updateLook(this.currentLook);
        } else {
            this.currentLook.name = name;
            this.currentLook.items = this.canvasItems;
            Storage.addLook(this.currentLook);
        }

        App.showToast('Шедевр сохранен! 🎨');
        Profile.updateStats();
        this.close();
    }
};