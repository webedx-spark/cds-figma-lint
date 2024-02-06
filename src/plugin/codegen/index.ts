import get from 'just-safe-get';
import semanticTokens from '../semantic-tokens.json';
// Manually import tokens until available in @couresera/cds-design-tokens
import globalTokens from '../global-tokens.json';
import kebabCase from 'just-kebab-case';

import { isSceneNode, isAutoLayout } from '../utils';

const spacingTokensByValue = Object.entries(globalTokens.spacing).reduce(
  (acc, [key, value]) => {
    acc[value.value] = key;
    return acc;
  },
  {}
);

function createGlobalToken(token: any): string {
  return `${token?.value
    .replace('color.', '')
    .replace(/[\{|\}|]/g, '')
    .replace('.', '.[')}]`;
}

const extractColorTokens = (node: SceneNode) => {
  const colorStyles: Array<{ name: string; property: string; global: string }> =
    [];

  if (isSceneNode(node)) {
    console.log(node);
    if ('fillStyleId' in node && typeof node.fillStyleId === 'string') {
      let property = '';

      if (node.type === 'TEXT') {
        property = 'color';
      }

      if (
        node.type === 'RECTANGLE' ||
        node.type === 'ELLIPSE' ||
        node.type === 'POLYGON' ||
        node.type === 'STAR' ||
        node.type === 'VECTOR' ||
        node.type === 'INSTANCE' ||
        node.type === 'FRAME'
      ) {
        property = 'background-color';
      }

      const colorStyle = figma.getStyleById(node.fillStyleId as string);

      if (colorStyle) {
        const tokenPath = colorStyle.name.replaceAll('/', '.');
        const token = get(semanticTokens, `color.${tokenPath}`);

        if (token) {
          colorStyles.push({
            global: createGlobalToken(token), // serialize global token
            name: `${colorStyle.name.replace('/', '-')}`,
            property: property,
          });
        }
      }
    }

    if ('strokeStyleId' in node && typeof node.strokeStyleId === 'string') {
      const strokeStyle = figma.getStyleById(node.strokeStyleId as string);

      if (strokeStyle) {
        const tokenPath = strokeStyle.name.replaceAll('/', '.');
        const token = get(semanticTokens, `color.${tokenPath}`);

        if (token) {
          colorStyles.push({
            global: createGlobalToken(token), // serialize global token
            name: `${strokeStyle.name.replace('/', '-')}`,
            property: 'border-color',
          });
        }
      }
    }
  }

  return colorStyles;
};

const extractTypographyTokens = (node: SceneNode) => {
  const typographyStyles: Array<{ name: string; property: string }> = [];

  if (isSceneNode(node) && node.type === 'TEXT') {
    if ('textStyleId' in node && typeof node.textStyleId === 'string') {
      const textStyle = figma.getStyleById(node.textStyleId as string);
      if (textStyle) {
        typographyStyles.push({
          name: textStyle.name
            .replace(' / ', '-')
            .replace('/', '-')
            .replace(' ', ''),
          property: 'font',
        });
      }
    }
  }

  return typographyStyles;
};

const extractSpacingTokens = (node: SceneNode) => {
  const spacingStyles: Array<{ value: number[]; property: string }> = [];

  if (isSceneNode(node) && isAutoLayout(node)) {
    const {
      paddingLeft,
      paddingBottom,
      paddingRight,
      paddingTop,
      itemSpacing,
    } = node;
    spacingStyles.push({
      value: [paddingTop, paddingRight, paddingBottom, paddingLeft],
      property: 'padding',
    });

    if (itemSpacing) {
      if (spacingTokensByValue[itemSpacing]) {
        spacingStyles.push({
          value: [itemSpacing],
          property: 'gap',
        });
      }
    }
  }

  return spacingStyles;
};

const generateCode = async (node: SceneNode) => {
  const sections: CodegenResult[] = [];
  const colorStyles = extractColorTokens(node);
  // enable when tyopography styles are available
  const typographyStyles = extractTypographyTokens(node);
  const spacing = extractSpacingTokens(node);

  if (colorStyles.length || spacing.length) {
    sections.push({
      title: 'CDS ThemeContext (Deprecated)',
      language: 'TYPESCRIPT',
      code: [
        colorStyles.length > 0
          ? colorStyles
              .map(
                ({ property, global }) =>
                  `${property}: \${theme.palette.${global}};`
              )
              .join('\n')
          : undefined,
        spacing.length > 0
          ? spacing
              .map(
                ({ property, value }) =>
                  `${property}: \${theme.spacing(${value.join(', ')})};`
              )
              .join('\n')
          : undefined,
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }

  if (colorStyles.length || spacing.length) {
    sections.push({
      title: 'CDS CSS Variables',
      language: 'TYPESCRIPT',
      code: [
        // typographyStyles.length > 0
        //   ? typographyStyles
        //       .map(({ name, property }) => {
        //         return `${property}: var(--cds-typography-${kebabCase(name)});`;
        //       })
        //       .join('\n')
        //   : '',
        colorStyles.length > 0
          ? colorStyles
              .map(
                ({ name, property }) =>
                  `${property}: var(--cds-color-${kebabCase(name)});`
              )
              .join('\n')
          : undefined,
        spacing.length > 0
          ? spacing
              .map(
                ({ property, value }) =>
                  `${property}: ${value
                    .map((spacing) =>
                      spacingTokensByValue[spacing]
                        ? `var(--cds-spacing-${spacingTokensByValue[spacing]})`
                        : spacing
                    )
                    .join(' ')};`
              )
              .join('\n')
          : undefined,
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }

  const cssProps = await node.getCSSAsync();
  const cssStr = Object.entries(cssProps)
    .map(([k, v]) => `${k}: ${v};`)
    .join('\n');

  sections.push({
    language: 'CSS',
    title: 'CSS',
    code: cssStr,
  });

  return sections;
};

export default generateCode;
