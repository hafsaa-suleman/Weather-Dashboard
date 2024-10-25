    const apiKey = '6e4c1d9353255062733d63e89603bd3a'; 
    const geminiApikey = 'AIzaSyCYqVkXg3IigGBO34wxE5iS6ZnEZ9tQqtE';

    const weatherTableBody = document.getElementById('weatherTableBody');
    const citySearch = document.getElementById('citySearch');
    const searchBtn = document.getElementById('searchBtn');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const cityInput = document.getElementById('citySearch');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    let forecastData = [];
    let originalForecastData = [];
    let currentPage = 1;
    const itemsPerPage = 10;
    let currentCity = null;
    
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        currentCity = city;
        if (city) {
            fetchWeatherData(city);
        }
    });

    
    async function fetchWeatherData(city) {
        loadingSpinner.style.display = 'flex';
        try {
            const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
            const response = await fetch(apiUrl);
            const data = await response.json();      
            if (data.cod === "200") {
                forecastData = data.list;
                originalForecastData = [...forecastData];
                currentPage = 1;
                console.log("City: " + city);
                displayWeatherTable();
            } else {
                // Handle different error cases based on 'cod'
                if (data.cod === "404") {
                    showError('City not found. Please check the city name and try again.');
                } else if (data.cod === "429") {
                    showError('API limit reached. Please try again later.');
                } else {
                    showError('Something went wrong. Please try again later.');
                }
                return;
            }
        } catch (error) {
            // Catch network errors or any unexpected errors
            console.error('Error fetching weather data:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }
    
    function showError(message) { 
        const errorBox = document.getElementById('errorBox');
        const errorMessage = errorBox.querySelector('.error-message'); 
        const overlay = document.getElementById('overlay');
    
        errorMessage.textContent = message; 
        errorBox.classList.remove('hidden'); 
        errorBox.classList.add('show');
        overlay.style.display = 'block'; 
    
        const closeButton = errorBox.querySelector('.close-button');
        closeButton.onclick = () => {
            errorBox.classList.remove('show'); 
            overlay.style.display = 'none';
        };

        cityInput.value = '';
    }

    function displayWeatherTable() {
        weatherTableBody.innerHTML = '';

        const dailyTemps = {};
        const todayDate = new Date().toLocaleDateString();

        // Calculate min and max temperatures for each day
        forecastData.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            const tempMin = item.main.temp_min;
            const tempMax = item.main.temp_max;

            if (!dailyTemps[date]) {
                dailyTemps[date] = { min: tempMin, max: tempMax };
            } else {
                dailyTemps[date].min = Math.min(dailyTemps[date].min, tempMin);
                dailyTemps[date].max = Math.max(dailyTemps[date].max, tempMax);
            }
        });
    
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, forecastData.length);
        const paginatedData = forecastData.slice(startIndex, endIndex);
    
        paginatedData.forEach(item => {
            const dateObj = new Date(item.dt * 1000);
            const date = new Date(item.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' });
            const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); 
           
            const icon = `http://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
            const tempMin = item.main.temp_min.toFixed(1);
            const tempMax = item.main.temp_max.toFixed(1);
            
            const dailyMinTemp = dailyTemps[new Date(item.dt * 1000).toLocaleDateString()].min;
            const dailyMaxTemp = dailyTemps[new Date(item.dt * 1000).toLocaleDateString()].max;

            // Calculate the percentage for the progress bar based on daily min/max temperatures
            const tempRangePercent = ((tempMax - dailyMinTemp) / (dailyMaxTemp - dailyMinTemp)) * 100;

            const displayDate = dateObj.toLocaleDateString() === todayDate ? 'Today' : date;

            const weather = item.weather[0].description;
            const humidity = item.main.humidity;
            const windSpeed = item.wind.speed;
    
            const row = `
                <tr>
                    <td>${displayDate}</td>
                    <td>${time}</td>
                    <td><img src="${icon}" alt="weather icon"></td>
                    <td>${tempMin}°C</td>
                    <td>
                        <div class="temp-bar-container">
                            <div class="temp-bar-fill" style="width: 0%;"></div>
                        </div>
                    </td>
                    <td>${tempMax}°C</td>
                    <td>${weather}</td>
                    <td>${humidity}%</td>
                    <td>${windSpeed} m/s</td>
                </tr>
            `;
            weatherTableBody.insertAdjacentHTML('beforeend', row);
        });
    
        setTimeout(() => {
            const tempBarFill = weatherTableBody.querySelectorAll('.temp-bar-fill');
            tempBarFill.forEach((bar, index) => {
                const date = new Date(paginatedData[index].dt * 1000).toLocaleDateString();
                const dailyMinTemp = dailyTemps[date].min-1;
                const dailyMaxTemp = dailyTemps[date].max;
                
                // Calculate the percentage width for the progress bar
                const percent = ((paginatedData[index].main.temp_max - dailyMinTemp) / (dailyMaxTemp - dailyMinTemp)) * 100;
                bar.style.width = percent + '%';
            });
        }, 100); // Delay to trigger the animation
    
        updatePaginationButtons();
    }
    
    function updatePaginationButtons() {
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage * itemsPerPage >= forecastData.length;
    }
    
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayWeatherTable();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage * itemsPerPage < forecastData.length) {
            currentPage++;
            displayWeatherTable();
        }
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getCityFromCoordinates, handleLocationError);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
    
    function getCityFromCoordinates(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        const geocodingUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
        
        // Fetch the city name from the reverse geocoding API
        fetch(geocodingUrl)
            .then(response => response.json())
            .then(data => {
                const city = data.address.city || data.address.town || data.address.village;
                console.log("City: " + city);
                currentCity = city;
                fetchWeatherData(city);
            })
            .catch(error => console.log('Error in reverse geocoding:', error));
    }
    
    function handleLocationError(error) {
        console.log("Unable to retrieve location, showing weather for default city.");
      
    }

    // Listen for filter changes
    document.getElementById('filterSelect').addEventListener('change', (event) => {
        const filterValue = event.target.value;
        forecastData = [...originalForecastData];

        if (filterValue === 'ascending') {
            sortTemperaturesAscending();
        } else if (filterValue === 'descending') {
            sortTemperaturesDescending();
        } else if (filterValue === 'rainy') {
            filterRainyDays();
        } else if (filterValue === 'highest') {
            showDayWithHighestTemperature();
        }
    });

    function sortTemperaturesAscending() {
        // Sort forecastData by ascending temperatures (temp_min)
        forecastData.sort((a, b) => a.main.temp_max - b.main.temp_max);
        displayWeatherTable(); 
    }

    function sortTemperaturesDescending() {
        // Sort forecastData by descending temperatures (temp_max)
        forecastData.sort((a, b) => b.main.temp_max - a.main.temp_max);
        displayWeatherTable(); 
    }

    function filterRainyDays() {
        // Filter forecastData for rainy days
        const rainyDays = forecastData.filter(item => item.weather[0].description.toLowerCase().includes('rain'));
        if (rainyDays.length > 0) {
            forecastData = rainyDays;
        } else {
            showError('No rainy days in the forecast.');
        }
        displayWeatherTable(); 
    }

    function showDayWithHighestTemperature() {
        // Find the entry with the highest temp_max using reduce
        const highestTempDay = forecastData.reduce((max, item) => 
            item.main.temp_max > max.main.temp_max ? item : max, forecastData[0]);

        forecastData = [highestTempDay]; // Set forecastData to just the day with the highest temperature
        displayWeatherTable(); 
    }

function addLoadingDots() {
    const chatMessages = document.getElementById('chatMessages');
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('message', 'bot', 'loading');
    
    const loadingDots = document.createElement('div');
    loadingDots.classList.add('loading-dots');
    loadingDots.innerHTML = `
        <span class="loading-dot">.</span>
        <span class="loading-dot">.</span>
        <span class="loading-dot">.</span>
    `;
    
    loadingMessage.appendChild(loadingDots);
    chatMessages.appendChild(loadingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;  // Auto-scroll to the bottom
}

// Function to remove loading dots after generating a response
function removeLoadingDots() {
    const loadingMessage = document.querySelector('.loading');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// Function to add a message to the chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
        <div class="message-content">${content}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to interact with Gemini API
async function queryGemini(prompt) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    const response = await fetch(`${url}?key=${geminiApikey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        }),
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}


function formatForecastData(originalForecastData) {
    if (!originalForecastData || originalForecastData.length === 0) {
        return "No weather data available."; 
    }
    console.log(originalForecastData.length);
    let formattedData = `Weather forecast :\n`;

    originalForecastData.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const tempMin = item.main.temp_min.toFixed(1); 
        const tempMax = item.main.temp_max.toFixed(1);
        const weather = item.weather[0].description;
        const humidity = item.main.humidity;
        const windSpeed = item.wind.speed;

        formattedData += `Date: ${date}, Time: ${time}, Low: ${tempMin}°C, High: ${tempMax}°C, Weather: ${weather}, Humidity: ${humidity}%, Wind Speed: ${windSpeed} m/s\n`;
    });
    console.log(formattedData);
    return formattedData; 
}


// Function to process user input
async function processUserInput(input) {
    addMessage(input, true);
    addLoadingDots();
    let response;

    const formattedForecast = formatForecastData(originalForecastData);
    const combinedInput = `Politely decline all messages that are not related to the weather forecast. Weather forecast of ${currentCity} :\n${formattedForecast} keeping this forecast is mind respond briefly and dont add styling to the response. Users question: "${input}". `;

    try {
        response = await queryGemini(combinedInput);
    } catch (error) {
        console.error('Error querying Gemini:', error);
        response = 'Sorry, there was an error retrieving the weather information.';
    }
    
    removeLoadingDots();
    addMessage(response);
}

// Event listener for send button
sendBtn.addEventListener('click', async () => {
    const input = userInput.value.trim();
    if (input) {
        userInput.value = '';
        await processUserInput(input);
    }
});

// Event listener for Enter key
userInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const input = userInput.value.trim();
        if (input) {
            userInput.value = '';
            await processUserInput(input);
        }
    }
}); 