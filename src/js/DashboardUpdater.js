export class DashboardUpdater {
  constructor(inputManager) {
    this.inputManager = inputManager;
    this.infoContainer = document.getElementById("dashboard-country-info");

    this.flagImg = this.infoContainer.querySelector(".dashboard-country-flag");
    this.countryNameEl = this.infoContainer.querySelector(
      ".dashboard-country-title h3",
    );
    this.officialNameEl = this.infoContainer.querySelector(".official-name");
    this.regionEl = this.infoContainer.querySelector(".region");

    this.details = {};
    this.infoContainer
      .querySelectorAll(".dashboard-country-detail")
      .forEach((el) => {
        const label = el.querySelector(".label").textContent.trim();
        this.details[label] = el.querySelector(".value");
      });

    this.currencyEl = this.infoContainer.querySelector(
      ".dashboard-country-extra:nth-child(1) .extra-tags",
    );
    this.languagesEl = this.infoContainer.querySelector(
      ".dashboard-country-extra:nth-child(2) .extra-tags",
    );
    this.neighborsEl = this.infoContainer.querySelector(
      ".dashboard-country-extra:nth-child(3) .extra-tags",
    );

    this.localTimeInterval = null;
  }

  updateLocalTime(country) {
    const timeEl = document.getElementById("country-local-time");
    const zoneEl = this.infoContainer.querySelector(".local-time-zone");

    if (!country.timezones || country.timezones.length === 0) {
      timeEl.textContent = "-";
      zoneEl.textContent = "";
      return;
    }

    const timezone = country.timezones[0];
    zoneEl.textContent = timezone;

    const match = timezone.match(/UTC([+-]\d{2}):?(\d{2})?/);
    let offsetHours = 0;
    let offsetMinutes = 0;
    if (match) {
      offsetHours = parseInt(match[1], 10);
      offsetMinutes = match[2] ? parseInt(match[2], 10) : 0;
    }

    const nowUTC = new Date();
    const localTime = new Date(
      nowUTC.getTime() +
        offsetHours * 60 * 60 * 1000 +
        offsetMinutes * 60 * 1000,
    );

    const formattedTime = localTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    timeEl.textContent = formattedTime;
  }

  async loadData() {
    const { countryCode } = this.inputManager.getUserInput();
    if (!countryCode) {
      return;
    }

    try {
      const res = await fetch(
        `https://restcountries.com/v3.1/alpha/${countryCode}`,
      );
      const data = await res.json();
      const country = data[0];

      this.flagImg.src = `https://flagcdn.com/w160/${countryCode.toLowerCase()}.png`;
      this.countryNameEl.textContent = country.name.common;
      this.officialNameEl.textContent = country.name.official;
      this.regionEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${country.region} • ${country.subregion || "-"}`;

      this.details.Capital.textContent = country.capital?.[0] || "-";
      this.details.Population.textContent = country.population.toLocaleString();
      this.details.Area.textContent = `${country.area.toLocaleString()} km²`;
      this.details.Continent.textContent = country.region;
      this.details["Calling Code"].textContent = country.idd
        ? `${country.idd.root || ""}${(country.idd.suffixes || []).join(",")}`
        : "-";
      this.details["Driving Side"].textContent = country.car?.side || "-";
      this.details["Week Starts"].textContent = country.startOfWeek || "-";

      this.currencyEl.innerHTML = country.currencies
        ? Object.values(country.currencies)
            .map(
              (c) => `<span class="extra-tag">${c.name} (${c.symbol})</span>`,
            )
            .join(" ")
        : "<span class='extra-tag'>-</span>";

      this.languagesEl.innerHTML = country.languages
        ? Object.values(country.languages)
            .map((l) => `<span class="extra-tag">${l}</span>`)
            .join(" ")
        : "<span class='extra-tag'>-</span>";

      this.neighborsEl.innerHTML = country.borders
        ? country.borders
            .map((b) => `<span class="extra-tag border-tag">${b}</span>`)
            .join(" ")
        : "<span class='extra-tag'>None</span>";

      const mapLinkEl = this.infoContainer.querySelector(".btn-map-link");
      if (country.maps && country.maps.googleMaps) {
        mapLinkEl.href = country.maps.googleMaps;
      } else {
        mapLinkEl.href = "#";
      }

      this.updateLocalTime(country);
      if (this.localTimeInterval) clearInterval(this.localTimeInterval);
      this.localTimeInterval = setInterval(
        () => this.updateLocalTime(country),
        1000,
      );
    } catch (err) {
      console.error(err);
    }
  }
}
