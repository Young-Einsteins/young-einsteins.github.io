import { translate } from "./i18n.js";

const RATE_LIMIT_MS = 15 * 60 * 1000;
const RATE_LIMIT_KEY = "ye-contact-last-submit";

function currentLang() {
  return document.documentElement.lang === "vi" ? "vi" : "en";
}

function validateForm(form) {
  const requiredFields = Array.from(form.querySelectorAll("[required]"));
  let isValid = true;

  requiredFields.forEach((field) => {
    const errorEl = field.closest(".form-group")?.querySelector(".field-error");
    const value = field.value.trim();
    let messageKey = "";

    if (!value) {
      messageKey = "contact.form.error.required";
    } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      messageKey = "contact.form.error.email";
    } else if (field.type === "tel" && value.replace(/\D/g, "").length !== 10) {
      messageKey = "contact.form.error.phone";
    }

    field.classList.toggle("is-error", Boolean(messageKey));

    if (errorEl) {
      if (messageKey) {
        errorEl.textContent = translate(currentLang(), messageKey);
        errorEl.dataset.i18n = messageKey;
      } else {
        errorEl.textContent = "";
        errorEl.removeAttribute("data-i18n");
      }
    }

    if (messageKey) isValid = false;
  });

  return isValid;
}

export function initContactForm() {
  const contactForm = document.getElementById("contact-form");
  if (!contactForm) return;

  const formStatus = document.getElementById("form-status");
  const submitButton = contactForm.querySelector('button[type="submit"]');

  function setStatus(key, type) {
    if (!formStatus) return;
    formStatus.textContent = translate(currentLang(), key);
    formStatus.dataset.i18n = key;
    formStatus.className = `form-status mt-4 font-bold ${
      type === "pending" ? "text-brand-blue" : type === "success" ? "text-brand-green" : type === "error" ? "text-brand-red" : ""
    }`.trim();
  }

  contactForm.querySelectorAll("[required]").forEach((field) => {
    field.addEventListener("input", () => {
      field.classList.remove("is-error");
      const errorEl = field.closest(".form-group")?.querySelector(".field-error");
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.removeAttribute("data-i18n");
      }
    });
  });

  const subjectSelect = document.getElementById("subject_needed");
  const atarGroup = document.getElementById("atar_subject_group");
  const atarSelect = document.getElementById("atar_subject");

  function clearFieldError(field, group) {
    field.classList.remove("is-error");
    const errorEl = group?.querySelector(".field-error");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.removeAttribute("data-i18n");
    }
  }

  function toggleAtarSubject() {
    if (!subjectSelect || !atarGroup || !atarSelect) return;
    const showAtar = subjectSelect.value === "ATAR";
    atarGroup.classList.toggle("hidden", !showAtar);
    if (showAtar) {
      atarSelect.setAttribute("required", "");
    } else {
      atarSelect.removeAttribute("required");
      atarSelect.value = "";
      clearFieldError(atarSelect, atarGroup);
    }
  }

  subjectSelect?.addEventListener("change", toggleAtarSubject);
  atarSelect?.addEventListener("input", () => clearFieldError(atarSelect, atarGroup));
  toggleAtarSubject();

  const messageField = document.getElementById("message");
  const messageCounter = document.getElementById("message-counter");

  function updateMessageCounter() {
    if (!messageField || !messageCounter) return;
    const max = Number(messageField.getAttribute("maxlength"));
    const remaining = max - messageField.value.length;
    messageCounter.textContent = translate(currentLang(), "contact.form.charsleft").replace("{n}", remaining);
  }

  messageField?.addEventListener("input", updateMessageCounter);
  document.addEventListener("languagechange", updateMessageCounter);
  updateMessageCounter();

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (submitButton) submitButton.disabled = true;

    const lastSubmit = Number(localStorage.getItem(RATE_LIMIT_KEY) || 0);
    if (Date.now() - lastSubmit < RATE_LIMIT_MS) {
      setStatus("contact.form.status.ratelimited", "error");
      if (submitButton) submitButton.disabled = false;
      return;
    }

    if (!validateForm(contactForm)) {
      setStatus("contact.form.status.validation", "error");
      if (submitButton) submitButton.disabled = false;
      return;
    }

    setStatus("contact.form.status.sending", "pending");

    const accessKey = contactForm.dataset.web3formsAccessKey || "";

    if (!accessKey) {
      setStatus("contact.form.status.error", "error");
      if (submitButton) submitButton.disabled = false;
      return;
    }

    try {
      const formData = new FormData(contactForm);
      formData.append("access_key", accessKey);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        contactForm.reset();
        localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
        setStatus("contact.form.status.success", "success");
      } else {
        setStatus("contact.form.status.error", "error");
      }
    } catch {
      setStatus("contact.form.status.error", "error");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}
