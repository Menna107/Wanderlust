export class MyPlansManager {
  constructor() {
    this.key = "myPlans"; // localStorage key
    this.plans = JSON.parse(localStorage.getItem(this.key)) || [];
    this.currentFilter = "all";

    const clearAllBtn = document.getElementById("clear-all-plans-btn");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () => {
        this.clearAllPlans();
      });
    }

    this.initFilters();
    this.renderPlans();
    this.updateCounters();
  }

  initFilters() {
    document.querySelectorAll(".plan-filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".plan-filter")
          .forEach((b) => b.classList.remove("active"));

        btn.classList.add("active");
        this.currentFilter = btn.dataset.filter.toLowerCase();
        this.renderPlans();
      });
    });
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

    const filteredPlans =
      this.currentFilter === "all"
        ? this.plans
        : this.plans.filter(
            (p) => p.type && p.type.toLowerCase() === this.currentFilter,
          );

    if (filteredPlans.length === 0) {
      plansContent.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fa-solid fa-filter-circle-xmark"></i>
          </div>
          <h3>No Plans Found</h3>
          <p>No plans match this filter.</p>
        </div>
      `;
      return;
    }

    filteredPlans.forEach((plan) => {
      const planType = plan.type?.toLowerCase();

      const planCard = document.createElement("div");
      planCard.className = "plan-card";

      const dateText =
        plan.startDate && plan.endDate
          ? `${this.formatPlanDate(plan.startDate)} - ${this.formatPlanDate(
              plan.endDate,
            )}`
          : plan.date
            ? this.formatPlanDate(plan.date)
            : "";

      const dayCountText =
        planType === "longweekend" && plan.dayCount
          ? `${plan.dayCount} Day${plan.dayCount > 1 ? "s" : ""} Long Weekend`
          : "";

      const extraDaysText =
        planType === "longweekend"
          ? plan.needBridgeDay
            ? "Requires taking a bridge day off"
            : "No extra days needed"
          : "";

      const displayText = plan.title || plan.description || plan.country || "";

      planCard.innerHTML = `
        <span class="plan-card-type ${planType}">
          ${planType === "longweekend" ? "Long Weekend" : plan.type}
        </span>

        <div class="plan-card-content">
          <h4>${dayCountText || plan.name || "Untitled Plan"}</h4>

          <div class="plan-card-details">
            <div>
              <i class="fa-solid fa-calendar"></i> ${dateText}
            </div>
            <div>
              <i class="fa-solid fa-location-dot"></i>
              ${planType === "longweekend" ? extraDaysText : displayText}
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
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
          }).then((result) => {
            if (result.isConfirmed) {
              this.removePlan(plan);
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
