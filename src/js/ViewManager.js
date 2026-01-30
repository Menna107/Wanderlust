export class ViewManager {
  constructor() {
    this.views = document.querySelectorAll(".view");
    this.links = document.querySelectorAll("[data-view]");

    this.init();
    this.handleInitialView();
    this.handlePopState();
  }

  init() {
    this.links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const viewName = link.dataset.view;
        this.showView(viewName);
        window.history.pushState({ view: viewName }, "", `#${viewName}`);
      });
    });
  }

  hideAllViews() {
    this.views.forEach((view) => view.classList.remove("active"));
  }

  showView(viewName) {
    this.hideAllViews();

    const target = document.getElementById(`${viewName}-view`);
    if (target) target.classList.add("active");

    this.setActiveLink(viewName);
    this.updateHeader(viewName);
  }

  updateHeader(viewName) {
    const titleEl = document.getElementById("page-title");
    const subtitleEl = document.getElementById("page-subtitle");
    const datetimeEl = document.getElementById("current-datetime");

    const headers = {
      dashboard: {
        title: "Dashboard",
        subtitle: "Welcome back! Ready to plan your next adventure?",
      },
      holidays: {
        title: "Holidays",
        subtitle: "Explore public holidays around the world",
      },
      events: {
        title: "Events",
        subtitle: "Find concerts, sports, and entertainment",
      },
      weather: {
        title: "Weather",
        subtitle: "Check forecasts for any destination",
      },
      "long-weekends": {
        title: "Long Weekends",
        subtitle: "Find the perfect mini-trip opportunities",
      },
      "sun-times": {
        title: "Sun Times",
        subtitle: "Check sunrise and sunset times worldwide",
      },
      "my-plans": {
        title: "My Plans",
        subtitle: "Your saved holidays and events",
      },
    };

    const header = headers[viewName] || headers["dashboard"];
    titleEl.textContent = header.title;
    subtitleEl.textContent = header.subtitle;

    const now = new Date();
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    datetimeEl.textContent = now.toLocaleString("en-US", options);
  }

  setActiveLink(viewName) {
    this.links.forEach((link) => {
      link.classList.remove("active");
      if (viewName === link.dataset.view) link.classList.add("active");
    });
  }

  handleInitialView() {
    const initialView = window.location.hash.replace("#", "") || "dashboard";
    this.showView(initialView);
    window.history.replaceState({ view: initialView }, "", `#${initialView}`);
  }

  handlePopState() {
    window.addEventListener("popstate", (event) => {
      const viewName = event.state?.view || "dashboard";
      this.showView(viewName);
    });
  }
}
