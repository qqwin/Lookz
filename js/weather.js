const Weather = {
    temp: 0,
    async init() {
        try {
            const resp = await fetch('https://api.open-meteo.com/v1/forecast?latitude=55.75&longitude=37.61&daily=temperature_2m_max&timezone=auto');
            const data = await resp.json();
            // Берем только максимум (дневную температуру)
            this.temp = Math.round(data.daily.temperature_2m_max[0]);
        } catch (e) { this.temp = 20; }
    },
    showTip() {
        const bubble = document.getElementById('drobi-tip-bubble');
        const text = document.getElementById('weather-text');
        let msg = `Сегодня в среднем ${this.temp}°C. `;
        if (this.temp < 10) msg += "Одевайся теплее! 🧥";
        else if (this.temp < 20) msg += "Идеально для многослойности! 👕";
        else msg += "Надень что-то легкое! 👗";
        text.textContent = msg;
        bubble.classList.remove('hidden');
        setTimeout(() => bubble.classList.add('hidden'), 5000);
    }
};