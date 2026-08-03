"use strict";

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-navigation");
const yearElement = document.querySelector("#current-year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear().toString();
}

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  navigation.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLAnchorElement)) {
      return;
    }

    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.focus();
  });
}

const goalFilter = document.querySelector("[data-goal-filter]");

if (goalFilter) {
  const checkboxes = Array.from(
    goalFilter.querySelectorAll('input[name="faculty-goal"]')
  );
  const resultPanels = Array.from(
    document.querySelectorAll("[data-goal-panel]")
  );
  const statusElement = goalFilter.querySelector("[data-goal-status]");
  const clearButton = goalFilter.querySelector("[data-goal-clear]");
  const emptyState = document.querySelector("[data-goal-empty]");
  const validGoals = new Set(checkboxes.map((checkbox) => checkbox.value));

  const requestedGoals = new URLSearchParams(window.location.search)
    .getAll("goal")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value) => validGoals.has(value));

  if (requestedGoals.length > 0) {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = requestedGoals.includes(checkbox.value);
    });
  }

  const updateGoalResults = () => {
    const selected = checkboxes
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    resultPanels.forEach((panel) => {
      const panelGoals = (panel.dataset.goals || "")
        .split(/\s+/)
        .filter(Boolean);

      panel.hidden = !panelGoals.some((goal) => selected.includes(goal));
    });

    if (emptyState) {
      emptyState.hidden = selected.length !== 0;
    }

    if (statusElement) {
      const visibleCount = resultPanels.filter((panel) => !panel.hidden).length;
      statusElement.textContent =
        selected.length === 0
          ? "No goals selected."
          : `${selected.length} goal${selected.length === 1 ? "" : "s"} selected. Showing ${visibleCount} next-step section${visibleCount === 1 ? "" : "s"}.`;
    }
  };

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateGoalResults);
  });

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });

      updateGoalResults();
      checkboxes[0]?.focus();
    });
  }

  updateGoalResults();
}
