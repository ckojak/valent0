import { createFileRoute, notFound } from "@tanstack/react-router";
import { CategoryPage } from "@/components/category/CategoryPage";
import { CATEGORY_CONFIGS, isCategorySlug } from "@/lib/category-configs";

export const Route = createFileRoute("/seguros/$slug")({
  loader: ({ params }) => {
    if (!isCategorySlug(params.slug)) throw notFound();
    return { config: CATEGORY_CONFIGS[params.slug] };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.config;
    if (!c) return { meta: [{ title: "Categoria não encontrada — VALENT" }] };
    return {
      meta: [
        { title: c.metaTitle },
        { name: "description", content: c.metaDescription },
        { property: "og:title", content: c.metaTitle },
        { property: "og:description", content: c.metaDescription },
      ],
    };
  },
  component: SegurosCategoria,
  errorComponent: ({ error, reset }) => (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <h1 className="font-display text-xl font-extrabold text-foreground">Não conseguimos carregar essa categoria</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground">Tentar novamente</button>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <h1 className="font-display text-xl font-extrabold text-foreground">Categoria não encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">Volte para a home e escolha uma categoria disponível.</p>
      </div>
    </div>
  ),
});

function SegurosCategoria() {
  const { config } = Route.useLoaderData();
  return <CategoryPage config={config} />;
}
