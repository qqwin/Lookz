const Weather = {
    temp: 0,
    
    async init() {
        try {
            const resp = await fetch('https://api.open-meteo.com/v1/forecast?latitude=55.75&longitude=37.61&daily=temperature_2m_max&timezone=auto');
            const data = await resp.json();
            this.temp = Math.round(data.daily.temperature_2m_max[0]);
        } catch (e) { this.temp = 20; }
    },

    showTip() {
        const bubble = document.getElementById('drobi-tip-bubble');
        const textEl = document.getElementById('weather-text');
        
        // Массив фраз, из которых Дроби будет выбирать случайную
        const phrases = [
            `На улице ${this.temp}°C.`,
            `У меня есть идея на сегодня! ✨`,
            `Как насчет нового образа?`,
            `Выглядишь отлично! 🧝`
        ];
        
        textEl.textContent = phrases[Math.floor(Math.random() * phrases.length)];
        bubble.classList.remove('hidden');

        // Автоматически прячем через 3 секунды
        setTimeout(() => bubble.classList.add('hidden'), 3000);
    }
};