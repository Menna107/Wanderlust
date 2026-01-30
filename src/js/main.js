import { DashboardUpdater } from "./DashboardUpdater.js";
import { EventUpdater } from "./EventUpdater.js";
import { GlobalSelectionManager } from "./GlobalSelectionManager.js";
import { HolidayUpdater } from "./HolidayUpdater.js";
import { InputManager } from "./InputManager.js";
import { LongWeekendUpdater } from "./longWeekendUpdater.js";
import { SunTimesUpdater } from "./SunTimesUpdater.js";
import { ViewManager } from "./ViewManager.js";
import { WeatherUpdater } from "./weatherUpdater.js";
import { MyPlansManager } from "./MyPlansManager.js";

// Create instance from Input Manager
const inputManager = new InputManager();

// View Manager
const viewManager = new ViewManager();

// Global Selection Manager
const globalSelectionManager = new GlobalSelectionManager(inputManager);

// Updaters
const dashboardUpdater = new DashboardUpdater(inputManager);
const holidayUpdater = new HolidayUpdater(inputManager);
const eventUpdater = new EventUpdater(inputManager);
const weatherUpdater = new WeatherUpdater(inputManager);
const longWeekendUpdater = new LongWeekendUpdater(inputManager);
const sunTimesUpdater = new SunTimesUpdater(inputManager);

// Initialize Explore Button with proper reset
globalSelectionManager.initExploreButton([
  dashboardUpdater,
  holidayUpdater,
  eventUpdater,
  weatherUpdater,
  longWeekendUpdater,
  sunTimesUpdater,
]);

// Dashboard button click
document.querySelectorAll(".btn-go-dashboard").forEach((btn) => {
  btn.addEventListener("click", () => {
    viewManager.showView("dashboard");
  });
});

const myPlansManager = new MyPlansManager();
window.myPlansManager = myPlansManager;
myPlansManager.renderPlans();

window.attachFavoriteListener = function (cardEl, planData) {
  const mainHeartIcon = cardEl.querySelector(
    ".holiday-action-btn, .event-card-save",
  );
  if (!mainHeartIcon) return;

  const planId = planData.name || planData.startDate || planData.type;
  mainHeartIcon.dataset.planId = planId;

  if (window.myPlansManager && window.myPlansManager.isPlanSaved(planData)) {
    mainHeartIcon.classList.add("saved");
    mainHeartIcon.innerHTML = '<i class="fa-solid fa-heart"></i>';
  }

  cardEl
    .querySelectorAll(".btn-event, .holiday-action-btn, .event-card-save")
    .forEach((el) => {
      el.addEventListener("click", () => {
        const toastContainer = document.getElementById("toast-container");
        if (!toastContainer) return;

        if (mainHeartIcon.classList.contains("saved")) {
          const toast = document.createElement("div");
          toast.className = "toast info";
          toast.innerHTML = `
            <i class="fa-solid fa-circle-info"></i>
            <span>Plan already in My Plans!</span>
            <button class="toast-close">
              <i class="fa-solid fa-circle-xmark"></i>
            </button>
          `;
          toastContainer.appendChild(toast);
          toast
            .querySelector(".toast-close")
            .addEventListener("click", () => toast.remove());
          setTimeout(() => toast.remove(), 3000);
        } else {
          if (window.myPlansManager) window.myPlansManager.addPlan(planData);

          mainHeartIcon.classList.add("saved");
          mainHeartIcon.innerHTML = '<i class="fa-solid fa-heart"></i>';

          const toast = document.createElement("div");
          toast.className = "toast success";
          toast.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            <span>Saved to My Plans!</span>
            <button class="toast-close">
              <i class="fa-solid fa-circle-xmark"></i>
            </button>
          `;
          toastContainer.appendChild(toast);
          toast
            .querySelector(".toast-close")
            .addEventListener("click", () => toast.remove());
          setTimeout(() => toast.remove(), 3000);
        }
      });
    });
};

function markSavedHeart(cardEl, planData) {
  const heartIcon = cardEl.querySelector(
    ".holiday-action-btn, .event-card-save",
  );
  if (!heartIcon) return;

  if (window.myPlansManager && window.myPlansManager.isPlanSaved(planData)) {
    heartIcon.innerHTML = '<i class="fa-solid fa-heart"></i>';
    heartIcon.classList.add("saved");
  }
}
