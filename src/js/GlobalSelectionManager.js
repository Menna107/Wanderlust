// ^Fetch Countries get DOM element related with it, update HTML with data:
export class GlobalSelectionManager {
  constructor(inputManager) {
    this.inputManager = inputManager;

    // Country
    this.hiddenCountrySelect = document.getElementById("global-country");
    this.countryWrapper = document.getElementById("global-country-custom");
    this.countryTrigger = this.countryWrapper.querySelector(
      ".custom-select-trigger",
    );
    this.countryDropdown = this.countryWrapper.querySelector(
      ".custom-select-dropdown",
    );
    this.countryOptionsContainer = this.countryWrapper.querySelector(
      ".custom-select-options",
    );
    this.countrySearchInput = this.countryWrapper.querySelector("input");

    // City
    this.citySelect = document.getElementById("global-city");
    this.cityWrapper = document.getElementById("global-city-simple");
    this.cityTrigger = this.cityWrapper.querySelector(".simple-select-trigger");
    this.cityDropdown = this.cityWrapper.querySelector(
      ".simple-select-dropdown",
    );
    this.cityOptionsContainer = this.cityWrapper.querySelector(
      ".simple-select-options",
    );

    // Year
    this.yearWrapper = document.getElementById("global-year-simple");
    this.yearTrigger = this.yearWrapper.querySelector(".simple-select-trigger");
    this.yearDropdown = this.yearWrapper.querySelector(
      ".simple-select-dropdown",
    );
    this.yearOptionsContainer = this.yearWrapper.querySelectorAll(
      ".simple-select-option",
    );

    // Selected Destination
    this.selectedDestination = document.getElementById("selected-destination");
    this.selectedCountryName = document.getElementById("selected-country-name");
    this.selectedCityName = document.getElementById("selected-city-name");
    this.selectedCountryFlag = document.getElementById("selected-country-flag");

    //Clear Destination button:
    this.clearDestination = document.getElementById("clear-selection-btn");

    // Event listener
    this.clearDestination.addEventListener("click", () => {
      this.inputManager.setUserInput("", "", "", 2026, null, null);
      // Hide selected destination
      this.selectedDestination.style.display = "none";

      // Hide country info and show placeholder
      const countryInfoSection = document.getElementById(
        "dashboard-country-info",
      );
      const countryPlaceholder = document.querySelector(
        ".country-info-placeholder",
      );
      countryInfoSection.style.display = "none";
      countryPlaceholder.style.display = "flex";

      // Hide Holiday content and show state
      const holidayInfoSection = document.querySelector(
        "#holidays-view .holidays-content",
      );
      const holidayPlaceholder = document.querySelector(
        "#holidays-view .empty-state",
      );
      holidayInfoSection.style.display = "none";
      holidayPlaceholder.style.display = "flex";

      // Hide events content and show state
      const eventsInfoSection = document.querySelector(
        "#events-view .events-content",
      );
      const eventsPlaceholder = document.querySelector(
        "#events-view .empty-state",
      );
      eventsInfoSection.style.display = "none";
      eventsPlaceholder.style.display = "flex";

      // Reset Country, City, Year
      const { year } = this.inputManager.getUserInput();
      this.yearTrigger.querySelector(".selected-text").textContent = year;

      this.cityTrigger.querySelector(".selected-text").textContent =
        "Select City";
      this.cityTrigger
        .querySelector(".selected-text")
        .classList.add("placeholder");

      this.countryTrigger.querySelector(".selected-text").textContent =
        "Select Country";
      this.countryTrigger
        .querySelector(".selected-text")
        .classList.add("placeholder");
      const flagImg = this.countryTrigger.querySelector(".flag-img");
      flagImg.style.display = "none";
    });

    this.init();
  }

  async init() {
    await this.fetchCountries();
    this.setupCountryDropdown();
    this.setupCountrySearch();
    this.setupCountrySelection();
    this.setupCitySelection();
    this.setupCityDropdown();
    this.setupYearDropdown();
    this.setupYearSelection();
  }

  closeDropdown(trigger, dropdown) {
    trigger.classList.remove("open");
    dropdown.classList.remove("open");
  }
  toggleDropdown(trigger, dropdown) {
    trigger.classList.toggle("open");
    dropdown.classList.toggle("open");
  }

