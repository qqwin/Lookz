/* ============================================
   SHARE — Шеринг луков (Версия: Максимальное качество + Native Share)
   ============================================ */

const Share = {
    currentLookId: null,
    lastGeneratedBlob: null,

    init() {
        const backdrop = document.querySelector('#modal-share .modal-backdrop');
        if (backdrop) backdrop.addEventListener('click', () => this.closeModal());

        document.getElementById('btn-share-image').addEventListener('click', () => this.downloadImage());
        document.getElementById('btn-share-copy').addEventListener('click', () => this.copyToClipboard());
        
        const btnCloseResult = document.getElementById('btn-close-share-result');
        if (btnCloseResult) {
            btnCloseResult.addEventListener('click', () => {
                document.getElementById('modal-share-result').classList.add('hidden');
            });
        }

        const btnNative = document.getElementById('btn-native-share');
        if (btnNative) {
            btnNative.addEventListener('click', () => this.openNativeShare());
        }
    },

    open(lookId) {
        this.currentLookId = lookId;
        document.getElementById('modal-share').classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('modal-share').classList.add('hidden');
    },

    async downloadImage() {
        const look = Storage.getLookById(this.currentLookId);
        if (!look) return;

        App.showToast('Создаю шедевр... 🎨');

        try {
            const W = 1080;
            const H = 1920;
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');

            // 1. Красивый градиентный фон
            const grad = ctx.createLinearGradient(0, 0, W, H);
            grad.addColorStop(0, '#FFF8F5');
            grad.addColorStop(0.5, '#FFFFFF');
            grad.addColorStop(1, '#FFF0EB');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // 2. Декоративные круги
            ctx.globalAlpha = 0.08;
            ctx.fillStyle = '#FFB5A7';
            ctx.beginPath(); ctx.arc(100, 200, 300, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(900, 1600, 250, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;

            // 3. Заголовок
            ctx.fillStyle = '#F4845F';
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('LOOKZ', W / 2, 120);

            // 4. Название лука (с обрезкой если длинное)
            ctx.fillStyle = '#2D2C2E';
            ctx.font = 'bold 52px sans-serif';
            let lookName = look.name;
            if (ctx.measureText(lookName).width > W - 120) {
                while (ctx.measureText(lookName + '...').width > W - 120 && lookName.length > 0) {
                    lookName = lookName.slice(0, -1);
                }
                lookName += '...';
            }
            ctx.fillText(lookName, W / 2, 200);

            // Линия-разделитель
            ctx.strokeStyle = '#FFB5A7';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(W/2 - 80, 240); ctx.lineTo(W/2 + 80, 240); ctx.stroke();

            // Зона отрисовки
            const zoneTop = 300; const zoneBottom = H - 280;
            const zoneHeight = zoneBottom - zoneTop;
            const zoneLeft = 80; const zoneRight = W - 80;
            const zoneWidth = zoneRight - zoneLeft;

            // 5. Загрузка вещей
            const loadPromises = look.items.map(li => {
                return new Promise(resolve => {
                    const item = Storage.getItemById(li.itemId);
                    if (!item) return resolve(null);
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => resolve({ img, li, item });
                    img.src = item.image;
                });
            });

            const loaded = (await Promise.all(loadPromises)).filter(Boolean);

            if (loaded.length > 0) {
                // Вычисляем границы для масштабирования
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                loaded.forEach(({ li }) => {
                    minX = Math.min(minX, li.x); minY = Math.min(minY, li.y);
                    maxX = Math.max(maxX, li.x + li.width); maxY = Math.max(maxY, li.y + li.height);
                });

                const contentW = maxX - minX || 300;
                const contentH = maxY - minY || 300;
                const padding = 60;
                const scaleX = (zoneWidth - padding * 2) / contentW;
                const scaleY = (zoneHeight - padding * 2) / contentH;
                const scale = Math.min(scaleX, scaleY, 4);

                const offsetX = zoneLeft + (zoneWidth - contentW * scale) / 2 - minX * scale;
                const offsetY = zoneTop + (zoneHeight - contentH * scale) / 2 - minY * scale;

                // 6. Отрисовка вещей с правильными пропорциями
                loaded.forEach(({ img, li }) => {
                    const boxX = li.x * scale + offsetX;
                    const boxY = li.y * scale + offsetY;
                    const boxW = li.width * scale;
                    const boxH = li.height * scale;

                    const imgRatio = img.width / img.height;
                    const boxRatio = boxW / boxH;
                    let dW, dH, dX, dY;

                    if (imgRatio > boxRatio) {
                        dW = boxW; dH = boxW / imgRatio;
                        dX = boxX; dY = boxY + (boxH - dH) / 2;
                    } else {
                        dH = boxH; dW = boxH * imgRatio;
                        dX = boxX + (boxW - dW) / 2; dY = boxY;
                    }

                    ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 15;
                    ctx.drawImage(img, dX, dY, dW, dH);
                    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
                });
            }

            // 7. Список названий вещей внизу
            const namesY = H - 180;
            ctx.fillStyle = '#9B9B9B'; ctx.font = '26px sans-serif';
            const itemNames = loaded.map(({ item }) => item.name).join('  •  ');
            if (ctx.measureText(itemNames).width > W - 100) {
                const half = Math.ceil(loaded.length / 2);
                const l1 = loaded.slice(0, half).map(({ item }) => item.name).join('  •  ');
                const l2 = loaded.slice(half).map(({ item }) => item.name).join('  •  ');
                ctx.fillText(l1, W / 2, namesY); ctx.fillText(l2, W / 2, namesY + 40);
            } else {
                ctx.fillText(itemNames, W / 2, namesY);
            }

            ctx.fillStyle = '#C4C4C4'; ctx.font = '24px sans-serif';
            ctx.fillText('🧝 собрано в LOOKZ', W / 2, H - 80);

            // 8. Конвертация в файл (Blob)
            canvas.toBlob(async (blob) => {
                this.lastGeneratedBlob = blob;
                const dataUrl = canvas.toDataURL('image/png', 1.0);
                
                const resultImg = document.getElementById('result-share-image');
                if (resultImg) {
                    resultImg.src = dataUrl;
                    this.closeModal();
                    document.getElementById('modal-share-result').classList.remove('hidden');
                    App.showToast('Готово! ✨');
                }
            }, 'image/png');

        } catch (error) {
            console.error('Share error:', error);
            App.showToast('Не удалось создать картинку 😔');
        }
    },

    async openNativeShare() {
        if (!this.lastGeneratedBlob) return;
        const file = new File([this.lastGeneratedBlob], 'my_look.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'Мой Лук',
                    text: 'Смотри, какой образ я собрал в Lookz! 🧝'
                });
            } catch (err) {
                console.log('User cancelled share');
            }
        } else {
            App.showToast('Твой браузер не поддерживает отправку файлов 😔');
        }
    },

    async copyToClipboard() {
        const look = Storage.getLookById(this.currentLookId);
        if (!look) return;
        let text = `✨ Мой лук: "${look.name}"\n\n`;
        look.items.forEach(li => {
            const item = Storage.getItemById(li.itemId);
            if (item) text += `• ${item.name}\n`;
        });
        text += `\n🧝 Собрано в Lookz`;

        try {
            await navigator.clipboard.writeText(text);
            this.closeModal();
            App.showToast('Текст скопирован! 📋');
        } catch (e) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.closeModal();
            App.showToast('Текст скопирован! 📋');
        }
    }
};