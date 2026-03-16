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
        
        // Массив фраз с учетом температуры
        const tips = {
            cold: [
                `На улице ${this.temp}°C. Надень пуховик! 🧥`,
                `Брр, ${this.temp}°C! Не забудь шарф. 🧣`,
                `${this.temp}°C? Одевайся многослойно! 🧤`
            ],
            mild: [
                `Сегодня ${this.temp}°C. Погода — класс! 👕`,
                `На улице ${this.temp}°C, самое то для худи. 👟`,
                `Идеальные ${this.temp}°C для прогулки! ✨`
            ],
            hot: [
                `Ух, ${this.temp}°C! Надевай легкое. 👗`,
                `Сегодня жарко, ${this.temp}°C. Выбирай что-то дышащее! 👒`,
                `При ${this.temp}°C главное — комфорт! 😎`
            ]
        };

        // Логика выбора категории
        let category = 'mild';
        if (this.temp < 15) category = 'cold';
        if (this.temp > 22) category = 'hot';

        const arr = tips[category];
        textEl.textContent = arr[Math.floor(Math.random() * arr.length)];
        
        bubble.classList.remove('hidden');
        
        // Убираем пузырь через 4 секунды
        setTimeout(() => bubble.classList.add('hidden'), 4000);
    }
};