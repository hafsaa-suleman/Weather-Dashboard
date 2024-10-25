    const apiKey = '6e4c1d9353255062733d63e89603bd3a'; 

    const searchBtn = document.getElementById('searchBtn');
    const cityInput = document.getElementById('citySearch');
    const unitToggle = document.getElementById('unitToggle');
    const toggleLabel = document.getElementById('toggleLabel');
    const uvIndexElement = document.getElementById('uvIndex');
    const uvStatusElement = document.getElementById('uvStatus');
    const uvPointerElement = document.querySelector('.uv-pointer');
    const uvFillElement = document.querySelector('.uv-fill');



    // Elements to display weather data
    const cityNameElement = document.getElementById('cityName');
    const temperatureElement = document.getElementById('temperature');
    const descriptionElement = document.getElementById('description');
    const highTempElement = document.getElementById('highTemp');
    const lowTempElement = document.getElementById('lowTemp');
    const humidityElement = document.getElementById('humidity');
    const windSpeedElement = document.getElementById('windSpeed');
    const pressureElement = document.getElementById('pressure');

    let tempCelsius, tempFahrenheit, highCelsius, highFahrenheit, lowCelsius, lowFahrenheit;

    // Toggle between Celsius and Fahrenheit
    unitToggle.addEventListener('change', () => {
        const isFahrenheit = unitToggle.checked;
        toggleLabel.textContent = isFahrenheit ? '°F' : '°C';

        updateTemperatureDisplay(isFahrenheit);
    });


    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    });

    async function getWeatherData(city) {
        loadingSpinner.style.display = 'flex';
       
        try {
            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);          
            
            const weatherData = await weatherResponse.json();
            
            if (weatherData.cod === 200) {
                // Extract and display weather information
                tempCelsius = weatherData.main.temp;
                highCelsius = weatherData.main.temp_max;
                lowCelsius = weatherData.main.temp_min;
    
                // Convert temperatures to Fahrenheit
                tempFahrenheit = (tempCelsius * 9/5) + 32;
                highFahrenheit = (highCelsius * 9/5) + 32;
                lowFahrenheit = (lowCelsius * 9/5) + 32;

                displayWeatherData(weatherData);
            } else {
                if (weatherResponse.status === 404) {
                    showError('City not found. Please check the city name and try again.');
                } else if (weatherResponse.status === 429) {
                    showError('API limit reached. Please try again later.');
                } else {
                    showError('Something went wrong. Please try again later.');
                }
                return;
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
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
    

    function displayWeatherData(data) {

        cityNameElement.textContent = data.name;
        const weatherCode = data.weather[0].id;
        updateWeatherVideo(weatherCode);

        const description = capitalizeDescription(data.weather[0].description);
        descriptionElement.textContent = description;

        humidityElement.textContent = `${data.main.humidity}%`;
        windSpeedElement.textContent = `${data.wind.speed} m/s`;
        pressureElement.textContent = `${data.main.pressure} hPa`;

        updateHumidityStatus(data.main.humidity);
        updateWindSpeedStatus(data.wind.speed);
        updatePressureStatus(data.main.pressure);

        // Fetch UV Index using lat and lon
        getUVIndex(data.coord.lat, data.coord.lon);
        getForecastData(data.coord.lat, data.coord.lon);
        
        // Display the weather icon
        const weatherIcon = data.weather[0].icon;
        document.getElementById('weatherIcon').src = `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`;  
        
        // Display temperature according to the toggle state
        const isFahrenheit = unitToggle.checked;
        updateTemperatureDisplay(isFahrenheit);
   
    }

    function updateWeatherVideo(weatherCode) {
        const videoElement = document.getElementById('weatherVideo');
        const videoSource = document.getElementById('videoSource');
        
        let videoUrl = '';
    
        if (weatherCode >= 200 && weatherCode <= 232) {
            videoUrl = 'videos/light-thunderstorm.mp4';
        } else if (weatherCode >= 300 && weatherCode <= 321) {
            videoUrl = 'videos/rainy.mp4';
        } else if (weatherCode >= 500 && weatherCode <= 531) {
            videoUrl = 'videos/rainy-2.mp4';
        } else if (weatherCode >= 600 && weatherCode <= 622) {
            videoUrl = 'videos/snowy.mp4';
        } else if (weatherCode >= 701 && weatherCode <= 781) {
            videoUrl = 'videos/foggy.mp4';
        } else if (weatherCode === 800) {
            videoUrl = 'videos/sunny-2.mp4';
        } else if (weatherCode >= 801 && weatherCode <= 804) {
            videoUrl = 'videos/clear-sky.mp4';
        } else {
            //fallback video
            videoUrl = 'videos/clear-sky.mp4';
        }
    
        videoSource.src = videoUrl;
        videoElement.load(); 
    }

    function capitalizeDescription(description) {
        return description
            .split(' ')  
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))  
            .join(' ');  
    }

    // Function to update temperature display based on unit
    function updateTemperatureDisplay(isFahrenheit) {
        if (isFahrenheit) {
            temperatureElement.textContent = `${tempFahrenheit.toFixed(1)}°F`;
            highTempElement.textContent = `${highFahrenheit.toFixed(1)}°F`;
            lowTempElement.textContent = `${lowFahrenheit.toFixed(1)}°F`;
        } else {
            temperatureElement.textContent = `${tempCelsius.toFixed(1)}°C`;
            highTempElement.textContent = `${highCelsius.toFixed(1)}°C`;
            lowTempElement.textContent = `${lowCelsius.toFixed(1)}°C`;
        }
    }

    // Fetch UV Index
    async function getUVIndex(lat, lon) {
        try {
            const uvResponse = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`);
            const uvData = await uvResponse.json();
            const uvValue = uvData.value.toFixed(1);
    
            // Update UV Index value
            uvIndexElement.textContent = `${uvValue}/10`;
    
            // Update the status based on UV value
            let status = 'Low';
            if (uvValue >= 3 && uvValue < 6) {
                status = 'Moderate';
            } else if (uvValue >= 6 && uvValue < 8) {
                status = 'High';
            } else if (uvValue >= 8) {
                status = 'Very High';
            }
            uvStatusElement.textContent = status;
    
            } catch (error) {
            console.error('Error fetching UV Index:', error);
        }
    }

    function updateHumidityStatus(humidity) {
        let humidityStatus = '';
        if (humidity <= 30) {
            humidityStatus = 'Dry';
        } else if (humidity <= 60) {
            humidityStatus = 'Comfortable';
        } else if (humidity <= 80) {
            humidityStatus = 'Humid';
        } else {
            humidityStatus = 'Very Humid';
        }
        document.getElementById('humidityStatus').textContent = humidityStatus;
    }
    
    // Function to update wind speed status
    function updateWindSpeedStatus(windSpeed) {
        let windSpeedStatus = '';
        if (windSpeed <= 2.77) {  
            windSpeedStatus = 'Calm';
        } else if (windSpeed <= 6.94) {  
            windSpeedStatus = 'Mild';
        } else if (windSpeed <= 11.11) { 
            windSpeedStatus = 'Windy';
        } else if (windSpeed <= 16.67) {  
            windSpeedStatus = 'Strong Winds';
        } else {
            windSpeedStatus = 'Very Windy';
        }
        document.getElementById('windSpeedStatus').textContent = windSpeedStatus;
    }
    
    // Function to update pressure status
    function updatePressureStatus(pressure) {
        let pressureStatus = '';
        if (pressure < 980) {
            pressureStatus = 'Low Pressure';
        } else if (pressure <= 1000) {
            pressureStatus = 'Moderate Pressure';
        } else if (pressure <= 1020) {
            pressureStatus = 'Normal Pressure';
        } else {
            pressureStatus = 'High Pressure';
        }
        document.getElementById('pressureStatus').textContent = pressureStatus;
    }
    
    //Fetch Current Location from Browser
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
                
                // Now call getWeatherData() with the city name
                getWeatherData(city);
            })
            .catch(error => console.log('Error in reverse geocoding:', error));
    }
    
    function handleLocationError(error) {
        console.log("Unable to retrieve location, showing weather for default city.");
        getWeatherData("Islamabad");  // Fallback to a default city
    }
    

let barChart, doughnutChart, lineChart;

// Fetch forecast data
async function getForecastData(lat, lon) {
    try {
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const forecastData = await forecastResponse.json();
        
        if (forecastData.cod === "200") {
            displayForecastCharts(forecastData);
        } else {
            showError('Error fetching forecast data. Please try again later.');
        }
    } catch (error) {
        console.error('Error fetching forecast data:', error);
    }
}

function displayForecastCharts(forecastData) {
    const dailyData = processForecastData(forecastData);
    
    createBarChart(dailyData);
    createDoughnutChart(dailyData);
    createLineChart(dailyData);
}

function processForecastData(forecastData) {
    const dailyData = {};
    
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                conditions: []
            };
        }
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].conditions.push(item.weather[0].main);
    });

    return dailyData;
}

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            titleColor: '#333',
            bodyColor: '#666',
            borderColor: '#ccc',
            borderWidth: 1,
            cornerRadius: 5,
            displayColors: false,
            titleFont: {
                family: "'Roboto', sans-serif",
                size: 14,
                weight: 'bold'
            },
            bodyFont: {
                family: "'Roboto', sans-serif",
                size: 12
            }
        }
    }
};

function createBarChart(dailyData) {
    const ctx = document.getElementById('barChart').getContext('2d');
    const labels = Object.keys(dailyData).slice(0, 5).map(date => {
        return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    });
    const data = labels.map((_, index) => {
        const temps = dailyData[Object.keys(dailyData)[index]].temps;
        return temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
    });

    if (barChart) {
        barChart.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(30, 84, 120, 0.4)');
    gradient.addColorStop(1, 'rgba(30, 84, 120, 0.2)');

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '',
                data: data,
                backgroundColor: gradient,
                borderColor: 'rgba(30, 84, 120, 1)',
                borderWidth: 1
            }]
        },
        options: {
            ...chartOptions,
            animation: {
                delay: (context) => context.dataIndex * 300
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            family: "'Roboto', sans-serif",
                            size: 12
                        },
                        color: 'rgba(0, 0, 0, 0.6)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Roboto', sans-serif",
                            size: 12
                        },
                        color: 'rgba(0, 0, 0, 0.6)'
                    }
                }
            }
        }
    });
}

function createDoughnutChart(dailyData) {
    const ctx = document.getElementById('doughnutChart').getContext('2d');
    const dailyConditions = Object.values(dailyData).map(day => day.conditions[4]).filter(condition => condition);

    const conditionCounts = dailyConditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(conditionCounts);
    const data = Object.values(conditionCounts);

    if (doughnutChart) {
        doughnutChart.destroy();
    }

    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(30, 84, 120, 0.2)',  
                    'rgba(30, 84, 120, 0.4)',  
                    'rgba(30, 84, 120, 0.6)',
                    'rgba(30, 84, 120, 0.8)', 
                    'rgba(30, 84, 120, 1)'  
                ],
                borderColor: 'white',
                borderWidth: 2
            }]
        },
        options: {
            ...chartOptions,
            animation: {
                delay: (context) => context.dataIndex * 300
            },
            cutout: '60%',
            plugins: {
                    legend: {
                        labels: {
                            font: {
                                family: "'Roboto', sans-serif",
                                size: 14
                            },
                            color: '#333'
                        },
                        position: 'bottom'
                    }
            }
        }
    });
}

function createLineChart(dailyData) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    const labels = Object.keys(dailyData).slice(0, 5).map(date => {
        return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    });
    const data = labels.map((_, index) => {
        const temps = dailyData[Object.keys(dailyData)[index]].temps;
        return temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
    });

    if (lineChart) {
        lineChart.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(30, 84, 120, 0.6)');
    gradient.addColorStop(1, 'rgba(30, 84, 120, 0.2)');

    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '',
                data: data,
                borderColor: 'rgba(30, 84, 120, 1)',
                backgroundColor: gradient,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'white',
                pointBorderColor: 'rgba(30, 84, 120, 1)',
                pointBorderWidth: 1,
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 2 
            }]
        },
        options: {
            ...chartOptions,
            animation: {
                y: {
                    easing: 'easeOutBounce',
                    duration: 1000,
                    from: (ctx) => {
                        if (ctx.type === 'data') {
                            if (ctx.mode === 'default' && !ctx.dropped) {
                                ctx.dropped = true;
                                return 0;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            family: "'Roboto', sans-serif",
                            size: 12
                        },
                        color: 'rgba(0, 0, 0, 0.6)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Roboto', sans-serif",
                            size: 12
                        },
                        color: 'rgba(0, 0, 0, 0.6)'
                    }
                }
            }
        }
    });
}
