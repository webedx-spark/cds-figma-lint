import { defaultSettings } from '../constants';
import { LintSettings, MessageType, StorageKeys } from '../types';
import { LintError } from './errors';
import { lint } from './lint';
import { suggestionFix } from './suggestion';
import { serializeNodes } from './utils';
import kebabCase from 'just-kebab-case';
import get from 'just-safe-get';

// Manually import tokens until available in @couresera/cds-design-tokens
import semanticTokens from './semantic-tokens.json';
import globalTokens from './global-tokens.json';

const spacingTokensByValue = Object.entries(globalTokens.spacing).reduce(
  (acc, [key, value]) => {
    acc[value.value] = key;
    return acc;
  }
);

function isSceneNode(node: BaseNode): node is SceneNode {
  return node.type !== 'PAGE' && node.type !== 'DOCUMENT';
}

function isAutoLayout(node: any): node is AutoLayoutMixin {
  return 'layoutMode' in node;
}

let borderRadiusArray = [0, 2, 4, 8, 16, 24, 32];
let originalNodeTree: Array<SceneNode> = [];
let lintVectors = false;

figma.skipInvisibleInstanceChildren = true;

const extractColorTokens = (node: SceneNode) => {
  const colorStyles: Array<{ name: string; property: string; global: string }> =
    [];

  if (isSceneNode(node)) {
    if ('fillStyleId' in node) {
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

        colorStyles.push({
          global: `${token?.value
            .replace('color.', '')
            .replace(/[\{|\}|]/g, '')
            .replace('.', '.[')}]`, // serialize global token
          name: `${colorStyle.name.replace('/', '-')}`,
          property: property,
        });
      }
    }
  }

  return colorStyles;
};

const extractTypographyTokens = (node: SceneNode) => {
  const typographyStyles: Array<{ name: string; property: string }> = [];

  if (isSceneNode(node) && node.type === 'TEXT') {
    if ('textStyleId' in node) {
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

  console.log(node, isAutoLayout(node));

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
      spacingStyles.push({
        value: [itemSpacing],
        property: 'gap',
      });
    }
  }

  return spacingStyles;
};

