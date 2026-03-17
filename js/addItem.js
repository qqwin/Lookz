/* ============================================
   ADD ITEM — Добавление вещи
   ============================================ */

const AddItem = {
    selectedCategory: null,
    selectedTags: [], 
    processedImage: null,

    init() {
        const btnBack = document.getElementById('btn-back-add');
        if (btnBack) btnBack.addEventListener('click', () => this.close());

        // Кнопки выбора фото
        const btnGallery = document.getElementById('btn-gallery');
        const fileInput = document.getElementById('file-input');
        if (btnGallery && fileInput) {
            btnGallery.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleFile(e.target.files[0]));
        }

        const btnCamera = document.getElementById('btn-camera');
        const cameraInput = document.getElementById('camera-input');
        if (btnCamera && cameraInput) {
            btnCamera.addEventListener('click', () => cameraInput.click());
            cameraInput.addEventListener('change', (e) => this.handleFile(e.target.files[0]));
        }

        // Выбор основной категории
        document.querySelectorAll('#category-buttons .cat-select-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectCategory(btn.dataset.cat, btn));
        });

        // Выбор тегов стиля (несколько)
        document.querySelectorAll('#tag-buttons .tag-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag;
                if (btn.classList.contains('active')) {
                    btn.classList.remove('active');
                    this.selectedTags = this.selectedTags.filter(t => t !== tag);
                } else {
                    btn.classList.add('active');
                    this.selectedTags.push(tag);
                }
                App.haptic('light');
            });
        });

        const btnSave = document.getElementById('btn-save-item');
        if (btnSave) btnSave.addEventListener('click', () => this.saveItem());
    },

    open() {
        this.selectedCategory = null;
        this.selectedTags = [];
        this.processedImage = null;

        const nameInput = document.getElementById('item-name');
        if (nameInput) nameInput.value = '';

        // Очищаем визуальное выделение кнопок
        document.querySelectorAll('.cat-select-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));

        document.getElementById('add-step-photo').classList.remove('hidden');
        document.getElementById('add-step-processing').classList.add('hidden');
        document.getElementById('add-step-result').classList.add('hidden');

        App.showScreen('add-item');
    },

    close() {
        App.showScreen('wardrobe');
    },

    handleFile(file) {
        if (!file) return;
        document.getElementById('add-step-photo').classList.add('hidden');
        document.getElementById('add-step-processing').classList.remove('hidden');

        const processingText = document.getElementById('processing-text');
        if (processingText) processingText.textContent = Drobi.getProcessing();

        BgRemover.removeBackground(file).then(resultUrl => {
            this.processedImage = resultUrl;
            setTimeout(() => {
                document.getElementById('add-step-processing').classList.add('hidden');
                document.getElementById('add-step-result').classList.remove('hidden');
                document.getElementById('result-image').src = resultUrl;
                
                const db = document.getElementById('result-drobi-text');
                if(db) db.textContent = Drobi.getItemAdded();
            }, 300);
        }).catch(err => {
            App.showToast('Ошибка фона 😔');
            document.getElementById('add-step-processing').classList.add('hidden');
            document.getElementById('add-step-photo').classList.remove('hidden');
        });
    },

    selectCategory(category, btn) {
        this.selectedCategory = category;
        document.querySelectorAll('#category-buttons .cat-select-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        App.haptic('light');
    },

    saveItem() {
        if (!this.processedImage) { App.showToast('Нет фото! 📸'); return; }
        if (!this.selectedCategory) { App.showToast('Выбери категорию! 👆'); return; }

        const nameInput = document.getElementById('item-name');
        const item = {
            id: 'item_' + Date.now(),
            name: nameInput.value.trim() || 'Без названия',
            category: this.selectedCategory,
            tags: this.selectedTags,
            image: this.processedImage,
            createdAt: Date.now()
        };

        if (Storage.addItem(item)) {
            App.showToast('Вещь в шкафу! ✨');
            Wardrobe.render();
            App.showScreen('wardrobe');
        }
    }
};