  // Fetch countries
  async fetchCountries() {
    const res = await fetch("https://date.nager.at/api/v3/AvailableCountries");
    const countries = await res.json();

    this.hiddenCountrySelect.innerHTML = "";
    this.countryOptionsContainer.innerHTML = "";

    countries.forEach((country) => {
      // hidden select
      const option = document.createElement("option");
      option.value = country.countryCode;
      option.textContent = country.name;
      this.hiddenCountrySelect.appendChild(option);

      // custom option
      const div = document.createElement("div");
      div.className = "custom-select-option";
      div.dataset.value = country.countryCode;
      div.dataset.name = country.name;
      div.innerHTML = `
      <img src="https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png" 
           class="flag-img" onerror="this.style.display='none'" />
      <span class="country-name">${country.name}</span>
      <span class="country-code">${country.countryCode}</span>
    `;
      this.countryOptionsContainer.appendChild(div);
    });
  }

  // Search functionality
  setupCountrySearch() {
    this.countrySearchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      this.countryOptionsContainer
        .querySelectorAll(".custom-select-option")
        .forEach((option) => {
          option.style.display = option.dataset.name
            .toLowerCase()
            .startsWith(searchTerm)
            ? "flex"
            : "none";
        });
    });
  }

  // set selected country and find its cities
  setupCountrySelection() {
    this.countryOptionsContainer.addEventListener("click", async (e) => {
      const option = e.target.closest(".custom-select-option");
      if (!option) return;

      const countryName = option.dataset.name;
      const countryCode = option.dataset.value;

      // Update selected destination (Country)
      this.selectedCountryName.textContent = countryName;
      this.selectedCityName.textContent = "";
      this.selectedCountryFlag.src = `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;

      this.selectedDestination.style.display = "flex";

      this.countryTrigger.querySelector(".selected-text").textContent =
        countryName;
      this.countryTrigger
        .querySelector(".selected-text")
        .classList.remove("placeholder");

      const flagImg = this.countryTrigger.querySelector(".flag-img");
      flagImg.style.display = "block";
      flagImg.src = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;

      this.hiddenCountrySelect.value = countryCode;

      this.countryTrigger.classList.remove("open");
      this.countryDropdown.classList.remove("open");

      this.cityTrigger.querySelector(".selected-text").textContent =
        "Loading...";
      let countryData = [];

      let latitude = null;
      let longitude = null;

      try {
        const countryRes = await fetch(
          `https://restcountries.com/v3.1/alpha/${countryCode}`,
        );
        countryData = await countryRes.json();
        const cities = countryData[0].capital || [];
        latitude = countryData[0].capitalInfo?.latlng?.[0] ?? null;
        longitude = countryData[0].capitalInfo?.latlng?.[1] ?? null;

        this.cityOptionsContainer.innerHTML = "";
        if (cities.length === 0) {
          this.cityTrigger.querySelector(".selected-text").textContent =
            "Select City";
        } else {
          cities.forEach((city) => {
            const cityDiv = document.createElement("div");
            cityDiv.className = "simple-select-option";
            cityDiv.textContent = city;
            cityDiv.dataset.value = city;
            this.cityOptionsContainer.appendChild(cityDiv);
          });
          this.cityTrigger.querySelector(".selected-text").textContent =
            "Select City";
        }
      } catch (err) {
        console.error(err);
        this.cityTrigger.querySelector(".selected-text").textContent =
          "Select City";
        this.cityOptionsContainer.innerHTML = "";
      } finally {
        this.citySelect.disabled = false;
      }

      const capital = countryData[0].capital ? countryData[0].capital[0] : "";
      const { year } = this.inputManager.getUserInput();

      this.inputManager.setUserInput(
        countryName,
        countryCode,
        capital,
        year,
        latitude,
        longitude,
      );
    });
  }

  // set selected city and find its cities
  setupCitySelection() {
    this.cityOptionsContainer.addEventListener("click", (e) => {
      const option = e.target.closest(".simple-select-option");
      if (!option) return;

      const city = option.dataset.value;
      if (!city) return;

      this.cityTrigger.querySelector(".selected-text").textContent = city;
      this.cityTrigger
        .querySelector(".selected-text")
        .classList.remove("placeholder");

      // Update selected destination (City)
      this.selectedCityName.textContent = `• ${city}`;
      this.selectedDestination.style.display = "flex";

      this.cityTrigger.classList.remove("open");
      this.cityDropdown.classList.remove("open");

      const data = this.inputManager.getUserInput();
      this.inputManager.setUserInput(
        data.country,
        data.countryCode,
        city,
        data.year,
        data.latitude,
        data.longitude,
      );
    });
  }

  // set selected year
  setupYearSelection() {
    const options = this.yearWrapper.querySelectorAll(".simple-select-option");
    options.forEach((option) => {
      option.addEventListener("click", () => {
        const year = option.dataset.value;
        if (!year) return;

        this.yearTrigger.querySelector(".selected-text").textContent = year;

        this.yearTrigger.classList.remove("open");
        this.yearDropdown.classList.remove("open");

        const data = this.inputManager.getUserInput();
        this.inputManager.setUserInput(
          data.country,
          data.countryCode,
          data.city,
          year,
          data.latitude,
          data.longitude,
        );
      });
    });
  }

  setupCountryDropdown() {
    this.countryTrigger.addEventListener("click", () => {
      // Close City and Year dropdown
      this.closeDropdown(this.cityTrigger, this.cityDropdown);
      this.closeDropdown(this.yearTrigger, this.yearDropdown);

      // Toggle Country dropdown
      this.toggleDropdown(this.countryTrigger, this.countryDropdown);
    });
  }
  setupCityDropdown() {
    this.cityTrigger.addEventListener("click", () => {
      // Close City and Year dropdown
      this.closeDropdown(this.countryTrigger, this.countryDropdown);
      this.closeDropdown(this.yearTrigger, this.yearDropdown);

      // Toggle Country dropdown
      this.toggleDropdown(this.cityTrigger, this.cityDropdown);
    });
  }
  setupYearDropdown() {
    this.yearTrigger.addEventListener("click", () => {
      // Close City and Year dropdown
      this.closeDropdown(this.countryTrigger, this.countryDropdown);
      this.closeDropdown(this.cityTrigger, this.cityDropdown);

      // Toggle Country dropdown
      this.toggleDropdown(this.yearTrigger, this.yearDropdown);
    });
  }

  // Update All Pages when click Explore Button:
  initExploreButton(updaters = []) {
    const btn = document.getElementById("global-search-btn");
    btn.addEventListener("click", async () => {
      const { country, city, countryCode } = this.inputManager.getUserInput();
      const toastContainer = document.getElementById("toast-container");

      if (!countryCode) {
        const toast = document.createElement("div");
        toast.className = "toast warning";
        toast.innerHTML = `
          <i class="fa-solid fa-circle-exclamation"></i>
          <span>Please select a country first</span>
          <button class="toast-close">
            <i class="fa-solid fa-circle-xmark"></i>
          </button>
        `;
        toastContainer.appendChild(toast);

        // Close button functionality
        toast
          .querySelector(".toast-close")
          .addEventListener("click", () => toast.remove());

        // Remove automatically after 10 seconds
        setTimeout(() => {
          if (toast.parentNode) toast.remove();
        }, 5000);
        return;
      }

      // Show country info section and hide placeholder
      const countryInfoSection = document.getElementById(
        "dashboard-country-info",
      );
      const countryPlaceholder = document.querySelector(
        ".country-info-placeholder",
      );
      countryInfoSection.style.display = "block";
      countryPlaceholder.style.display = "none";

      const holidayInfoSection = document.querySelector(
        "#holidays-view .holidays-content",
      );
      const eventsInfoSection = document.querySelector(
        "#events-view .events-content",
      );

      holidayInfoSection.style.display = "grid";

      const successToast = document.createElement("div");
      successToast.className = "toast success";
      successToast.innerHTML = `
      <i class="fa-solid fa-circle-check"></i>
      <span>Exploring ${country}${city ? ", " + city : ""}!</span>
      <button class="toast-close">
        <i class="fa-solid fa-circle-xmark"></i>
      </button>
    `;
      toastContainer.appendChild(successToast);

      successToast
        .querySelector(".toast-close")
        .addEventListener("click", () => successToast.remove());

      // Remove automatically after 10 seconds
      setTimeout(() => successToast.remove(), 5000);

      for (const updater of updaters) {
        if (typeof updater.loadData === "function") {
          await updater.loadData();
        }
      }
    });
  }
}
