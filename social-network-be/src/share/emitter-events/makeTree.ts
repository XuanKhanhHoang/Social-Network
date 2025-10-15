export function makeEventTree<
  const T extends Record<string, any>,
  const P extends string,
>(prefix: P, tree: T) {
  function buildTree(base: string, node: Record<string, any>) {
    const result: any = {};
    for (const key in node) {
      const value = node[key];
      result[key] =
        typeof value === 'object'
          ? buildTree(`${base}.${key}`, value)
          : `${base}.${key}`;
    }
    return result;
  }

  const events = buildTree(prefix, tree) as {
    [K in keyof T]: T[K] extends Record<string, any>
      ? ReturnType<
          typeof makeEventTree<T[K], `${P}.${Extract<K, string>}`>
        >['events']
      : `${P}.${Extract<K, string>}`;
  };

  function key<K extends keyof T>(
    k: K,
  ): T[K] extends Record<string, any> ? never : `${P}.${Extract<K, string>}` {
    return `${prefix}.${String(k)}` as any;
  }

  return { events, key };
}
