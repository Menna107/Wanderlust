export class WeatherUpdater {
  constructor(inputManager) {
    this.inputManager = inputManager;

    this.weatherView = document.getElementById("weather-view");
    this.weatherContent = document.getElementById("weather-content");
    this.weatherSelection = document.getElementById("weather-selection");

    // Header
    this.flagImg = this.weatherView.querySelector(".selection-flag");
    this.countryElement = this.weatherView.querySelector(
      ".current-selection-badge span",
    );
    this.cityElement = this.weatherView.querySelector(".selection-city");

    // Hero
    this.cityLabel = this.weatherView.querySelector(".weather-location span");
    this.dateLabel = this.weatherView.querySelector(".weather-time");
    this.tempValue = this.weatherView.querySelector(".temp-value");
    this.feelsLike = this.weatherView.querySelector(".weather-feels");
    this.condition = this.weatherView.querySelector(".weather-condition");

    // Forecast
    this.hourlyContainer = this.weatherView.querySelector(".hourly-scroll");
    this.dailyContainer = this.weatherView.querySelector(".forecast-list");

    // High / Low
    this.highTemp = this.weatherView.querySelector(".weather-high-low .high");
    this.lowTemp = this.weatherView.querySelector(".weather-high-low .low");

    // Detail Cards
    this.humidity = this.weatherView.querySelector(
      ".weather-detail-card .detail-value.humidity-value",
    );
    this.wind = this.weatherView.querySelector(
      ".weather-detail-card .detail-value.wind-value",
    );
    this.uv = this.weatherView.querySelector(
      ".weather-detail-card .detail-value.uv-value",
    );
  }

  async loadData() {
    const { latitude, longitude, country, countryCode, city } =
      this.inputManager.getUserInput();

    if (!latitude || !longitude) {
      this.showEmptyState();
      return;
    }

    // Header
    this.flagImg.src = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
    this.countryElement.textContent = country;
    this.cityElement.textContent = city ? `${city}` : "";
    this.weatherSelection.style.display = "flex";

    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`,
      );

      if (!res.ok) throw new Error("Weather API error");

      const data = await res.json();

      this.renderCurrentWeather(data, city);
      this.renderHourly(data);
      this.renderDaily(data);
      this.hideEmptyState();
    } catch (err) {
      console.error(err);
      this.showEmptyState();
    }
  }

  renderCurrentWeather(data, city) {
    const current = data.current;
    if (!current) return;

    this.cityLabel.textContent = city;
    this.dateLabel.textContent = new Date().toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    this.tempValue.textContent = Math.round(current.temperature_2m);

    this.feelsLike.textContent = `Feels like ${Math.round(
      current.apparent_temperature,
    )}°C`;

    this.condition.textContent = this.getWeatherText(current.weather_code);

    this.highTemp.innerHTML = `
    <i class="fa-solid fa-arrow-up"></i>
    ${Math.round(data.daily.temperature_2m_max[0])}°`;

    this.lowTemp.innerHTML = `
    <i class="fa-solid fa-arrow-down"></i>
    ${Math.round(data.daily.temperature_2m_min[0])}°`;

    const heroCard = this.weatherView.querySelector(".weather-hero-card");
    if (!heroCard) return;

    heroCard.classList.remove(
      "weather-sunny",
      "weather-cloudy",
      "weather-rainy",
      "weather-snowy",
      "weather-thunder",
    );
    let heroClass = "";
    let heroIcon = "fa-sun";
    const code = current.weather_code;

    if (code === 0 || code === 1) {
      heroClass = "weather-sunny";
      heroIcon = "fa-sun";
    } else if (code <= 3 || (code >= 45 && code <= 48)) {
      heroClass = "weather-cloudy";
      heroIcon = "fa-cloud";
    } else if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) {
      heroClass = "weather-rainy";
      heroIcon = "fa-cloud-rain";
    } else if (code >= 71 && code <= 75) {
      heroClass = "weather-snowy";
      heroIcon = "fa-snowflake";
    } else if (code >= 95) {
      heroClass = "weather-thunder";
      heroIcon = "fa-bolt";
    }
    heroCard.classList.add(heroClass);

    const heroIconEl = heroCard.querySelector(".weather-hero-icon");
    if (heroIconEl) {
      heroIconEl.innerHTML = "";
      heroIconEl.innerHTML = `<i class="fa-solid ${heroIcon}"></i>`;
    }

    //Header Cards:
    this.humidity.textContent = `${current.relative_humidity_2m}%`;
    const detailBar = document.querySelector(".detail-bar .detail-bar-fill");
    detailBar.style.width = `${current.relative_humidity_2m}%`;

    this.wind.textContent = `${current.wind_speed_10m ? current.wind_speed_10m : 10} km/h`;
    this.uv.textContent = `${current.uv_index ? current.uv_index : 2}`;
  }

  renderHourly(data) {
    this.hourlyContainer.innerHTML = "";

    const times = data.hourly.time;
    const temps = data.hourly.temperature_2m;
    const codes = data.hourly.weather_code;

    const now = new Date();

    const startIndex = times.findIndex((t) => {
      return new Date(t) >= now;
    });

    const safeStart = startIndex === -1 ? 0 : startIndex;

    const endIndex = safeStart + 23;

    for (let i = safeStart; i < endIndex && i < times.length; i++) {
      const item = document.createElement("div");
      item.className = "hourly-item";

      const isNow = i === safeStart;

      item.innerHTML = `
      <span class="hourly-time">
        ${isNow ? "Now" : this.formatHour(times[i])}
      </span>
      <div class="hourly-icon">
        <i class="fa-solid ${this.getWeatherIcon(codes[i])}"></i>
      </div>
      <span class="hourly-temp">
        ${Math.round(temps[i])}°
      </span>
      
    `;

      if (isNow) item.classList.add("now");

      this.hourlyContainer.appendChild(item);
    }
  }
  renderDaily(data) {
    this.dailyContainer.innerHTML = "";

    data.daily.time.forEach((date, i) => {
      const day = document.createElement("div");
      day.className = "forecast-day";

      const isToday = i === 0;

      day.innerHTML = `
      <div class="forecast-day-name">
        <span class="day-label">
          ${isToday ? "Today" : this.formatDay(date)}
        </span>
        <span class="day-date">
          ${this.formatDate(date)}
        </span>
      </div>
      <div class="forecast-icon">
        <i class="fa-solid ${this.getWeatherIcon(
          data.daily.weather_code[i],
        )}"></i>
      </div>
      <div class="forecast-temps">
        <span class="temp-max">
          ${Math.round(data.daily.temperature_2m_max[i])}°
        </span>
        <span class="temp-min">
          ${Math.round(data.daily.temperature_2m_min[i])}°
        </span>

       
      </div>
    `;

      if (isToday) day.classList.add("today");

      this.dailyContainer.appendChild(day);
    });
  }
  showEmptyState() {
    const emptyState = this.weatherContent.querySelector(".empty-state");
    const content = this.weatherContent.querySelector(".content");
    emptyState.style.display = "flex";
    content.style.display = "none";
  }

  hideEmptyState() {
    const emptyState = this.weatherContent.querySelector(".empty-state");
    emptyState.style.display = "none";
    const content = this.weatherContent.querySelector(".content");
    content.style.display = "grid";
  }

  // Helpers
  getWeatherText(code) {
    if (code === 0) return "Clear sky";

    if (code === 1) return "Mainly clear";
    if (code === 2) return "Partly cloudy";
    if (code === 3) return "Overcast";

    if (code === 45) return "Fog";
    if (code === 48) return "depositing rime fog";

    if (code === 51) return "Drizzle Light";
    if (code === 53) return "Drizzle moderate";
    if (code === 55) return "Drizzle dense";

    if (code === 61) return "Rain Slight";
    if (code === 63) return "Rain moderate";
    if (code === 65) return "Rain heavy";

    if (code === 71) return "Snow fall Slight";
    if (code === 73) return "Snow fall moderate";
    if (code === 75) return "Snow fall heavy";

    if (code === 80) return "Rain showers Slight";
    if (code === 81) return "Rain showers moderate";
    if (code === 82) return "Rain showers violent";

    if (code === 95) return "Thunderstorm Slight";
    if (code === 96) return "Thunderstorm moderate";
    if (code === 99) return "Thunderstorm hail";

    return "";
  }
  getWeatherIcon(code) {
    if (code === 0) return "fa-sun";
    if (code <= 3) return "fa-cloud-sun";
    if (code <= 48) return "fa-smog";
    if (code <= 65) return "fa-cloud-rain";
    if (code <= 75) return "fa-snowflake";
    if (code >= 95) return "fa-bolt";
    return "fa-cloud";
  }
  formatHour(time) {
    return new Date(time).toLocaleTimeString([], {
      hour: "numeric",
    });
  }
  formatDay(date) {
    return new Date(date).toLocaleDateString([], {
      weekday: "short",
    });
  }
  formatDate(date) {
    return new Date(date).toLocaleDateString([], {
      day: "numeric",
      month: "short",
    });
  }
}
