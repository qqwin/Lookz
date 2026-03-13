/* ============================================
   STORAGE — Хранение данных с защитой от переполнения
   ============================================ */

const Storage = {

    getItems() {
        const data = localStorage.getItem('lookz_items');
        return data ? JSON.parse(data) : [];
    },

    saveItems(items) {
        try {
            localStorage.setItem('lookz_items', JSON.stringify(items));
            return true;
        } catch (e) {
            console.error('Storage full:', e);
            App.showToast('Шкаф переполнен! 🥺 Удали пару старых вещей.');
            return false;
        }
    },

    addItem(item) {
        const items = this.getItems();
        item.id = Date.now().toString();
        item.createdAt = new Date().toISOString();
        items.push(item);
        
        // Пытаемся сохранить. Если ошибка - возвращаем null
        if (this.saveItems(items)) {
            return item;
        }
        return null;
    },

    getItemById(id) {
        const items = this.getItems();
        return items.find(i => i.id === id);
    },

    deleteItem(id) {
        let items = this.getItems();
        items = items.filter(i => i.id !== id);
        this.saveItems(items);

        let looks = this.getLooks();
        looks.forEach(look => {
            look.items = look.items.filter(li => li.itemId !== id);
        });
        this.saveLooks(looks);
    },

    getItemsByCategory(category) {
        const items = this.getItems();
        if (category === 'all') return items;
        return items.filter(i => i.category === category);
    },

    getLooks() {
        const data = localStorage.getItem('lookz_looks');
        return data ? JSON.parse(data) : [];
    },

    saveLooks(looks) {
        try {
            localStorage.setItem('lookz_looks', JSON.stringify(looks));
        } catch (e) {
            App.showToast('Нет места для сохранения лука 🥺');
        }
    },

    addLook(look) {
        const looks = this.getLooks();
        look.id = Date.now().toString();
        look.createdAt = new Date().toISOString();
        looks.push(look);
        this.saveLooks(looks);
        return look;
    },

    updateLook(look) {
        let looks = this.getLooks();
        const index = looks.findIndex(l => l.id === look.id);
        if (index !== -1) {
            looks[index] = look;
            this.saveLooks(looks);
        }
    },

    getLookById(id) {
        const looks = this.getLooks();
        return looks.find(l => l.id === id);
    },

    deleteLook(id) {
        let looks = this.getLooks();
        looks = looks.filter(l => l.id !== id);
        this.saveLooks(looks);
    },

    isOnboarded() {
        return localStorage.getItem('lookz_onboarded') === 'true';
    },

    setOnboarded() {
        localStorage.setItem('lookz_onboarded', 'true');
    }
};