// Make sure that we're in Dev Mode and running codegen
if (figma.editorType === 'dev' && figma.mode === 'codegen') {
  // Register a callback to the "generate" event
  figma.codegen.on('generate', ({ node }) => {
    const sections: CodegenResult[] = [];
    const colorStyles = extractColorTokens(node);
    const typographyStyles = extractTypographyTokens(node);
    const spacing = extractSpacingTokens(node);

    if (colorStyles.length || spacing.length) {
      sections.push({
        title: 'CDS ThemeContext',
        language: 'TYPESCRIPT',
        code: [
          colorStyles.length > 0
            ? colorStyles
                .map(({ property, global }) => {
                  return `${property}: \${theme.palette.${global}};`;
                })
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

    if (colorStyles.length || typographyStyles.length) {
      sections.push({
        title: 'CDS CSS Variables (Beta)',
        language: 'TYPESCRIPT',
        code: [
          // typographyStyles.length > 0
          //   ? typographyStyles
          //       .map(({ name, property }) => {
          //         return `${property}: var(--cds-typography-${kebabCase(
          //           name
          //         )});`;
          //       })
          //       .join('\n')
          //   : '',
          colorStyles.length > 0
            ? colorStyles
                .map(({ name, property }) => {
                  return `${property}: var(--cds-color-${kebabCase(name)});`;
                })
                .join('\n')
            : undefined,
          spacing.length > 0
            ? spacing
                .map(
                  ({ property, value }) =>
                    `${property}: ${value
                      .map(
                        (spacing) =>
                          `var(--cds-spacing-${spacingTokensByValue[spacing]})`
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

    return sections;
  });
}

if (figma.editorType === 'figma' && figma.mode === 'default') {
  figma.showUI(__html__, { width: 360, height: 580 });
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'close') {
    figma.closePlugin();
  }

  // Fetch a specific node by ID.
  if (msg.type === MessageType.FETCH_LAYER_DATA) {
    let layer = figma.getNodeById(msg.id);
    let layerArray: Array<SceneNode> = [];

    // Ignore other layers than scene nodes
    if (!layer || !isSceneNode(layer)) return;

    // Using figma UI selection and scroll to viewport requires an array.
    layerArray.push(layer);

    // Moves the layer into focus and selects so the user can update it.
    // uncomment the line below if you want to notify something has been selected.
    // figma.notify(`Layer ${layer.name} selected`, { timeout: 750 });
    figma.currentPage.selection = layerArray;
    figma.viewport.scrollAndZoomIntoView(layerArray);

    let layerData = JSON.stringify(layer, [
      'id',
      'name',
      'description',
      'fills',
      'key',
      'type',
      'remote',
      'paints',
      'fontName',
      'fontSize',
      'font',
    ]);

    figma.ui.postMessage({
      type: 'fetched layer',
      message: layerData,
    });
  }

  // Could this be made less expensive?
  if (msg.type === MessageType.UPDATE_ERRORS) {
    const settings = await figma.clientStorage.getAsync(StorageKeys.SETTINGS);

    const errors = lint(
      originalNodeTree,
      false,
      settings && JSON.parse(settings)
    );

    figma.ui.postMessage({
      type: 'updated errors',
      errors,
    });
  }

  // Updates client storage with a new ignored error
  // when the user selects "ignore" from the context menu
  if (msg.type === MessageType.UPDATE_STORAGE) {
    let arrayToBeStored = JSON.stringify(msg.storageArray);
    figma.clientStorage.setAsync('storedErrorsToIgnore', arrayToBeStored);
  }

  // Clears all ignored errors
  // invoked from the settings menu
  if (msg.type === MessageType.UPDATE_STORAGE_FROM_SETTINGS) {
    let arrayToBeStored = JSON.stringify(msg.storageArray);
    figma.clientStorage.setAsync('storedErrorsToIgnore', arrayToBeStored);

    figma.ui.postMessage({
      type: 'reset storage',
      storage: arrayToBeStored,
    });

    figma.notify('Cleared ignored errors', { timeout: 1000 });
  }

  // Remembers the last tab selected in the UI and sets it
  // to be active (layers vs error by category view)
  if (msg.type === MessageType.UPDATE_ACTIVE_PAGE_IN_SETTINGS) {
    let pageToBeStored = JSON.stringify(msg.page);
    figma.clientStorage.setAsync('storedActivePage', pageToBeStored);
  }

  // Changes the linting rules, invoked from the settings menu
  if (msg.type === MessageType.UPDATE_LINT_RULES_FROM_SETTINGS) {
    lintVectors = msg.boolean;
  }

  if (msg.type === MessageType.UPDATE_SETTINGS) {
    const settings: LintSettings = msg.settings;

    if (settings.borderRadius) {
      // Most users won't add 0 to the array of border radius so let's add it in for them.
      if (settings.borderRadius.indexOf(0) === -1) {
        settings.borderRadius.unshift(0);
      }
    }

    // Save this value in client storage.
    let settingsJSON = JSON.stringify(settings);

    figma.clientStorage.setAsync(StorageKeys.SETTINGS, settingsJSON);

    figma.ui.postMessage({
      type: MessageType.SAVED_SETTINGS,
      storage: settingsJSON,
    });

    figma.notify('Settings updated', { timeout: 1000 });
  }

  if (msg.type == MessageType.FETCH_SETTINGS) {
    let settingsJSON = await figma.clientStorage.getAsync(StorageKeys.SETTINGS);

    if (settingsJSON) {
      console.log('Settings JSON: ', JSON.parse(settingsJSON));
    }

    // if no settings found save default setting to the storage
    if (!settingsJSON) {
      settingsJSON = JSON.stringify(defaultSettings);

      await figma.clientStorage.setAsync(StorageKeys.SETTINGS, settingsJSON);
    }

    figma.ui.postMessage({
      type: MessageType.SAVED_SETTINGS,
      storage: settingsJSON,
    });
  }

  if (msg.type === MessageType.RESET_SETTINGS) {
    let settingsJSON = JSON.stringify(defaultSettings);

    figma.clientStorage.setAsync(StorageKeys.SETTINGS, settingsJSON);

    figma.ui.postMessage({
      type: MessageType.SAVED_SETTINGS,
      storage: settingsJSON,
    });

    figma.notify('Reset settings', { timeout: 1000 });
  }

  if (msg.type === MessageType.RESET_BORDER_RADIUS) {
    borderRadiusArray = [0, 2, 4, 8, 16, 24, 32];
    figma.clientStorage.setAsync('storedRadiusValues', []);

    figma.ui.postMessage({
      type: 'fetched border radius',
      storage: JSON.stringify(borderRadiusArray),
    });

    figma.notify('Reset border radius value', { timeout: 1000 });
  }

  if (msg.type === MessageType.SELECT_MULTIPLE_LAYERS) {
    const layerArray = msg.nodeArray;
    let nodesToBeSelected: Array<SceneNode> = [];

    layerArray.forEach((item) => {
      let layer = figma.getNodeById(item);
      if (layer && isSceneNode(layer)) {
        // Using selection and viewport requires an array.
        nodesToBeSelected.push(layer);
      }
    });

    // Moves the layer into focus and selects so the user can update it.
    figma.currentPage.selection = nodesToBeSelected;
    figma.viewport.scrollAndZoomIntoView(nodesToBeSelected);
    figma.notify('Multiple layers selected', { timeout: 1000 });
  }

  if (msg.type === MessageType.LINT_ALL) {
    const settings = await figma.clientStorage.getAsync(StorageKeys.SETTINGS);

    // Pass the array back to the UI to be displayed.
    figma.ui.postMessage({
      type: 'complete',
      errors: lint(originalNodeTree, false, settings && JSON.parse(settings)),
      message: serializeNodes(msg.nodes),
    });

    figma.notify(`Design lint is running and will auto refresh for changes`, {
      timeout: 2000,
    });
  }

  // Initialize the app
  if (msg.type === MessageType.RUN_APP) {
    if (figma.currentPage.selection.length === 0) {
      figma.notify('Select a frame(s) to get started', { timeout: 2000 });
      return;
    } else {
      let nodes = figma.currentPage.selection;
      let firstNode: Array<SceneNode> = [];

      const settings = await figma.clientStorage.getAsync(StorageKeys.SETTINGS);

      firstNode.push(figma.currentPage.selection[0]);

      // Maintain the original tree structure so we can enable
      // refreshing the tree and live updating errors.
      originalNodeTree = [...nodes];

      // We want to immediately render the first selection
      // to avoid freezing up the UI.
      figma.ui.postMessage({
        type: 'first node',
        message: serializeNodes(nodes),
        errors: lint(firstNode, false, settings && JSON.parse(settings)),
      });

      figma.clientStorage.getAsync('storedErrorsToIgnore').then((result) => {
        figma.ui.postMessage({
          type: 'fetched storage',
          storage: result,
        });
      });

      figma.clientStorage.getAsync('storedActivePage').then((result) => {
        figma.ui.postMessage({
          type: 'fetched active page',
          storage: result,
        });
      });
    }
  }

  if (msg.type === MessageType.AUTOFIX) {
    const errorsToFix: Array<LintError> = msg.errors;

    if (errorsToFix && errorsToFix.length > 0) {
      // Fix all errors
      await Promise.all(
        errorsToFix.map(async (errorToFix) => {
          await suggestionFix(errorToFix);
        })
      );

      const settings = await figma.clientStorage.getAsync(StorageKeys.SETTINGS);

      // Pass the array back to the UI to be displayed.
      const newErrors = lint(
        originalNodeTree,
        false,
        settings && JSON.parse(settings)
      );

      figma.ui.postMessage({
        type: 'updated errors',
        errors: newErrors,
      });

      figma.notify(`Auto-fixed ${errorsToFix.length} errors`, {
        timeout: 1000,
      });
    }
  }
};
