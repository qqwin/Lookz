/* ============================================
   ITEM CARD — Карточка отдельной вещи (с тегами)
   ============================================ */

const ItemCard = {
    currentItemId: null,
    editSelectedCategory: null,
    editSelectedTags: [],           // массив выбранных тегов при редактировании

    init() {
        // Кнопка "Назад"
        const btnBack = document.getElementById('btn-back-item');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                App.showScreen('wardrobe');
            });
        }

        // ======= УДАЛЕНИЕ =======
        const btnDelete = document.getElementById('btn-delete-item');
        if (btnDelete) {
            btnDelete.addEventListener('click', () => {
                this.showDeleteModal();
            });
        }

        const btnDeleteCancel = document.getElementById('btn-delete-cancel');
        if (btnDeleteCancel) {
            btnDeleteCancel.addEventListener('click', () => {
                document.getElementById('modal-delete').classList.add('hidden');
            });
        }

        const btnDeleteConfirm = document.getElementById('btn-delete-confirm');
        if (btnDeleteConfirm) {
            btnDeleteConfirm.addEventListener('click', () => {
                this.deleteItem();
            });
        }

        const modalDeleteBackdrop = document.querySelector('#modal-delete .modal-backdrop');
        if (modalDeleteBackdrop) {
            modalDeleteBackdrop.addEventListener('click', () => {
                document.getElementById('modal-delete').classList.add('hidden');
            });
        }

        // ======= РЕДАКТИРОВАНИЕ =======
        const btnEdit = document.getElementById('btn-edit-item');
        if (btnEdit) {
            btnEdit.addEventListener('click', () => {
                this.showEditModal();
            });
        }

        const btnEditCancel = document.getElementById('btn-edit-cancel');
        if (btnEditCancel) {
            btnEditCancel.addEventListener('click', () => {
                document.getElementById('modal-edit').classList.add('hidden');
            });
        }

        const btnEditConfirm = document.getElementById('btn-edit-confirm');
        if (btnEditConfirm) {
            btnEditConfirm.addEventListener('click', () => {
                this.saveEdit();
            });
        }

        const modalEditBackdrop = document.querySelector('#modal-edit .modal-backdrop');
        if (modalEditBackdrop) {
            modalEditBackdrop.addEventListener('click', () => {
                document.getElementById('modal-edit').classList.add('hidden');
            });
        }

        // Выбор категории в модалке редактирования
        const editCatBtns = document.querySelectorAll('#edit-category-buttons .cat-select-btn');
        editCatBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                editCatBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.editSelectedCategory = btn.dataset.cat;
            });
        });

        // ===== ВЫБОР ТЕГОВ В МОДАЛКЕ РЕДАКТИРОВАНИЯ =====
        const editTagContainer = document.getElementById('edit-tags-buttons');
        if (editTagContainer) {
            editTagContainer.querySelectorAll('.tag-filter').forEach(btn => {
                btn.addEventListener('click', () => {
                    btn.classList.toggle('active');
                    const tag = btn.dataset.tag;
                    if (btn.classList.contains('active')) {
                        if (!this.editSelectedTags.includes(tag)) {
                            this.editSelectedTags.push(tag);
                        }
                    } else {
                        this.editSelectedTags = this.editSelectedTags.filter(t => t !== tag);
                    }
                });
            });
        }
    },

    open(itemId) {
        this.currentItemId = itemId;
        const item = Storage.getItemById(itemId);

        if (!item) return;

        document.getElementById('item-title').textContent = item.name;
        document.getElementById('item-full-image').src = item.image;
        document.getElementById('item-category-label').textContent = this.getCategoryLabel(item.category);

        // Считаем в скольких луках используется
        const looks = Storage.getLooks();
        const looksCount = looks.filter(look =>
            look.items.some(li => li.itemId === itemId)
        ).length;
        document.getElementById('item-looks-count').textContent =
            looksCount > 0 ? `Используется в ${looksCount} луках` : 'Пока не в луках';

        App.showScreen('item');
    },

    showDeleteModal() {
        document.querySelector('#modal-delete .modal-text').textContent = Drobi.getDeleteConfirm();
        document.getElementById('modal-delete').classList.remove('hidden');
    },

    deleteItem() {
        Storage.deleteItem(this.currentItemId);
        document.getElementById('modal-delete').classList.add('hidden');
        Wardrobe.render();
        App.showScreen('wardrobe');
        App.showToast('Вещь удалена 🗑️');
    },

    showEditModal() {
        const item = Storage.getItemById(this.currentItemId);
        if (!item) return;

        document.getElementById('edit-item-name').value = item.name;
        this.editSelectedCategory = item.category;
        this.editSelectedTags = item.tags ? [...item.tags] : [];   // загружаем текущие теги

        // Подсвечиваем текущую категорию
        document.querySelectorAll('#edit-category-buttons .cat-select-btn').forEach(btn => {
            if (btn.dataset.cat === item.category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Подсвечиваем текущие теги
        const tagBtns = document.querySelectorAll('#edit-tags-buttons .tag-filter');
        tagBtns.forEach(btn => {
            if (this.editSelectedTags.includes(btn.dataset.tag)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        document.getElementById('modal-edit').classList.remove('hidden');
    },

    saveEdit() {
        const newName = document.getElementById('edit-item-name').value.trim();
        if (!newName || !this.editSelectedCategory) {
            App.showToast('Заполни все поля!');
            return;
        }

        let items = Storage.getItems();
        const index = items.findIndex(i => i.id === this.currentItemId);

        if (index !== -1) {
            items[index].name = newName;
            items[index].category = this.editSelectedCategory;
            items[index].tags = this.editSelectedTags;   // сохраняем теги
            Storage.saveItems(items);

            // Обновляем UI карточки
            document.getElementById('item-title').textContent = newName;
            document.getElementById('item-category-label').textContent = this.getCategoryLabel(this.editSelectedCategory);
            // Можно также показать теги где-то, но пока не обязательно

            App.showToast('Готово! Сохранил ✨');
            Wardrobe.render(); // Обновляем сетку гардероба
        }

        document.getElementById('modal-edit').classList.add('hidden');
    },

    getCategoryLabel(cat) {
        const labels = {
            outerwear: '🧥 Верхняя одежда',
            top: '👕 Верх',
            bottom: '👖 Низ',
            dress: '👗 Платье',
            shoes: '👟 Обувь',
            bags: '👜 Сумка',
            accessories: '🧣 Аксессуар',
            jewelry: '💍 Украшение',
            eyewear: '🕶️ Очки',
            cosmetics: '💄 Косметика'
        };
        return labels[cat] || 'Вещь';
    }
};