export interface TiptapNode {
  type: string;
  attrs?: {
    id?: string;
    label?: string;
    [key: string]: any;
  };
  content?: TiptapNode[];
  text?: string;
}

export interface TiptapDocument {
  type: 'doc';
  content?: TiptapNode[];
}
