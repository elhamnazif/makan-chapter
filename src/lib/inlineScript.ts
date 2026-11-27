// Build-time only. Bundles one of src/scripts/pages/*.ts and its imports into a single classic
// script for InlineScript.astro. Rolldown is the bundler Vite itself uses.
import { build } from 'rolldown';

const built = new Map<string, string>();

export async function inlineScript(entry: string): Promise<string> {
  // The dev server rebuilds on every request, so an edit shows on reload.
  const cached = import.meta.env.DEV ? undefined : built.get(entry);
  if (cached !== undefined) {
    return cached;
  }
  const { output } = await build({
    input: `${process.cwd()}/src/scripts/pages/${entry}.ts`,
    write: false,
    logLevel: 'warn',
    transform: { define: { 'import.meta.env.BASE_URL': JSON.stringify(import.meta.env.BASE_URL) } },
    output: { format: 'iife', minify: !import.meta.env.DEV },
  });
  // The code sits inside a <script> element, which the first "</script" in it would end.
  const code = output[0].code.replaceAll('</script', String.raw`<\/script`);
  built.set(entry, code);
  return code;
}
