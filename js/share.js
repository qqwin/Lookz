/* ============================================
   SHARE — Шеринг луков (Финальная полная версия)
   ============================================ */

const Share = {
    currentLookId: null,
    lastGeneratedBlob: null,

    init() {
        console.log("Lookz: Инициализация Share...");

        // Закрытие первого модала
        const backdrop = document.querySelector('#modal-share .modal-backdrop');
        if (backdrop) backdrop.addEventListener('click', () => this.closeModal());

        document.getElementById('btn-share-image').addEventListener('click', () => this.downloadImage());
        document.getElementById('btn-share-copy').addEventListener('click', () => this.copyToClipboard());
        
        // Закрытие финального окна
        const btnClose = document.getElementById('btn-close-share-result');
        if (btnClose) {
            btnClose.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('modal-share-result').classList.add('hidden');
            });
        }

        // Синяя кнопка "Сохранить"
        const btnNative = document.getElementById('btn-native-share');
        if (btnNative) {
            btnNative.addEventListener('click', (e) => {
                e.preventDefault();
                this.openNativeShare();
            });
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

        App.showToast('Рисую твой образ... 🎨');

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

            // 2. Декоративные круги (Дроби-стиль)
            ctx.globalAlpha = 0.08;
            ctx.fillStyle = '#FFB5A7';
            ctx.beginPath(); ctx.arc(150, 250, 350, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(950, 1650, 300, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;

            // 3. Заголовок
            ctx.fillStyle = '#F4845F';
            ctx.font = 'bold 38px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('LOOKZ', W / 2, 120);

            // 4. Название лука (с проверкой длины)
            ctx.fillStyle = '#2D2C2E';
            ctx.font = 'bold 56px sans-serif';
            let lookName = look.name || "Мой образ";
            if (ctx.measureText(lookName).width > W - 140) {
                while (ctx.measureText(lookName + '...').width > W - 140 && lookName.length > 0) {
                    lookName = lookName.slice(0, -1);
                }
                lookName += '...';
            }
            ctx.fillText(lookName, W / 2, 210);

            // Тонкая линия под заголовком
            ctx.strokeStyle = '#FFB5A7';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(W/2 - 100, 250); ctx.lineTo(W/2 + 100, 250); ctx.stroke();

            // Зона для вещей
            const zoneTop = 320; 
            const zoneBottom = H - 320;
            const zoneHeight = zoneBottom - zoneTop;
            const zoneWidth = W - 160;
            const zoneLeft = 80;

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
                // Масштабирование
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                loaded.forEach(({ li }) => {
                    minX = Math.min(minX, li.x); minY = Math.min(minY, li.y);
                    maxX = Math.max(maxX, li.x + li.width); maxY = Math.max(maxY, li.y + li.height);
                });

                const contentW = maxX - minX || 300;
                const contentH = maxY - minY || 300;
                const scale = Math.min((zoneWidth - 80) / contentW, (zoneHeight - 80) / contentH, 4);

                const offsetX = zoneLeft + (zoneWidth - contentW * scale) / 2 - minX * scale;
                const offsetY = zoneTop + (zoneHeight - contentH * scale) / 2 - minY * scale;

                // Рисуем каждую вещь с тенями и пропорциями
                loaded.forEach(({ img, li }) => {
                    const boxW = li.width * scale;
                    const boxH = li.height * scale;
                    const boxX = li.x * scale + offsetX;
                    const boxY = li.y * scale + offsetY;

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

                    // Мягкая тень под каждой вещью
                    ctx.shadowColor = 'rgba(0,0,0,0.12)';
                    ctx.shadowBlur = 35;
                    ctx.shadowOffsetY = 15;
                    ctx.drawImage(img, dX, dY, dW, dH);
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                });

                // 6. Состав лука (названия вещей внизу)
                const namesY = H - 220;
                ctx.fillStyle = '#9B9B9B';
                ctx.font = '28px sans-serif';
                const namesText = loaded.map(l => l.item.name).join('  •  ');
                
                if (ctx.measureText(namesText).width > W - 120) {
                    const half = Math.ceil(loaded.length / 2);
                    const line1 = loaded.slice(0, half).map(l => l.item.name).join('  •  ');
                    const line2 = loaded.slice(half).map(l => l.item.name).join('  •  ');
                    ctx.fillText(line1, W / 2, namesY);
                    ctx.fillText(line2, W / 2, namesY + 45);
                } else {
                    ctx.fillText(namesText, W / 2, namesY);
                }
            }

            // Водяной знак
            ctx.fillStyle = '#C4C4C4';
            ctx.font = '26px sans-serif';
            ctx.fillText('🧝 собрано в LOOKZ', W / 2, H - 90);

            // 7. Превращаем в файл для сохранения
            canvas.toBlob((blob) => {
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
            console.error("Ошибка при создании картинки:", error);
            App.showToast('Упс! Не удалось собрать картинку 😔');
        }
    },

    async openNativeShare() {
        if (!this.lastGeneratedBlob) return;
        
        try {
            const file = new File([this.lastGeneratedBlob], 'my_lookz.png', { type: 'image/png' });
            
            if (navigator.share) {
                await navigator.share({
                    files: [file],
                    title: 'Мой образ в Lookz',
                    text: 'Смотри, какой лук я собрал! 🧝'
                });
            } else {
                App.showToast('Браузер не поддерживает отправку файлов 😔');
            }
        } catch (err) {
            console.log("Шеринг отменен");
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
            App.showToast('Состав лука скопирован! 📋');
        } catch (e) {
            App.showToast('Не удалось скопировать 😔');
        }
    }
};