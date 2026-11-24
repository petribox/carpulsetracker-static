/*
 * Language switching for the static page. Works from a web server and when
 * index.html is opened directly from disk (no fetch, no server needed).
 *
 * To add a language:
 *   1. Copy locales/en.js to locales/<code>.js and translate the values
 *      (change the key after window.CPT_LOCALES. and the "name" entry).
 *   2. Add <script src="locales/<code>.js" defer></script> to index.html,
 *      above the js/i18n.js line. The dropdown order follows script order.
 *
 * English is also written into index.html, so the page still reads correctly
 * if a locale file is missing.
 */
(function () {
  "use strict";

  var DEFAULT_LANG = "en";
  var STORAGE_KEY = "cpt-lang";
  var locales = window.CPT_LOCALES || {};
  var codes = Object.keys(locales);
  var select = document.getElementById("lang");

  function isSupported(code) {
    return Object.prototype.hasOwnProperty.call(locales, code);
  }

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function writeStored(code) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* ignore */ }
  }

  function pickInitial() {
    var fromQuery = new URLSearchParams(window.location.search).get("lang");
    if (fromQuery && isSupported(fromQuery)) { return fromQuery; }

    var stored = readStored();
    if (stored && isSupported(stored)) { return stored; }

    var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (var i = 0; i < prefs.length; i++) {
      var short = String(prefs[i] || "").toLowerCase().split("-")[0];
      if (isSupported(short)) { return short; }
    }
    return DEFAULT_LANG;
  }

  function setMeta(selector, value) {
    var el = document.querySelector(selector);
    if (el && value) { el.setAttribute("content", value); }
  }

  function apply(dict, code) {
    document.documentElement.lang = code;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = dict[el.getAttribute("data-i18n")];
      if (value != null) { el.textContent = value; }
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var value = dict[el.getAttribute("data-i18n-html")];
      if (value != null) { el.innerHTML = value; }
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var value = dict[el.getAttribute("data-i18n-aria")];
      if (value != null) { el.setAttribute("aria-label", value); }
    });

    if (dict["meta.title"]) { document.title = dict["meta.title"]; }
    setMeta('meta[name="description"]', dict["meta.description"]);
    setMeta('meta[property="og:title"]', dict["meta.title"]);
    setMeta('meta[property="og:description"]', dict["meta.description"]);
  }

  function setLang(code, persist) {
    if (!isSupported(code)) { code = DEFAULT_LANG; }
    if (!isSupported(code)) { return; }
    apply(locales[code], code);
    select.value = code;
    if (persist) { writeStored(code); }
  }

  if (!codes.length) { return; }

  select.innerHTML = "";
  codes.forEach(function (code) {
    var option = document.createElement("option");
    option.value = code;
    option.textContent = locales[code].name || code;
    select.appendChild(option);
  });

  select.addEventListener("change", function () {
    setLang(select.value, true);
  });

  setLang(pickInitial(), false);
})();
