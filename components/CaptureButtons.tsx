"use client";
import { useRef } from "react";
import { useT } from "./LangProvider";

export function CaptureButtons({ onFile, disabled }: { onFile: (f: File) => void; disabled?: boolean }) {
  const { t } = useT();
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (f) onFile(f);
  };

  return (
    <div className="flex flex-col gap-3">
      <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={handle} />
      <input ref={gallery} type="file" accept="image/*" hidden onChange={handle} />
      <button
        disabled={disabled}
        onClick={() => camera.current?.click()}
        className="rounded-2xl bg-blue-600 py-5 text-lg font-semibold active:bg-blue-700 disabled:opacity-50"
      >
        {t("scan.takePhoto")}
      </button>
      <button
        disabled={disabled}
        onClick={() => gallery.current?.click()}
        className="rounded-2xl bg-white/10 py-4 text-base font-medium active:bg-white/20 disabled:opacity-50"
      >
        {t("scan.gallery")}
      </button>
    </div>
  );
}
