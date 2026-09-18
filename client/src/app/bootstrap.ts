import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { listenSystemMode } from "../utils/darkModeUtils";

let bootstrapped = false;

export function bootstrapApp() {
  if (bootstrapped) {
    return;
  }

  listenSystemMode();

  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      backend: {
        loadPath: "/locales/{{lng}}/{{ns}}.json",
      },
      fallbackLng: "zh",
      interpolation: {
        escapeValue: false,
      },
      detection: {
        // 跟随浏览器语言：中文浏览器默认中文、英文浏览器默认英文；
        // localStorage 在前，保证手动切换语言后刷新仍保持
        order: ["localStorage", "sessionStorage", "navigator"],
        caches: ["localStorage"],
      },
    });

  bootstrapped = true;
}
