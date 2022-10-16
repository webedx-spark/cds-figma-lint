import type { LintError } from '../errors';
import type { Suggestion } from '../suggestion';

const BG_STYLE_MIN_SIZE = 1000;

// TODO: figure out a way to create this map dynamically
const BG_FILL_STYLE_HEX_KEY_MAP = {
  '#FFFFFF': {
    name: 'UI/Neutral/Background (BG)/LightBG White',
    key: '10daaced36dfe78458191c7f67245e887833c837',
  },
  '#F5F7F8': {
    name: 'UI/Neutral/Background (BG)/LightBG Grey100',
    key: '23f20a18da3cbe323bdca8e6ad461fb0f2c47297',
  },
  '#F9F7EF': {
    name: 'UI/Neutral/Background (BG)/LightBG Yellow50',
    key: 'c30a3c93cbd2d2d2dc10220069db864a1d67e99c',
  },
  '#EBF3FF': {
    name: 'UI/Neutral/Background (BG)/LightBG Blue100',
    key: '2b659d64186afe058005835d64a7102db3c81baf',
  },
};

const INTERACTIVE_FILL_STYLE = {
  '#0056D2': {
    name: 'Interactive / Default Blue600',
    key: 'cd0135baa7f08a4b85ba34bb6b6e7e7c87bff849',
  },
};

export const rectangleFill = (error: LintError): Suggestion | undefined => {
  const { node, value } = error;

  const originalNode = figma.getNodeById(node.id) as RectangleNode;

  if (!originalNode) return;

  const square = Math.round(originalNode.height * originalNode.width);

  // try to find by HEX

  if (value) {
    const style = BG_FILL_STYLE_HEX_KEY_MAP[value];

    if (style) {
      return {
        styleKey: style.key,
        message: style.name,
        reason: 'Same HEX value',
      };
    }
  }

  //
  if (square > BG_STYLE_MIN_SIZE) {
    const style = BG_FILL_STYLE_HEX_KEY_MAP['#F5F7F8'];

    return {
      styleKey: style.key,
      message: style.name,
      reason: 'Area > 1000',
    };
  } else {
    const style = INTERACTIVE_FILL_STYLE['#0056D2'];

    return {
      styleKey: style.key,
      message: style.name,
      reason: 'Area < 1000',
    };
  }
};

export const rectangleFillFix = async (error: LintError) => {
  if (error.suggestion) {
    const style = await figma.importStyleByKeyAsync(error.suggestion.styleKey);
    const node = figma.getNodeById(error.node.id);

    if (node?.type === error.node.type) {
      node.fillStyleId = style.id;
      console.log('rectangleFillFix', style.id);
    }
  }
};
