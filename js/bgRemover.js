/* ============================================
   BG REMOVER — Удаление фона и жесткая оптимизация
   ============================================ */

const BgRemover = {

    API_KEY: 'crWRcpZpEZg9mWR9kavr2fuf',
    API_URL: 'https://api.remove.bg/v1.0/removebg',

    async removeBackground(file, onProgress) {
        // Шаг 1: Сжимаем фото перед отправкой (макс 600px для экономии трафика)
        if (onProgress) onProgress(10);
        const compressed = await this.compressImage(file, 600, 'image/jpeg');

        if (onProgress) onProgress(25);

        const formData = new FormData();
        formData.append('image_file', compressed);
        formData.append('size', 'auto');
        formData.append('format', 'png'); // remove.bg всегда отдаст PNG с прозрачностью

        if (onProgress) onProgress(40);

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'X-Api-Key': this.API_KEY
                },
                body: formData
            });

            if (onProgress) onProgress(70);

            if (!response.ok) {
                console.error('remove.bg error');
                return await this.fileToDataURL(file);
            }

            const blob = await response.blob();
            if (onProgress) onProgress(90);

            // Шаг 3: Сжимаем РЕЗУЛЬТАТ (PNG) в легкий WEBP, чтобы влезло в localStorage
            const dataUrl = await this.compressResultToWebp(blob, 600);
            if (onProgress) onProgress(100);

            return dataUrl;

        } catch (error) {
            console.error('BgRemover fetch error:', error);
            return await this.fileToDataURL(file);
        }
    },

    // Первичное сжатие перед отправкой на сервер
    compressImage(file, maxSize, type = 'image/png') {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                let w = img.width;
                let h = img.height;

                if (w > maxSize || h > maxSize) {
                    if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; } 
                    else { w = Math.round(w * maxSize / h); h = maxSize; }
                }

                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0, w, h);

                canvas.toBlob((blob) => {
                    resolve(blob || file);
                }, type, 0.8);
            };
            img.onerror = () => resolve(file);
            img.src = URL.createObjectURL(file);
        });
    },

    // Экстремальное сжатие результата с сохранением прозрачности (WEBP)
    compressResultToWebp(blob, maxSize) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                let w = img.width;
                let h = img.height;

                if (w > maxSize || h > maxSize) {
                    if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; } 
                    else { w = Math.round(w * maxSize / h); h = maxSize; }
                }

                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0, w, h);

                // WEBP весит копейки и поддерживает прозрачность
                const dataUrl = canvas.toDataURL('image/webp', 0.8);
                resolve(dataUrl);
            };
            img.onerror = () => resolve('');
            img.src = URL.createObjectURL(blob);
        });
    },

    fileToDataURL(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }
};