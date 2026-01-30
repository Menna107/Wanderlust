export class EventUpdater {
  constructor(inputManager) {
    this.inputManager = inputManager;
    this.eventsView = document.getElementById("events-view");
    this.eventsContent = document.getElementById("events-content");
    this.eventSelected = document.getElementById("events-selection");

    this.flagImg = this.eventsView.querySelector(".selection-flag");
    this.countryNameElement =
      this.eventsView.querySelector(".selected-country");
    this.cityElement = this.eventsView.querySelector(".selection-city");
  }

  async loadData() {
    const { countryCode, country, city } = this.inputManager.getUserInput();

    if (!countryCode || !city) return;

    this.flagImg.src = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
    this.countryNameElement.textContent = country;
    this.cityElement.textContent = `${city}`;
    this.eventSelected.style.display = "flex";

    this.eventsContent.innerHTML = "";

    try {
      const res = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=VwECw2OiAzxVzIqnwmKJUG41FbeXJk1y&city=${encodeURIComponent(city)}&countryCode=${countryCode}&size=20`,
      );

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      const events = data?._embedded?.events;

      if (!Array.isArray(events) || events.length === 0) {
        this.showEmptyState();
        return;
      }

      events.forEach((event) => {
        const name = event.name || "Unnamed Event";

        const image =
          event.images?.[0]?.url ||
          "https://via.placeholder.com/400x200?text=No+Image";

        const venue = event._embedded?.venues?.[0];
        const venueName = venue?.name || "";
        const venueCity = venue?.city?.name || "";

        const dateTime = event.dates?.start?.dateTime || "Date not available";

        const classification =
          event.classifications?.[0]?.segment?.name || "General";

        const url = event.url || "#";

        const eventCard = document.createElement("div");

        eventCard.className = "event-card";

        eventCard.innerHTML = `
          <div class="event-card-image">
            <img src="${image}" alt="${name}" />
            <span class="event-card-category">${classification}</span>
            <button class="event-card-save">
              <i class="fa-regular fa-heart"></i>
            </button>
          </div>

          <div class="event-card-body">
            <h3>${name}</h3>
            <div class="event-card-info">
              <div>
                <i class="fa-regular fa-calendar"></i> ${dateTime}
              </div>
              <div>
                <i class="fa-solid fa-location-dot"></i> ${venueName}${venueCity ? ", " + venueCity : ""}
              </div>
            </div>
            <div class="event-card-footer">
              <button class="btn-event">
                <i class="fa-regular fa-heart"></i> Save
              </button>
              <a href="${url}" target="_blank" class="btn-buy-ticket">
                <i class="fa-solid fa-ticket"></i> Buy Tickets
              </a>
            </div>
          </div>
        `;

        this.eventsContent.appendChild(eventCard);
        window.attachFavoriteListener(eventCard, {
          type: "event",
          name: event.name,
          date: dateTime,
          city: venueCity,
          country: this.countryNameElement.textContent,
        });
      });
    } catch (err) {
      console.error("Failed to load events:", err);
      this.eventsContent.innerHTML =
        "<p>Failed to load events. Please try again later.</p>";
    }
  }

  showEmptyState() {
    this.eventsContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-calendar-xmark"></i></div>
        <h3>No Events Found</h3>
        <p>No events found for this location</p>
        <button class="btn btn-primary btn-go-dashboard">
          <i class="fa-solid fa-globe"></i> Go to Dashboard
        </button>
      </div>
    `;
  }
}
