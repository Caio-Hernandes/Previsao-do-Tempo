document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const weatherForm = document.querySelector(".weatherForm");
    const cityInput = document.querySelector(".cityInput");
    const messageContainer = document.querySelector(".message-container");
    const weatherDisplay = document.querySelector(".weather-display");
    const body = document.body;
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    const apiKey = "d495de79acc7e548ce4caa5aa81a7a5b";

    // Verifica preferência do usuário ou armazenamento local
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme');
    
    // Aplica tema salvo ou preferência do sistema
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }

    // Carrega Jandira como padrão ao iniciar
    getWeatherData("Jandira")
        .then(data => displayWeatherInfo(data))
        .catch(error => console.error(error));

    // Alternar modo escuro
    darkModeToggle.addEventListener('click', () => {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateDarkModeIcon(isDarkMode);
        
        // Reaplica o tema de temperatura se sair do modo escuro
        if (!isDarkMode && weatherDisplay.style.display === "block") {
            const temp = document.querySelector('.tempDisplay').textContent;
            applyTemperatureTheme(parseInt(temp));
        }
    });

    weatherForm.addEventListener("submit", async event => {
        event.preventDefault();
        const city = cityInput.value.trim();
        
        if(!city) {
            displayError("Por favor escreva uma cidade");
            return;
        }
        
        try {
            const weatherData = await getWeatherData(city);
            displayWeatherInfo(weatherData);
        } catch(error) {
            console.error(error);
            displayError("Cidade não encontrada");
        }
    });

    async function getWeatherData(city) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`;
        const response = await fetch(apiUrl);
        
        if(!response.ok) {
            throw new Error("Não foi possível obter os dados");
        }
        
        return await response.json();
    }

    function displayWeatherInfo(data) {
        // Limpa mensagens de erro
        messageContainer.innerHTML = "";
        
        const { name: city, 
                main: { temp, humidity }, 
                weather: [{ description, id }] } = data;
        
        weatherDisplay.innerHTML = `
            <h2 class="cityDisplay">${city}</h2>
            <div class="tempDisplay">${Math.round(temp)}°C</div>
            <div class="weatherEmoji">${getWeatherEmoji(id)}</div>
            <div class="descDisplay">${description}</div>
            <div class="humidityDisplay">Umidade: ${humidity}%</div>
        `;
        
        // Aplica tema baseado na temperatura
        applyTemperatureTheme(temp);
        
        weatherDisplay.style.display = "block";
    }

    function getWeatherEmoji(weatherId) {
        if(weatherId >= 200 && weatherId < 300) return '⛈️';
        if(weatherId >= 300 && weatherId < 400) return '🌧️';
        if(weatherId >= 500 && weatherId < 600) return '🌧️';
        if(weatherId >= 600 && weatherId < 700) return '❄️';
        if(weatherId >= 700 && weatherId < 800) return '🌫️';
        if(weatherId === 800) return '☀️';
        if(weatherId >= 801 && weatherId < 810) return '☁️';
        return '🌈';
    }

    function displayError(message) {
        weatherDisplay.style.display = "none";
        messageContainer.innerHTML = `<p class="errorDisplay">${message}</p>`;
    }

    function applyTemperatureTheme(temp) {
        // Remove todas as classes de tema primeiro
        body.classList.remove('cold-theme', 'cool-theme', 'warm-theme', 'hot-theme');
        
        // Se estiver no modo escuro, não aplicamos os temas de temperatura
        if (!body.classList.contains('dark-mode')) {
            // Aplica o tema apropriado
            if(temp < 10) {
                body.classList.add('cold-theme');
            } else if(temp < 20) {
                body.classList.add('cool-theme');
            } else if(temp < 30) {
                body.classList.add('warm-theme');
            } else {
                body.classList.add('hot-theme');
            }
        }
    }

    function updateDarkModeIcon(isDarkMode) {
        const icon = darkModeToggle.querySelector('i');
        icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        darkModeToggle.innerHTML = isDarkMode 
            ? `<i class="fas fa-sun"></i> Modo Claro` 
            : `<i class="fas fa-moon"></i> Modo Escuro`;
    }
});