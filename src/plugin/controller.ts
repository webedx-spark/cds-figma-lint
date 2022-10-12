import { MessageType } from '../types';
import { lint } from './lint';

function isSceneNode(node: BaseNode): node is SceneNode {
  return node.type !== 'PAGE' && node.type !== 'DOCUMENT';
}

figma.showUI(__html__, { width: 360, height: 580 });

let borderRadiusArray = [0, 2, 4, 8, 16, 24, 32];
let originalNodeTree: Array<SceneNode> = [];
let lintVectors = false;

figma.skipInvisibleInstanceChildren = true;

figma.ui.onmessage = (msg) => {
  if (msg.type === 'close') {
    figma.closePlugin();
  }

  // Fetch a specific node by ID.
  if (msg.type === 'fetch-layer-data') {
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
  if (msg.type === 'update-errors') {
    figma.ui.postMessage({
      type: 'updated errors',
      errors: lint(originalNodeTree, false, { lintVectors, borderRadiusArray }),
    });
  }

  // Updates client storage with a new ignored error
  // when the user selects "ignore" from the context menu
  if (msg.type === 'update-storage') {
    let arrayToBeStored = JSON.stringify(msg.storageArray);
    figma.clientStorage.setAsync('storedErrorsToIgnore', arrayToBeStored);
  }

  // Clears all ignored errors
  // invoked from the settings menu
  if (msg.type === 'update-storage-from-settings') {
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
  if (msg.type === 'update-active-page-in-settings') {
    let pageToBeStored = JSON.stringify(msg.page);
    figma.clientStorage.setAsync('storedActivePage', pageToBeStored);
  }

  // Changes the linting rules, invoked from the settings menu
  if (msg.type === 'update-lint-rules-from-settings') {
    lintVectors = msg.boolean;
  }

  // For when the user updates the border radius values to lint from the settings menu.
  if (msg.type === 'update-border-radius') {
    let newString = msg.radiusValues.replace(/\s+/g, '');
    let newRadiusArray = newString.split(',');
    newRadiusArray = newRadiusArray
      .filter((x) => x.trim().length && !isNaN(x))
      .map(Number);

    // Most users won't add 0 to the array of border radius so let's add it in for them.
    if (newRadiusArray.indexOf(0) === -1) {
      newRadiusArray.unshift(0);
    }

    // Update the array we pass into checkRadius for linting.
    borderRadiusArray = newRadiusArray;

    // Save this value in client storage.
    let radiusToBeStored = JSON.stringify(borderRadiusArray);
    figma.clientStorage.setAsync('storedRadiusValues', radiusToBeStored);

    figma.ui.postMessage({
      type: 'fetched border radius',
      storage: JSON.stringify(borderRadiusArray),
    });

    figma.notify('Saved new border radius values', { timeout: 1000 });
  }

  if (msg.type === 'reset-border-radius') {
    borderRadiusArray = [0, 2, 4, 8, 16, 24, 32];
    figma.clientStorage.setAsync('storedRadiusValues', []);

    figma.ui.postMessage({
      type: 'fetched border radius',
      storage: JSON.stringify(borderRadiusArray),
    });

    figma.notify('Reset border radius value', { timeout: 1000 });
  }

  if (msg.type === 'select-multiple-layers') {
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

  // Serialize nodes to pass back to the UI.
  function serializeNodes(nodes: Readonly<Array<SceneNode>>) {
    let serializedNodes = JSON.stringify(nodes, [
      'name',
      'type',
      'children',
      'id',
    ]);

    return serializedNodes;
  }

  if (msg.type === MessageType.LINT_ALL) {
    // Pass the array back to the UI to be displayed.
    figma.ui.postMessage({
      type: 'complete',
      errors: lint(originalNodeTree, false, { lintVectors, borderRadiusArray }),
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

      firstNode.push(figma.currentPage.selection[0]);

      // Maintain the original tree structure so we can enable
      // refreshing the tree and live updating errors.
      originalNodeTree = [...nodes];

      // We want to immediately render the first selection
      // to avoid freezing up the UI.
      figma.ui.postMessage({
        type: 'first node',
        message: serializeNodes(nodes),
        errors: lint(firstNode, false, { lintVectors, borderRadiusArray }),
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

      figma.clientStorage.getAsync('storedRadiusValues').then((result) => {
        if (result.length) {
          borderRadiusArray = JSON.parse(result);

          figma.ui.postMessage({
            type: 'fetched border radius',
            storage: result,
          });
        }
      });
    }
  }
};
