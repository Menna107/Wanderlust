export class LongWeekendUpdater {
  constructor(inputManager) {
    this.inputManager = inputManager;

    this.longWeekendsView = document.getElementById("long-weekends-view");
    this.longWeekendsSelection = document.getElementById(
      "view-header-selection",
    );

    // Header
    this.flagImg = this.longWeekendsSelection.querySelector(".selection-flag");
    this.countryElement = this.longWeekendsSelection.querySelector(
      ".current-selection-badge span",
    );
    this.yearElement =
      this.longWeekendsSelection.querySelector(".selection-year");

    this.content = document.getElementById("lw-content");
    this.emptyState = this.content.querySelector(".empty-state");
  }

  async loadData() {
    const { country, year, countryCode } = this.inputManager.getUserInput();

    // Header
    this.flagImg.src = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
    this.countryElement.textContent = country || "Egypt";
    this.yearElement.textContent = year;
    this.longWeekendsSelection.style.display = "flex";

    try {
      const res = await fetch(
        `https://date.nager.at/api/v3/LongWeekend/${year}/${countryCode}`,
      );
      if (!res.ok) throw new Error("API error");

      const data = await res.json();

      if (!data || data.length === 0) {
        this.showEmptyState();
      } else {
        this.renderCards(data);
        this.hideEmptyState();
      }
    } catch (err) {
      console.error(err);
      this.showEmptyState();
    }
  }

  renderCards(longWeekends) {
    this.content.innerHTML = "";

    longWeekends.forEach((item, index) => {
      const card = document.createElement("div");
      card.classList.add("lw-card");

      const daysHTML = this.generateDaysVisual(item.startDate, item.endDate);

      card.innerHTML = `
        <div class="lw-card-header">
          <span class="lw-badge"><i class="fa-solid fa-calendar-days"></i> ${item.dayCount} Days</span>
          <button class="holiday-action-btn">
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>
        <h3>Long Weekend #${index + 1}</h3>
        <div class="lw-dates">
          <i class="fa-regular fa-calendar"></i> ${this.formatDate(item.startDate)} - ${this.formatDate(item.endDate)}
        </div>
        <div class="lw-info-box ${item.needBridgeDay ? "warning" : "success"}">
          <i class="fa-solid ${item.needBridgeDay ? "fa-info-circle" : "fa-check-circle"}"></i> 
          ${item.needBridgeDay ? "Requires taking a bridge day off" : "No extra days off needed!"}
        </div>
        <div class="lw-days-visual">
          ${daysHTML}
        </div>
      `;

      this.content.appendChild(card);
      window.attachFavoriteListener(card, {
        type: "longWeekend",
        name: item.name,
        startDate: item.startDate,
        endDate: item.endDate,
        dayCount: item.dayCount,
        country: this.countryElement.textContent,
      });
    });
  }

  generateDaysVisual(startDateStr, endDateStr) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const html = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      html.push(`
        <div class="lw-day ${isWeekend ? "weekend" : ""}">
          <span class="name">${dayNames[d.getDay()]}</span>
          <span class="num">${d.getDate()}</span>
        </div>
      `);
    }

    return html.join("");
  }

  showEmptyState() {
    this.emptyState.style.display = "flex";
  }

  hideEmptyState() {
    this.emptyState.style.display = "none";
  }

  formatDate(dateStr) {
    const d = new Date(dateStr);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
}
