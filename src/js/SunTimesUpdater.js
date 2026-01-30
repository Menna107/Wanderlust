export class SunTimesUpdater {
  constructor(inputManager) {
    this.inputManager = inputManager;

    this.view = document.getElementById("sun-times-view");
    this.selection = this.view.querySelector(".view-header-selection");

    // Header
    this.flagImg = this.selection.querySelector(".selection-flag");
    this.countryElement = this.selection.querySelector(
      ".current-selection-badge span",
    );
    this.cityElement = this.selection.querySelector(".selection-city");

    // Content
    this.content = document.getElementById("sun-times-content");
    this.mainCard = this.content.querySelector(".sun-main-card");
    this.emptyState = this.view.querySelector(".empty-state");

    this.sunLocation = this.mainCard.querySelector(".sun-location h2");
    this.dateEl = this.mainCard.querySelector(".sun-date-display .date");
    this.dayEl = this.mainCard.querySelector(".sun-date-display .day");

    this.grid = this.mainCard.querySelector(".sun-times-grid");

    this.dayProgressFill = this.content.querySelector(".day-progress-fill");
    this.dayStats = this.content.querySelector(".day-length-stats");
  }

  async loadData() {
    const { country, city, countryCode, latitude, longitude } =
      this.inputManager.getUserInput();

    this.flagImg.src = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
    this.countryElement.textContent = country;
    this.cityElement.textContent = city;
    this.selection.style.display = "flex";

    this.sunLocation.innerHTML = `
    <i class="fa-solid fa-location-dot"></i> ${city}
  `;

    const { dateStr, dayStr, isoDate } = this.getTodayDate();
    this.dateEl.textContent = dateStr;
    this.dayEl.textContent = dayStr;

    try {
      const res = await fetch(
        `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${isoDate}&formatted=0`,
      );

      const data = await res.json();

      if (data.status !== "OK") {
        this.showEmptyState();
        return;
      }

      const sun = data.results;

      this.hideEmptyState();
      this.renderCards(sun);
      this.generateDayLengthFromSeconds(sun.day_length);
    } catch (err) {
      console.error(err);
      this.showEmptyState();
    }
  }

  renderCards(sun) {
    this.grid.innerHTML = `
      <div class="sun-time-card dawn">
        <div class="icon"><i class="fa-solid fa-moon"></i></div>
        <div class="label">Dawn</div>
        <div class="time">${this.formatApiTime(sun.civil_twilight_begin)}</div>
        <div class="sub-label">Civil Twilight</div>
      </div>

      <div class="sun-time-card sunrise">
        <div class="icon"><i class="fa-solid fa-sun"></i></div>
        <div class="label">Sunrise</div>
        <div class="time">${this.formatApiTime(sun.sunrise)}</div>
        <div class="sub-label">Golden Hour Start</div>
      </div>

      <div class="sun-time-card noon">
        <div class="icon"><i class="fa-solid fa-sun"></i></div>
        <div class="label">Solar Noon</div>
        <div class="time">${this.formatApiTime(sun.solar_noon)}</div>
        <div class="sub-label">Sun at Highest</div>
      </div>

      <div class="sun-time-card sunset">
        <div class="icon"><i class="fa-solid fa-sun"></i></div>
        <div class="label">Sunset</div>
        <div class="time">${this.formatApiTime(sun.sunset)}</div>
        <div class="sub-label">Golden Hour End</div>
      </div>

      <div class="sun-time-card dusk">
        <div class="icon"><i class="fa-solid fa-moon"></i></div>
        <div class="label">Dusk</div>
        <div class="time">${this.formatApiTime(sun.civil_twilight_end)}</div>
        <div class="sub-label">Civil Twilight</div>
      </div>

      <div class="sun-time-card daylight">
        <div class="icon">
            <i class="fa-solid fa-hourglass-half"></i>
        </div>
        <div class="label">Day Length</div>
            <div class="time" id="day-length-time">10h 42m</div>
            <div class="sub-label">Total Daylight</div>
      </div>
    `;
  }

  generateDayLengthFromSeconds(seconds) {
    const totalMinutes = Math.floor(seconds / 60);
    const percent = (totalMinutes / 1440) * 100;

    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    const dayLengthEl = document.getElementById("day-length-time");
    if (dayLengthEl) {
      dayLengthEl.textContent = `${h}h ${m}m`;
    }

    // Progress bar
    this.dayProgressFill.style.width = `${percent.toFixed(1)}%`;

    // Stats
    const darkMinutes = 1440 - totalMinutes;
    const dh = Math.floor(darkMinutes / 60);
    const dm = darkMinutes % 60;

    const stats = this.dayStats.querySelectorAll(".day-stat");
    stats[0].querySelector(".value").textContent = `${h}h ${m}m`;
    stats[1].querySelector(".value").textContent = `${percent.toFixed(1)}%`;
    stats[2].querySelector(".value").textContent = `${dh}h ${dm}m`;
  }

  formatApiTime(isoString) {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  getTodayDate() {
    const d = new Date();
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    return {
      dateStr: `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
      dayStr: days[d.getDay()],
      isoDate: d.toISOString().split("T")[0],
    };
  }

  showEmptyState() {
    this.emptyState.style.display = "flex";
    this.content.style.display = "none";
  }

  hideEmptyState() {
    this.emptyState.style.display = "none";
    this.content.style.display = "grid";
  }
}
