import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/segfy-teste")({
  head: () => ({
    meta: [
      { title: "Teste Segfy White Label — VALENT" },
      { name: "description", content: "Página isolada para teste do bundle white label da Segfy." },
    ],
  }),
  component: SegfyTestePage,
});

function SegfyTestePage() {
  useEffect(() => {
    const token = import.meta.env.VITE_SEGFY_TOKEN || "";
    const environment = import.meta.env.VITE_SEGFY_ENVIRONMENT || "production";
    const container = import.meta.env.VITE_SEGFY_CONTAINER || "app-propostas";
    const imagesPath = import.meta.env.VITE_SEGFY_IMAGES_PATH || "/Content/images/Seguradoras_calculo";
    const isNotShowPartners = import.meta.env.VITE_SEGFY_IS_NOT_SHOW_PARTNERS === "true" ? "true" : "false";

    const existing = document.querySelector("script[data-segfy-bundle='true']");
    if (existing) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://bundles.segfy.com/auto-bundle.js";
    script.async = true;
    script.setAttribute("data-segfy-bundle", "true");
    script.setAttribute("data-container", container);
    script.setAttribute("data-environment", environment);
    script.setAttribute("data-token", token);
    script.setAttribute("data-is-not-show-partners", isNotShowPartners);
    script.setAttribute("data-id", "");
    script.setAttribute("data-images-path", imagesPath);

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  const container = import.meta.env.VITE_SEGFY_CONTAINER || "app-propostas";

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Segfy White Label</p>
          <h1 className="mt-2 text-3xl font-bold">Teste isolado do bundle da Segfy</h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-2xl">
          <div id={container} className="min-h-[480px] rounded-xl border border-dashed border-white/10 bg-slate-950/80" />
        </div>
      </div>
    </div>
  );
}
