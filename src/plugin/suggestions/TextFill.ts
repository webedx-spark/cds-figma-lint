import type { LintError } from '../errors';
import type { Suggestion } from '../suggestion';

const DEFAULT_TEXT_FILL = {
  '#1F1F1F': {
    name: 'UI/Typography/body',
    key: '1a292e6e8c406e5303e799c16680e1fe615841a9',
  },
};

export const textFill = (error: LintError): Suggestion | undefined => {
  const { node, value } = error;

  const originalNode = figma.getNodeById(node.id) as TextNode;

  if (!originalNode) return;

  if (value) {
    const style = DEFAULT_TEXT_FILL[value];

    if (style) {
      return {
        styleKey: style.key,
        message: style.name,
        reason: 'Default black',
      };
    }
  }

  if (value && value === '#000000') {
    const style = DEFAULT_TEXT_FILL['#1F1F1F'];

    if (style) {
      return {
        styleKey: style.key,
        message: style.name,
        reason: 'Default black',
      };
    }
  }
};

export const textFillFix = async (error: LintError) => {
  if (error.suggestion) {
    const style = await figma.importStyleByKeyAsync(error.suggestion.styleKey);
    const node = figma.getNodeById(error.node.id);

    if (node?.type === error.node.type) {
      node.fillStyleId = style.id;
    }
  }
};
