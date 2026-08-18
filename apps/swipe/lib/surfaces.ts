export type SurfaceRef = {
  href: string;
  label: string;
};

export const SURFACE_SCHEME = "getfkd://";

export function surfaceHref(...parts: string[]): string {
  const path = parts
    .map((part) =>
      part
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    )
    .filter(Boolean)
    .join("/");
  return `${SURFACE_SCHEME}${path || "app"}`;
}

export function surfaceFromRoute(route: string, label?: string): SurfaceRef {
  const clean = route.split("?")[0] || "/";
  const parts = clean.split("/").filter(Boolean);
  return {
    href: surfaceHref("route", ...parts),
    label: label || (parts[parts.length - 1] ?? "App"),
  };
}

export function surfaceTag(href: string): string {
  return `surface:${href.replace(SURFACE_SCHEME, "").replace(/[^a-z0-9:_-]+/g, "-").slice(0, 24)}`;
}

export function withSurfaceLine(href: string, body = ""): string {
  const line = `Surface: ${href}`;
  const text = body.trim();
  return text ? `${line}\n\n${text}` : line;
}
