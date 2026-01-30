export class HolidayUpdater {
  constructor(inputManager) {
    this.inputManager = inputManager;
    this.holidaysView = document.getElementById("holidays-view");
    this.holidaysContent = document.getElementById("holidays-content");
    this.holidaySelected = document.getElementById("holidays-selection");

    this.flagImg = this.holidaySelected.querySelector(".selection-flag");
    this.countryNameEl =
      this.holidaySelected.querySelector(".selected-country");
    this.yearEl = this.holidaySelected.querySelector(".selection-year");
  }

  formatDate(dateStr) {
    const date = new Date(dateStr + "T00:00:00");
    return {
      day: date.getUTCDate(),
      month: date.toLocaleString("en-US", { month: "short" }),
      weekday: date.toLocaleString("en-US", { weekday: "long" }),
    };
  }

  async loadData() {
    const { countryCode, country, year } = this.inputManager.getUserInput();

    if (!countryCode || !year) {
      return;
    }

    this.flagImg.src = `https://flagcdn.com/w160/${countryCode.toLowerCase()}.png`;
    this.countryNameEl.textContent = country;
    this.yearEl.textContent = year;
    this.holidaySelected.style.display = "flex";

    this.holidaysContent.innerHTML = "";

    try {
      const res = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
      );

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        return;
      }

      this.holidaysContent.innerHTML = "";

      data.forEach((holiday) => {
        const { day, month, weekday } = this.formatDate(holiday.date);

        const holidayCard = document.createElement("div");

        holidayCard.classList.add("holiday-card");
        holidayCard.innerHTML = `
          <div class="holiday-card-header">
            <div class="holiday-date-box">
              <span class="day">${day}</span><span class="month">${month}</span>
            </div>
            <button class="holiday-action-btn">
              <i class="fa-regular fa-heart"></i>
            </button>
          </div>
          <h3>${holiday.localName}</h3>
          <p class="holiday-name">${holiday.name}</p>
          <div class="holiday-card-footer">
            <span class="holiday-day-badge">
              <i class="fa-regular fa-calendar"></i> ${weekday}
            </span>
            <span class="holiday-type-badge">Public</span>
          </div>
        `;
        this.holidaysContent.appendChild(holidayCard);

        window.attachFavoriteListener(holidayCard, {
          type: "holiday",
          name: holiday.name,
          localName: holiday.localName,
          date: holiday.date,
          country: this.countryNameEl.textContent,
        });
      });
    } catch (err) {
      console.error("Failed to load holidays:", err);
      this.holidaysContent.innerHTML =
        "<p>Failed to load holidays. Please try again later.</p>";
    }
  }
}
