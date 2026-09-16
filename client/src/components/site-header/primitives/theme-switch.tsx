import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

function applyMode(mode: ThemeMode) {
  if (
    mode !== "system" ||
    (!("theme" in localStorage) && window.matchMedia(`(prefers-color-scheme: ${mode})`).matches)
  ) {
    document.documentElement.setAttribute("data-color-mode", mode);
  } else {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    if (mediaQuery.matches) {
      document.documentElement.setAttribute("data-color-mode", "dark");
    } else {
      document.documentElement.setAttribute("data-color-mode", "light");
    }
  }
  window.dispatchEvent(new Event("colorSchemeChange"));
}

function ThemeButton({
  current,
  mode,
  label,
  icon,
  onClick,
}: {
  current: ThemeMode;
  label: string;
  mode: ThemeMode;
  icon: string;
  onClick: (mode: ThemeMode) => void;
}) {
  return (
    <button
      aria-label={label}
      type="button"
      onClick={() => onClick(mode)}
      className={`rounded-inherit inline-flex h-7 w-7 items-center justify-center border-0 t-primary ${
        current === mode ? "bg-w rounded-full shadow-xl shadow-light" : ""
      }`}
    >
      <i className={icon} />
    </button>
  );
}

export function ThemeSwitch() {
  const [modeState, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    const mode = (localStorage.getItem("theme") as ThemeMode) || "system";
    setModeState(mode);
    applyMode(mode);
  }, []);

  const setMode = (mode: ThemeMode) => {
    setModeState(mode);
    localStorage.setItem("theme", mode);
    applyMode(mode);
  };

  return (
    <div className="inline-flex items-center h-8 rounded-full border border-zinc-200 p-[1px] dark:border-zinc-700">
      <ThemeButton mode="light" current={modeState} label="Toggle light mode" icon="ri-sun-line" onClick={setMode} />
      <ThemeButton mode="system" current={modeState} label="Toggle system mode" icon="ri-computer-line" onClick={setMode} />
      <ThemeButton mode="dark" current={modeState} label="Toggle dark mode" icon="ri-moon-line" onClick={setMode} />
    </div>
  );
}
