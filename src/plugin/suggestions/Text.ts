import type { LintError } from '../errors';
import type { Suggestion } from '../suggestion';

const defaultFontName = 'Source Sans Pro';
const defaultWeight = 'Regular';
const defaultSize = '16';

// Partial font styles map
const FONT_MAP = {
  [defaultFontName]: {
    Regular: {
      '28': {
        key: '24c392250c9ed967ff55eba9d8be2ec6a728f2eb',
        name: 'H1 - Heading1/LG & MD -  Regular',
      },
      '24': {
        key: '',
        name: 'H1 - Heading1/XS - Regular',
      },
      '20': {
        key: 'e877b9e2a51fa96872f03a086515e3d9c6580d60',
        name: 'H2 - Heading2/Regular',
      },
      '16': {
        key: '72229936faa31c32e5ca8b0446c3dfa892beef06',
        name: 'Body1 (Default) / Regular',
      },
      '14': {
        key: '3f6359a7ed80098fcbf617d68ce6adefd9930b10',
        name: 'Body2/Regular',
      },
    },
    Bold: {
      '14': {
        key: '546203a44ff0287d1f5e8595b70600e7d434ecde',
        name: 'H4 - Heading4/Bold',
      },
      '16': {
        key: 'a63cd13d6f00524bf95b20ad366d786e5bafeb77',
        name: 'H3 - Heading3/Bold',
      },
    },
    Semibold: {
      '28': {
        key: '24c392250c9ed967ff55eba9d8be2ec6a728f2eb',
        name: 'H1 - Heading1/LG & MD - SemiBold',
      },
      '24': {
        key: 'c6f2c5cbc9e3bd66815dd0fb52474006b388d1bd',
        name: 'H1 - Heading1/XS - SemiBold',
      },
      '20': {
        key: '9e7b1ddfbf738d734cdb9790b613469128b4abbe',
        name: 'H2 - Heading2/Semibold',
      },
      '16': {
        key: 'bd4ea745195be4dc27bcd62ad519bb7bfba4dd89',
        name: 'H3 - Heading3/Semibold',
      },
    },
  },
};

export const text = (error: LintError): Suggestion | undefined => {
  const { node, value } = error;

  const originalNode = figma.getNodeById(node.id) as TextNode;

  if (!originalNode) return;

  let style: { name: string; key: string } =
    FONT_MAP[defaultFontName][defaultWeight][defaultSize];

  const { fontName, fontSize } = originalNode;

  if (fontName && typeof fontName !== 'symbol') {
    const { family, style: fontStyle } = fontName;

    // try to find style by font name and style (Regular|Bold etc)
    const fontSizeMap = FONT_MAP[family][fontStyle];
    if (fontSizeMap) {
      if (fontSize && typeof fontSize !== 'symbol') {
        let style = fontSizeMap[fontSize.toString()];

        if (style) {
          return {
            message: style.name,
            styleKey: style.key,
            reason: 'Found exact match',
          };
        } else {
          style = fontSizeMap['16'];

          return {
            message: style.name,
            styleKey: style.key,
            reason: 'No exact size found - use default ',
          };
        }
      }
    } else {
      // use default font name and maybe suggest style with same weight/size
      let fontSizeMap = FONT_MAP[defaultFontName][fontStyle];

      if (fontSizeMap) {
        style = fontSizeMap[fontSize];

        if (style) {
          return {
            message: style.name,
            styleKey: style.key,
            reason: 'No match - use default fontName',
          };
        }
      } else {
        // suggest by font size of default style and default weight
        let fontSizeMap = FONT_MAP[defaultFontName][defaultWeight];
        if (fontSizeMap[fontSize]) {
          // font font size
          style = fontSizeMap[fontSize];

          if (style) {
            return {
              styleKey: style.key,
              message: style.name,
              reason: 'No match - use default fontName and default fontWeight',
            };
          }
        } else {
          return {
            styleKey: style.key,
            message: style.name,
            reason: 'No match - use library default font',
          };
        }
      }
    }
  }
};

export const textFix = async (error: LintError) => {
  if (error.suggestion) {
    const style = await figma.importStyleByKeyAsync(error.suggestion.styleKey);
    const node = figma.getNodeById(error.node.id) as TextNode;

    if (node?.type === error.node.type) {
      node.textStyleId = style.id;
    }
  }
};
