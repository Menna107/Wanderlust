export class MyPlansManager {
  constructor() {
    this.key = "myPlans"; // localStorage key
    this.plans = JSON.parse(localStorage.getItem(this.key)) || [];

    const clearAllBtn = document.getElementById("clear-all-plans-btn");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () => {
        this.clearAllPlans();
      });
    }

    this.renderPlans();
    this.updateCounters();
  }

  addPlan(planData) {
    const exists = this.plans.some(
      (p) =>
        p.type === planData.type &&
        ((p.name && planData.name && p.name === planData.name) ||
          (p.startDate &&
            planData.startDate &&
            p.startDate === planData.startDate)),
    );
    if (!exists) {
      this.plans.push(planData);
      this.savePlans();
    }
  }

  savePlans() {
    localStorage.setItem(this.key, JSON.stringify(this.plans));
    this.renderPlans();
    this.updateCounters();
  }

  removePlan(planData) {
    this.plans = this.plans.filter(
      (p) =>
        !(
          p.type === planData.type &&
          ((p.name && planData.name && p.name === planData.name) ||
            (p.startDate &&
              planData.startDate &&
              p.startDate === planData.startDate))
        ),
    );
    this.savePlans();
  }

  formatPlanDate(dateStr) {
    if (!dateStr) return "";
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj)) return dateStr;
    const options = { month: "short", day: "numeric", year: "numeric" };
    return dateObj.toLocaleDateString("en-US", options);
  }

  renderPlans() {
    const plansContent = document.getElementById("plans-content");
    plansContent.innerHTML = "";

    if (this.plans.length === 0) {
      plansContent.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fa-solid fa-heart-crack"></i>
          </div>
          <h3>No Saved Plans Yet</h3>
          <p>Start exploring and save holidays, events, or long weekends you like!</p>
          <button class="btn-primary" id="start-exploring-btn">
            <i class="fa-solid fa-compass"></i> Start Exploring
          </button>
        </div>
      `;
      const startBtn = document.getElementById("start-exploring-btn");
      if (startBtn) {
        startBtn.addEventListener("click", () => {
          viewManager.showView("dashboard");
        });
      }
      return;
    }

    this.plans.forEach((plan) => {
      const planCard = document.createElement("div");
      planCard.className = "plan-card";

      let dateText =
        plan.startDate && plan.endDate
          ? `${this.formatPlanDate(plan.startDate)} - ${this.formatPlanDate(plan.endDate)}`
          : plan.date
            ? this.formatPlanDate(plan.date)
            : "";

      let dayCountText =
        plan.type === "longWeekend" && plan.dayCount
          ? `${plan.dayCount} Day${plan.dayCount > 1 ? "s" : ""} Long Weekend`
          : "";

      let extraDaysText = "";
      if (plan.type === "longWeekend") {
        extraDaysText = plan.needBridgeDay
          ? "Requires taking a bridge day off"
          : "No extra days needed";
      }

      let displayText = plan.title || plan.description || plan.country || "";

      planCard.innerHTML = `
        <span class="plan-card-type ${
          plan.type === "longWeekend" ? "longweekend" : plan.type
        }">${plan.type === "longWeekend" ? "Long Weekend" : plan.type}</span>
        <div class="plan-card-content">
          <h4>${dayCountText || plan.name || "Untitled Plan"}</h4>
          <div class="plan-card-details">
            <div>
              <i class="fa-solid fa-calendar"></i> ${dateText}
            </div>
            <div>
              <i class="fa-solid fa-location-dot"></i> ${
                plan.type === "longWeekend" ? extraDaysText : displayText
              }
            </div>
          </div>
          <div class="plan-card-actions">
            <button class="btn-plan-remove">
              <i class="fa-solid fa-trash"></i> Remove
            </button>
          </div>
        </div>
      `;

      plansContent.appendChild(planCard);

      planCard
        .querySelector(".btn-plan-remove")
        .addEventListener("click", () => {
          Swal.fire({
            title: "Remove Plan?",
            text: "Are you sure you want to remove this plan?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33 ",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
          }).then((result) => {
            if (result.isConfirmed) {
              this.removePlan(plan);

              const planId = plan.name || plan.startDate || plan.type;
              const heartIcon = document.querySelector(
                `[data-plan-id="${planId}"]`,
              );
              if (heartIcon) {
                heartIcon.classList.remove("saved");
                heartIcon.innerHTML = '<i class="fa-regular fa-heart"></i>';
              }

              Swal.fire({
                title: "Deleted!",
                text: "The plan has been deleted.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            }
          });
        });
    });
  }

  clearAllPlans() {
    if (this.plans.length === 0) return;

    Swal.fire({
      title: "Clear All Plans?",
      text: "This will permanently delete all your saved plans. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, clear all!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.plans = [];
        localStorage.removeItem(this.key);

        document.querySelectorAll("[data-plan-id]").forEach((icon) => {
          icon.classList.remove("saved");
          icon.innerHTML = '<i class="fa-regular fa-heart"></i>';
        });

        this.renderPlans();
        this.updateCounters();

        Swal.fire({
          title: "All Cleared!",
          text: "All your plans have been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }

  updateCounters() {
    const counts = {
      all: this.plans.length,
      holiday: this.plans.filter((p) => p.type === "holiday").length,
      event: this.plans.filter((p) => p.type === "event").length,
      longWeekend: this.plans.filter((p) => p.type === "longWeekend").length,
    };

    document.getElementById("filter-all-count").textContent = counts.all;
    document.getElementById("filter-holiday-count").textContent =
      counts.holiday;
    document.getElementById("filter-event-count").textContent = counts.event;
    document.getElementById("filter-lw-count").textContent = counts.longWeekend;

    const plansBadge = document.getElementById("plans-count");
    if (plansBadge) {
      if (counts.all > 0) {
        plansBadge.textContent = counts.all;
        plansBadge.classList.remove("hidden");
      } else {
        plansBadge.textContent = 0;
        plansBadge.classList.add("hidden");
      }
    }

    const statSavedEl = document.getElementById("stat-saved");
    if (statSavedEl) {
      statSavedEl.textContent = counts.all;
    }
  }

  isPlanSaved(planData) {
    return this.plans.some(
      (p) =>
        p.type === planData.type &&
        ((p.name && planData.name && p.name === planData.name) ||
          (p.startDate &&
            planData.startDate &&
            p.startDate === planData.startDate)),
    );
  }
}
