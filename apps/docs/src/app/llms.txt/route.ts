import { source } from "@/lib/source";

export const revalidate = false;

export async function GET() {
  const lines: string[] = [];
  lines.push("# Documentation");
  lines.push("");
  for (const page of source.getPages()) {
    lines.push(`- [${page.data.title}](${page.url}): ${page.data.description}`);
  }
  return await Promise.resolve(new Response(lines.join("\n")));
}
