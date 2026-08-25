declare module "markdown-it" {
  type Token = { tag: string };
  type Renderer = {
    renderToken(tokens: Token[], index: number, options: unknown): string;
    rules: Record<string, RendererRule | undefined>;
  };
  type RendererRule = (
    tokens: Token[],
    index: number,
    options: unknown,
    env: unknown,
    renderer: Renderer
  ) => string;

  export default class MarkdownIt {
    constructor(options?: Record<string, unknown>);
    renderer: Renderer;
    validateLink: (value: string) => boolean;
    render(value: string): string;
    renderInline(value: string): string;
  }
}
