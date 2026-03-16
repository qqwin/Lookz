/* ============================================
   ADD ITEM — Добавление вещи
   ============================================ */

const AddItem = {
    selectedCategory: null,
    processedImage: null,

    init() {
        // Кнопка "Назад"
        const btnBack = document.getElementById('btn-back-add');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                this.close();
            });
        }

        // Кнопки фото (Галерея и Камера)
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

        // Выбор категории
        const catBtns = document.querySelectorAll('#category-buttons .cat-select-btn');
        catBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectCategory(btn.dataset.cat, btn);
            });
        });

        // Кнопка Сохранить
        const btnSave = document.getElementById('btn-save-item');
        if (btnSave) {
            btnSave.addEventListener('click', () => {
                this.saveItem();
            });
        }
        init() {
        // ... (твои старые кнопки)

        // Инициализация кнопок тегов
        const tagBtns = document.querySelectorAll('.tag-btn');
        tagBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag;
                if (btn.classList.contains('active')) {
                    btn.classList.remove('active');
                    this.selectedTags = this.selectedTags.filter(t => t !== tag);
                } else {
                    btn.classList.add('active');
                    this.selectedTags.push(tag);
                }
            });
        });
    },
    },

    open() {
        this.selectedCategory = null;
        this.processedImage = null;

        const nameInput = document.getElementById('item-name');
        if (nameInput) nameInput.value = '';

        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';

        const cameraInput = document.getElementById('camera-input');
        if (cameraInput) cameraInput.value = '';

        const resultImg = document.getElementById('result-image');
        if (resultImg) resultImg.src = '';

        document.querySelectorAll('.category-buttons .cat-select-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const progressFill = document.getElementById('progress-fill');
        if (progressFill) progressFill.style.width = '0%';

        const step1 = document.getElementById('add-step-photo');
        const step2 = document.getElementById('add-step-processing');
        const step3 = document.getElementById('add-step-result');

        if (step1) step1.classList.remove('hidden');
        if (step2) step2.classList.add('hidden');
        if (step3) step3.classList.add('hidden');

        App.showScreen('add-item');
    },

    close() {
        App.showScreen('wardrobe');
    },

    handleFile(file) {
        if (!file) return;

        const step1 = document.getElementById('add-step-photo');
        const step2 = document.getElementById('add-step-processing');
        const step3 = document.getElementById('add-step-result');

        step1.classList.add('hidden');
        step2.classList.remove('hidden');

        // Рандомный текст Дроби
        const processingText = document.getElementById('processing-text');
        if (processingText) processingText.textContent = Drobi.getProcessing();

        let progress = 0;
        const progressFill = document.getElementById('progress-fill');
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            if (progressFill) progressFill.style.width = progress + '%';
        }, 200);

        BgRemover.removeBackground(file).then(resultUrl => {
            clearInterval(interval);
            if (progressFill) progressFill.style.width = '100%';

            this.processedImage = resultUrl;

            setTimeout(() => {
                step2.classList.add('hidden');
                step3.classList.remove('hidden');
                const resImg = document.getElementById('result-image');
                if (resImg) resImg.src = resultUrl;
                
                const drobiBubble = document.getElementById('result-drobi-text');
                if(drobiBubble) drobiBubble.textContent = Drobi.getItemAdded();
            }, 300);
        }).catch(err => {
            clearInterval(interval);
            console.error('Ошибка обработки:', err);
            App.showToast('Не удалось удалить фон 😔');
            step2.classList.add('hidden');
            step1.classList.remove('hidden');
        });
    },

    selectCategory(category, btn) {
        this.selectedCategory = category;
        document.querySelectorAll('.category-buttons .cat-select-btn').forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');
    },

    saveItem() {
        if (!this.processedImage) {
            App.showToast('Сначала сделай фото! 📸');
            return;
        }

        if (!this.selectedCategory) {
            App.showToast('Выбери категорию! 👆');
            return;
        }

        const nameInput = document.getElementById('item-name');
        const name = nameInput ? nameInput.value.trim() : '';

        // 1. Создаем объект с учетом тегов
        const item = {
            id: 'item_' + Date.now(),
            name: name || 'Без названия',
            category: this.selectedCategory,
            tags: this.selectedTags, // 2. Добавляем массив тегов
            image: this.processedImage,
            createdAt: Date.now()
        };

        const saved = Storage.addItem(item);
        
        if (saved) {
            this.processedImage = null;
            this.selectedCategory = null;
            this.selectedTags = []; // 3. Очищаем массив тегов после сохранения
            
            App.showToast('Вещь в шкафу! ✨');
            Wardrobe.render();
            App.showScreen('wardrobe');
        }
    }
};