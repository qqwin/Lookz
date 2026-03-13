/* ============================================
   SHARE — Шеринг луков (Адаптировано для Telegram)
   ============================================ */

const Share = {
    currentLookId: null,

    init() {
        // Закрытие первого модала (выбор действия)
        const backdrop = document.querySelector('#modal-share .modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Кнопка "Скачать картинку"
        const btnImage = document.getElementById('btn-share-image');
        if (btnImage) {
            btnImage.addEventListener('click', () => {
                this.downloadImage();
            });
        }

        // Кнопка "Скопировать"
        const btnCopy = document.getElementById('btn-share-copy');
        if (btnCopy) {
            btnCopy.addEventListener('click', () => {
                this.copyToClipboard();
            });
        }

        // НОВОЕ: Закрытие окна с готовой картинкой
        const btnCloseResult = document.getElementById('btn-close-share-result');
        if (btnCloseResult) {
            btnCloseResult.addEventListener('click', () => {
                document.getElementById('modal-share-result').classList.add('hidden');
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

        App.showToast('Рисую лук... ⏳');

        try {
            // Формат сторис 1080×1920
            const W = 1080;
            const H = 1920;

            const canvas = document.createElement('canvas');
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext('2d');

            // Градиентный фон
            const grad = ctx.createLinearGradient(0, 0, W, H);
            grad.addColorStop(0, '#FFF8F5');
            grad.addColorStop(0.5, '#FFFFFF');
            grad.addColorStop(1, '#FFF0EB');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // Декоративные круги
            ctx.globalAlpha = 0.08;
            ctx.fillStyle = '#FFB5A7';
            ctx.beginPath();
            ctx.arc(100, 200, 300, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(900, 1600, 250, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Заголовок «LOOKZ»
            ctx.fillStyle = '#F4845F';
            ctx.font = 'bold 36px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('LOOKZ', W / 2, 120);

            // Название лука
            ctx.fillStyle = '#2D2C2E';
            ctx.font = 'bold 52px -apple-system, sans-serif';
            ctx.textAlign = 'center';

            let lookName = look.name;
            if (ctx.measureText(lookName).width > W - 120) {
                while (ctx.measureText(lookName + '...').width > W - 120 && lookName.length > 0) {
                    lookName = lookName.slice(0, -1);
                }
                lookName += '...';
            }
            ctx.fillText(lookName, W / 2, 200);

            // Линия
            ctx.strokeStyle = '#FFB5A7';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(W / 2 - 80, 240);
            ctx.lineTo(W / 2 + 80, 240);
            ctx.stroke();

            const zoneTop = 300;
            const zoneBottom = H - 280;
            const zoneHeight = zoneBottom - zoneTop;
            const zoneLeft = 80;
            const zoneRight = W - 80;
            const zoneWidth = zoneRight - zoneLeft;

            // Загружаем картинки
            const loadPromises = look.items.map(li => {
                return new Promise((resolve) => {
                    const item = Storage.getItemById(li.itemId);
                    if (!item) { resolve(null); return; }

                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => resolve({ img, li, item });
                    img.onerror = () => resolve(null);
                    img.src = item.image;
                });
            });

            const loaded = (await Promise.all(loadPromises)).filter(Boolean);

            if (loaded.length > 0) {
                let minX = Infinity, minY = Infinity;
                let maxX = -Infinity, maxY = -Infinity;

                loaded.forEach(({ li }) => {
                    minX = Math.min(minX, li.x);
                    minY = Math.min(minY, li.y);
                    maxX = Math.max(maxX, li.x + li.width);
                    maxY = Math.max(maxY, li.y + li.height);
                });

                const contentW = maxX - minX || 300;
                const contentH = maxY - minY || 300;

                const padding = 60;
                const scaleX = (zoneWidth - padding * 2) / contentW;
                const scaleY = (zoneHeight - padding * 2) / contentH;
                const scale = Math.min(scaleX, scaleY, 4);

                const offsetX = zoneLeft + (zoneWidth - contentW * scale) / 2 - minX * scale;
                const offsetY = zoneTop + (zoneHeight - contentH * scale) / 2 - minY * scale;

                loaded.forEach(({ img, li }) => {
                    const boxX = li.x * scale + offsetX;
                    const boxY = li.y * scale + offsetY;
                    const boxW = li.width * scale;
                    const boxH = li.height * scale;

                    const imgRatio = img.width / img.height;
                    const boxRatio = boxW / boxH;

                    let drawW, drawH, drawX, drawY;

                    if (imgRatio > boxRatio) {
                        drawW = boxW;
                        drawH = boxW / imgRatio;
                        drawX = boxX;
                        drawY = boxY + (boxH - drawH) / 2;
                    } else {
                        drawH = boxH;
                        drawW = boxH * imgRatio;
                        drawX = boxX + (boxW - drawW) / 2;
                        drawY = boxY;
                    }

                    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
                    ctx.shadowBlur = 30;
                    ctx.shadowOffsetY = 15;

                    ctx.drawImage(img, drawX, drawY, drawW, drawH);

                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetY = 0;
                });
            }

            const namesY = H - 180;
            ctx.fillStyle = '#9B9B9B';
            ctx.font = '26px -apple-system, sans-serif';
            ctx.textAlign = 'center';

            const itemNames = loaded.map(({ item }) => item.name).join('  •  ');
            if (ctx.measureText(itemNames).width > W - 100) {
                const half = Math.ceil(loaded.length / 2);
                const line1 = loaded.slice(0, half).map(({ item }) => item.name).join('  •  ');
                const line2 = loaded.slice(half).map(({ item }) => item.name).join('  •  ');
                ctx.fillText(line1, W / 2, namesY);
                ctx.fillText(line2, W / 2, namesY + 40);
            } else {
                ctx.fillText(itemNames, W / 2, namesY);
            }

            ctx.fillStyle = '#C4C4C4';
            ctx.font = '24px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🧝 собрано в LOOKZ', W / 2, H - 80);

            // ===== ИЗМЕНЕНИЯ ЗДЕСЬ =====
            // Превращаем холст в картинку
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            
            // Вставляем картинку в наше новое окошко
            const resultImg = document.getElementById('result-share-image');
            if (resultImg) {
                resultImg.src = dataUrl;
                
                // Закрываем старое меню и открываем окно с картинкой
                this.closeModal();
                document.getElementById('modal-share-result').classList.remove('hidden');
                
                App.showToast('Готово! ✨ Зажми картинку пальцем');
            }

        } catch (error) {
            console.error('Share error:', error);
            App.showToast('Не удалось создать картинку 😔');
        }
    },

    async copyToClipboard() {
        const look = Storage.getLookById(this.currentLookId);
        if (!look) return;

        let text = `✨ Мой лук: "${look.name}"\n\n`;

        look.items.forEach(li => {
            const item = Storage.getItemById(li.itemId);
            if (item) {
                text += `• ${item.name}\n`;
            }
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