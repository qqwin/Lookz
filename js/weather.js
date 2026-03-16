const Weather = {
    temp: 20, // По умолчанию

    init() {
        // Пробуем получить геолокацию пользователя
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => this.fetchWeather(pos.coords.latitude, pos.coords.longitude),
                () => this.fetchWeather(55.75, 37.61) // Если отказал - Москва
            );
        } else {
            this.fetchWeather(55.75, 37.61);
        }
    },

    async fetchWeather(lat, lon) {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max&timezone=auto`;
            const resp = await fetch(url);
            const data = await resp.json();
            this.temp = Math.round(data.daily.temperature_2m_max[0]);
        } catch (e) {
            console.error("Ошибка погоды:", e);
        }
    },

    showTip() {
        const bubble = document.getElementById('drobi-tip-bubble');
        const textEl = document.getElementById('weather-text');
        
        // Расширенная библиотека состояний
        const tips = {
            freezing: [
                `На улице ${this.temp}°C. Только куртка! 🧥`,
                `Зима не хочет уходить, ${this.temp}°C. ❄️`
            ],
            cool: [
                `На улице ${this.temp}°C. Весеннее пальто — топ. 🧥`,
                `Прохладно, ${this.temp}°C. Накинь что-то сверху! 🧣`
            ],
            spring: [
                `Весенние ${this.temp}°C! Свитер будет в самый раз. 🧶`,
                `На улице ${this.temp}°C. Идеально для джинсовки! 👖`
            ],
            warm: [
                `Уже ${this.temp}°C! Можно гулять без куртки. 👕`,
                `Теплые ${this.temp}°C. Доставай легкую одежду! ✨`
            ],
            hot: [
                `Жара ${this.temp}°C! Время легких платьев и маек. 👗`,
                `При ${this.temp}°C хочется только мороженого! 🍦`
            ]
        };

        // Умная логика выбора (теперь 5 вариантов вместо 3)
        let category = 'spring'; 
        if (this.temp < 5) category = 'freezing';
        else if (this.temp < 12) category = 'cool';
        else if (this.temp >= 12 && this.temp < 18) category = 'spring';
        else if (this.temp >= 18 && this.temp < 25) category = 'warm';
        else category = 'hot';

        const arr = tips[category];
        textEl.textContent = arr[Math.floor(Math.random() * arr.length)];
        
        bubble.classList.remove('hidden');
        setTimeout(() => bubble.classList.add('hidden'), 4000);
    }
};