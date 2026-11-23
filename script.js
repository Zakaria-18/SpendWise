
(() => {
  "use strict";

  const STORAGE_KEY = "spendwise.transactions.v2";
  const BUDGET_KEY = "spendwise.monthlyBudget.v1";
  const DEFAULT_BUDGET = 50000;

  const CATEGORIES = [
    "Food", "Transport", "Rent", "Entertainment",
    "Savings", "Utilities", "Other"
  ];

  const CATEGORY_ICONS = {
    Food: "☕",
    Transport: "↗",
    Rent: "⌂",
    Entertainment: "♫",
    Savings: "◈",
    Utilities: "ϟ",
    Other: "•"
  };

  const $ = (selector) => document.querySelector(selector);

  const elements = {
    list: $("#transaction-list"),
    empty: $("#empty-state"),
    count: $("#transaction-count"),
    dialog: $("#transaction-dialog"),
    form: $("#transaction-form"),
    formError: $("#form-error"),
    budgetDialog: $("#budget-dialog"),
    budgetForm: $("#budget-form"),
    toast: $("#toast"),
    categoryBreakdown: $("#category-breakdown"),
    categoryEmpty: $("#category-empty")
  };

  function todayISO() {
    const date = new Date();
    const local = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return local.toISOString().slice(0, 10);
  }

  function money(value) {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function makeId() {
    return window.crypto && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  const sampleTransactions = [
    {
      id: "sample-1",
      name: "Weekly groceries",
      amount: 3850,
      category: "Food",
      date: todayISO()
    },
    {
      id: "sample-2",
      name: "Matatu fare",
      amount: 650,
      category: "Transport",
      date: todayISO()
    },
    {
      id: "sample-3",
      name: "Monthly rent",
      amount: 18000,
      category: "Rent",
      date: todayISO()
    },
    {
      id: "sample-4",
      name: "Internet subscription",
      amount: 2500,
      category: "Utilities",
      date: todayISO()
    }
  ];

  function isValidTransaction(item) {
    return item &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      Number.isFinite(Number(item.amount)) &&
      Number(item.amount) > 0 &&
      CATEGORIES.includes(item.category) &&
      /^\d{4}-\d{2}-\d{2}$/.test(item.date);
  }

  function readTransactions() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

      if (Array.isArray(saved)) {
        return saved.filter(isValidTransaction);
      }
    } catch (error) {
      console.warn("Could not read saved transactions:", error);
    }

    return sampleTransactions.map(item => ({ ...item }));
  }

  let transactions = readTransactions();

  let monthlyBudget =
    Number(localStorage.getItem(BUDGET_KEY)) || DEFAULT_BUDGET;

  function persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(transactions)
      );

      localStorage.setItem(
        BUDGET_KEY,
        String(monthlyBudget)
      );
    } catch (error) {
      showToast("Unable to save data in this browser.");
      console.error("Storage error:", error);
    }
  }

  function currentMonthTransactions() {
    const month = todayISO().slice(0, 7);

    return transactions.filter(item =>
      item.date.slice(0, 7) === month
    );
  }

  function sum(items) {
    return items.reduce(
      (total, item) => total + Number(item.amount),
      0
    );
  }

  function formatDate(dateString) {
    return new Intl.DateTimeFormat("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(new Date(`${dateString}T00:00:00`));
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("show");

    window.clearTimeout(showToast.timer);

    showToast.timer = window.setTimeout(() => {
      elements.toast.classList.remove("show");
    }, 2600);
  }

  function renderSummary() {
    const monthItems = currentMonthTransactions();
    const spent = sum(monthItems);
    const remaining = monthlyBudget - spent;

    const percentage = monthlyBudget > 0
      ? Math.min((spent / monthlyBudget) * 100, 100)
      : 0;

    $("#total-balance").textContent = money(remaining);
    $("#total-balance").style.color =
      remaining < 0 ? "#ff929a" : "#fff";

    $("#total-budget").textContent = money(monthlyBudget);
    $("#total-spent").textContent = money(spent);

    $("#spent-note").textContent =
      `${monthItems.length} transaction${monthItems.length === 1 ? "" : "s"} this month`;

    $("#balance-track-fill").style.width = `${percentage}%`;

    $("#budget-used-label").textContent =
      `${Math.round(spent / monthlyBudget * 100)}%`;

    $("#spending-status").textContent =
      remaining < 0
        ? "Over budget"
        : percentage >= 85
          ? "Near budget limit"
          : "On track";

    $("#spending-status").style.background =
      remaining < 0 ? "#fff0f1" : "";

    $("#spending-status").style.color =
      remaining < 0 ? "#c44755" : "";

    $("#budget-progress-amount").textContent = money(spent);

    $("#budget-progress-percent").textContent =
      `${Math.round(spent / monthlyBudget * 100)}% used`;

    $("#budget-progress-fill").style.width = `${percentage}%`;

    $("#budget-progress-fill").style.background =
      remaining < 0 ? "var(--red)" : "";

    $("#budget-remaining-caption").textContent =
      `${money(Math.abs(remaining))} ${remaining < 0 ? "over budget" : "remaining"}`;

    $("#budget-tip").textContent =
      remaining < 0
        ? "You have exceeded this month's budget. Review your categories and adjust your plan."
        : percentage >= 85
          ? "You are close to your monthly limit. Keep an eye on non-essential spending."
          : "You are within your monthly budget. Keep tracking your spending to stay in control.";
  }

  function renderTransactions() {
    const query = $("#search-input").value.trim().toLowerCase();
    const category = $("#category-filter").value;

    const filtered = [...transactions]
      .filter(item =>
        category === "all" || item.category === category
      )
      .filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      )
      .sort((a, b) => b.date.localeCompare(a.date));

    elements.list.innerHTML = filtered.map(item => `
      <tr>
        <td>
          <div class="transaction-name">
            <span class="transaction-symbol">
              ${CATEGORY_ICONS[item.category]}
            </span>
            <span>${escapeHTML(item.name)}</span>
          </div>
        </td>
        <td>
          <span class="category-badge">
            ${escapeHTML(item.category)}
          </span>
        </td>
        <td class="transaction-date">
          ${formatDate(item.date)}
        </td>
        <td class="amount align-right">
          ${money(Number(item.amount))}
        </td>
        <td>
          <div class="action-group">
            <button
              class="row-action"
              type="button"
              data-action="edit"
              data-id="${escapeHTML(item.id)}"
              aria-label="Edit ${escapeHTML(item.name)}"
              title="Edit">✎</button>

            <button
              class="row-action delete"
              type="button"
              data-action="delete"
              data-id="${escapeHTML(item.id)}"
              aria-label="Delete ${escapeHTML(item.name)}"
              title="Delete">×</button>
          </div>
        </td>
      </tr>
    `).join("");

    elements.empty.hidden = filtered.length > 0;

    elements.count.textContent =
      `${filtered.length} transaction${filtered.length === 1 ? "" : "s"}`;
  }

  function renderCategories() {
    const totals = {};

    currentMonthTransactions().forEach(item => {
      totals[item.category] =
        (totals[item.category] || 0) + Number(item.amount);
    });

    const entries = Object.entries(totals)
      .sort((a, b) => b[1] - a[1]);

    const largest = Math.max(
      1,
      ...entries.map(entry => entry[1])
    );

    elements.categoryEmpty.hidden = entries.length > 0;

    elements.categoryBreakdown.innerHTML = entries.map(
      ([category, amount]) => `
        <div>
          <div class="category-row-top">
            <span class="category-name">
              ${CATEGORY_ICONS[category]} &nbsp;${escapeHTML(category)}
            </span>
            <span class="category-total">${money(amount)}</span>
          </div>
          <div class="category-bar">
            <span style="width:${(amount / largest) * 100}%"></span>
          </div>
        </div>
      `
    ).join("");
  }

  function render() {
    renderSummary();
    renderTransactions();
    renderCategories();

    $("#current-year").textContent =
      new Date().getFullYear();
  }

  function openTransactionDialog(transaction = null) {
    elements.form.reset();
    elements.formError.textContent = "";

    $("#transaction-id").value =
      transaction ? transaction.id : "";

    $("#dialog-title").textContent =
      transaction ? "Edit transaction" : "Add transaction";

    $("#save-transaction").textContent =
      transaction ? "Save changes" : "Save transaction";

    $("#transaction-name").value =
      transaction ? transaction.name : "";

    $("#transaction-amount").value =
      transaction ? transaction.amount : "";

    $("#transaction-category").value =
      transaction ? transaction.category : "Food";

    $("#transaction-date").value =
      transaction ? transaction.date : todayISO();

    elements.dialog.showModal();
    $("#transaction-name").focus();
  }

  elements.form.addEventListener("submit", event => {
    event.preventDefault();

    const id = $("#transaction-id").value;
    const name = $("#transaction-name").value.trim();
    const amount = Number($("#transaction-amount").value);
    const category = $("#transaction-category").value;
    const date = $("#transaction-date").value;

    if (
      !name ||
      name.length > 70 ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !CATEGORIES.includes(category) ||
      !date ||
      date > todayISO()
    ) {
      elements.formError.textContent =
        "Enter a valid description, positive amount, category and date (today or earlier).";
      return;
    }

    const record = {
      id: id || makeId(),
      name,
      amount: Math.round(amount * 100) / 100,
      category,
      date
    };

    if (id) {
      transactions = transactions.map(item =>
        item.id === id ? record : item
      );

      showToast("Transaction updated.");
    } else {
      transactions.push(record);
      showToast("Transaction added.");
    }

    persist();
    elements.dialog.close();
    render();
  });

  elements.list.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const item = transactions.find(transaction =>
      transaction.id === button.dataset.id
    );

    if (!item) return;

    if (button.dataset.action === "edit") {
      openTransactionDialog(item);
    } else if (
      button.dataset.action === "delete" &&
      window.confirm(`Delete "${item.name}"?`)
    ) {
      transactions = transactions.filter(
        transaction => transaction.id !== item.id
      );

      persist();
      render();
      showToast("Transaction deleted.");
    }
  });

  $("#open-form-button").addEventListener("click", () =>
    openTransactionDialog()
  );

  $("#close-dialog").addEventListener("click", () =>
    elements.dialog.close()
  );

  $("#cancel-dialog").addEventListener("click", () =>
    elements.dialog.close()
  );

  elements.dialog.addEventListener("click", event => {
    if (event.target === elements.dialog) {
      elements.dialog.close();
    }
  });

  $("#search-input").addEventListener("input", renderTransactions);
  $("#category-filter").addEventListener("change", renderTransactions);

  function openBudgetDialog() {
    $("#budget-input").value = monthlyBudget;
    elements.budgetDialog.showModal();
  }

  $("#edit-budget-button").addEventListener("click", openBudgetDialog);

  $("#close-budget-dialog").addEventListener("click", () =>
    elements.budgetDialog.close()
  );

  $("#cancel-budget").addEventListener("click", () =>
    elements.budgetDialog.close()
  );

  elements.budgetForm.addEventListener("submit", event => {
    event.preventDefault();

    const value = Number($("#budget-input").value);

    if (!Number.isFinite(value) || value <= 0) return;

    monthlyBudget = Math.round(value * 100) / 100;

    persist();
    elements.budgetDialog.close();
    render();

    showToast("Monthly budget updated.");
  });

  $("#export-button").addEventListener("click", () => {
    if (!transactions.length) {
      showToast("There are no transactions to export.");
      return;
    }

    const columns = [
      "Description",
      "Amount (KES)",
      "Category",
      "Date"
    ];

    const rows = transactions.map(item => [
      item.name,
      item.amount,
      item.category,
      item.date
    ]);

    const csv = [columns, ...rows]
      .map(row => row.map(value =>
        `"${String(value).replace(/"/g, '""')}"`
      ).join(","))
      .join("\r\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `spendwise-transactions-${todayISO()}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showToast("Your CSV export is ready.");
  });

  $("#menu-toggle").addEventListener("click", () => {
    const sidebar = $("#sidebar");
    const isOpen = sidebar.classList.toggle("open");

    $("#menu-toggle").setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-link").forEach(item =>
        item.classList.remove("active")
      );

      link.classList.add("active");
      $("#sidebar").classList.remove("open");
      $("#menu-toggle").setAttribute("aria-expanded", "false");
    });
  });

  $("#today-label").textContent =
    new Intl.DateTimeFormat("en-KE", {
      weekday: "long",
      day: "numeric",
      month: "long"
    }).format(new Date()).toUpperCase();

  persist();
  render();
})();
