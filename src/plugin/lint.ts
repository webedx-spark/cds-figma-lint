import { LintError } from './errors';
import styles from './styles.json';
import {
  checkRadius,
  checkEffects,
  checkFills,
  checkStrokes,
  checkType,
  checkLibraryEffectsStyles,
  checkLibraryFillStyles,
  checkLibraryStrokeStyles,
  checkLibraryTypeStyles,
  // customCheckTextFills,
  // uncomment this as an example of a custom lint function ^
} from './lintingFunctions';
import type { LintStyleType } from './lintingFunctions';
import { LintSettings, StorageKeys } from '../types';
import { defaultSettings } from '../constants';

export type NodeErrors = {
  id: string;
  errors?: Array<LintError>;
  children?: Array<string>;
};

export const normalizedStyles = styles.styles.reduce((stylesMap, style) => {
  if (stylesMap[style.style_type]) {
    stylesMap[style.style_type][style.key] = style;
  } else {
    stylesMap[style.style_type] = {};
    stylesMap[style.style_type][style.key] = style;
  }

  return stylesMap;
}, {} as Record<LintStyleType, Record<string, BaseStyle>>);

export function lintDeprecated(
  nodes: Readonly<Array<SceneNode>>,
  lockedParentNode?,
  options = defaultSettings
) {
  let nodeErrorArray: Array<NodeErrors> = [];
  let childArray: Array<string> = [];

  const lintOptions = Object.assign(defaultSettings, options);

  nodes.forEach((node) => {
    let isLayerLocked;

    // Create a new object.
    let newObject: NodeErrors = {
      id: node.id,
    };

    // Don't lint locked layers or the children/grandchildren of locked layers.
    if (lockedParentNode === undefined && node.locked === true) {
      isLayerLocked = true;
    } else if (lockedParentNode === undefined && node.locked === false) {
      isLayerLocked = false;
    } else if (lockedParentNode === false && node.locked === true) {
      isLayerLocked = true;
    } else {
      isLayerLocked = lockedParentNode;
    }

    if (isLayerLocked === true) {
      newObject['errors'] = [];
    } else {
      newObject['errors'] = determineType(node, lintOptions);
    }

    if ('children' in node) {
      let children = node.children;

      if (!children) {
        nodeErrorArray.push(newObject);
        return;
      } else if (children) {
        // Recursively run this function to flatten out children and grandchildren nodes
        node.children.forEach((childNode) => {
          childArray.push(childNode.id);
        });

        newObject.children = childArray;

        // If the layer is locked, pass the optional parameter to the recursive Lint
        // function to indicate this layer is locked.
        if (isLayerLocked === true) {
          nodeErrorArray.push(
            ...lintDeprecated(node['children'], true, lintOptions)
          );
        } else {
          nodeErrorArray.push(
            ...lintDeprecated(node['children'], false, lintOptions)
          );
        }
      }
    }

    nodeErrorArray.push(newObject);
  });

  return nodeErrorArray;
}

/**
 *
 * TODO: it has to return a simplified data structure
 * Array of errors
 *
 * @param nodes
 * @param lockedParentNode
 * @param options
 * @returns
 */
export function lint(
  nodes: Readonly<Array<SceneNode>>,
  lockedParentNode?,
  options = defaultSettings
): Array<LintError> {
  let nodeErrors: Array<LintError> = [];

  const lintOptions = Object.assign(defaultSettings, options);

  nodes.forEach((node) => {
    let isLayerLocked;

    // Don't lint locked layers or the children/grandchildren of locked layers.
    if (lockedParentNode === undefined && node.locked === true) {
      isLayerLocked = true;
    } else if (lockedParentNode === undefined && node.locked === false) {
      isLayerLocked = false;
    } else if (lockedParentNode === false && node.locked === true) {
      isLayerLocked = true;
    } else {
      isLayerLocked = lockedParentNode;
    }

    if (!isLayerLocked) {
      const errors = determineType(node, lintOptions);
      nodeErrors = nodeErrors.concat(errors);
    }

    if ('children' in node) {
      const { children } = node;

      if (children) {
        nodeErrors = nodeErrors.concat(
          lint(children, isLayerLocked, lintOptions)
        );
      }
    }
  });

  return nodeErrors;
}

function determineType(
  node: SceneNode,
  options: LintSettings
): Array<LintError> {
  switch (node.type) {
    case 'SLICE':
    case 'GROUP': {
      // Groups styles apply to their children so we can skip this node type.
      let errors: Array<LintError> = [];
      return errors;
    }
    // case 'BOOLEAN_OPERATION':
    // case 'VECTOR': {
    //   return lintVectorRules(node, options);
    // }
    case 'POLYGON':
    case 'STAR':
    case 'ELLIPSE': {
      return lintShapeRules(node, options);
    }
    case 'FRAME': {
      return lintFrameRules(node, options);
    }
    case 'INSTANCE':
    case 'RECTANGLE': {
      return lintRectangleRules(node, options);
    }
    case 'COMPONENT': {
      return lintComponentRules(node, options);
    }
    case 'COMPONENT_SET': {
      // Component Set is the frame that wraps a set of variants
      // the variants within the set are still linted as components (lintComponentRules)
      // this type is generally only present where the variant is defined so it
      // doesn't need as many linting requirements.
      return lintVariantWrapperRules(node);
    }
    case 'TEXT': {
      return lintTextRules(node, options);
    }
    case 'LINE': {
      return lintLineRules(node, options);
    }
    default: {
      // Do nothing
      return [];
    }
  }
}

function lintComponentRules(node: ComponentNode, options: LintSettings) {
  let errors: Array<LintError> = [];

  if (options.lintFillStyles) {
    checkLibraryFillStyles(normalizedStyles, node, errors);
  } else {
    checkFills(node, errors);
  }

  if (options.lintEffectStyles) {
    checkLibraryEffectsStyles(normalizedStyles, node, errors);
  } else {
    checkEffects(node, errors);
  }

  if (options.lintStrokeStyles) {
    checkLibraryStrokeStyles(normalizedStyles, node, errors);
  } else {
    checkStrokes(node, errors);
  }

  checkRadius(node, errors, options.borderRadius);

  return errors;
}

function lintVariantWrapperRules(node: ComponentSetNode) {
  let errors: Array<LintError> = [];

  // checkFills(node, errors);
  console.log(`Skip linting: ${node.toString()}`);

  return errors;
}

function lintLineRules(node: LineNode, options: LintSettings) {
  let errors: Array<LintError> = [];

  if (options.lintEffectStyles) {
    checkLibraryEffectsStyles(normalizedStyles, node, errors);
  } else {
    checkEffects(node, errors);
  }

  if (options.lintStrokeStyles) {
    checkLibraryStrokeStyles(normalizedStyles, node, errors);
  } else {
    checkStrokes(node, errors);
  }

  return errors;
}

function lintFrameRules(node: FrameNode, options: LintSettings) {
  let errors: Array<LintError> = [];

  checkFills(node, errors);
  checkStrokes(node, errors);
  checkRadius(node, errors, options.borderRadius);
  checkEffects(node, errors);

  return errors;
}

function lintTextRules(node: TextNode, options: LintSettings) {
  let errors: Array<LintError> = [];

  if (options.lintFillStyles) {
    checkLibraryFillStyles(normalizedStyles, node, errors);
  } else {
    checkFills(node, errors);
  }

  if (options.lintEffectStyles) {
    checkLibraryEffectsStyles(normalizedStyles, node, errors);
  } else {
    checkEffects(node, errors);
  }

  if (options.lintStrokeStyles) {
    checkLibraryStrokeStyles(normalizedStyles, node, errors);
  } else {
    checkStrokes(node, errors);
  }

  if (options.lintTypoStyles) {
    checkLibraryTypeStyles(normalizedStyles, node, errors);
  } else {
    checkType(node, errors);
  }

  return errors;
}

function lintRectangleRules(
  node: RectangleNode | InstanceNode,
  options: LintSettings
) {
  let errors: Array<LintError> = [];

  if (options.lintFillStyles) {
    checkLibraryFillStyles(normalizedStyles, node, errors);
  } else {
    checkFills(node, errors);
  }

  if (options.lintEffectStyles) {
    checkLibraryEffectsStyles(normalizedStyles, node, errors);
  } else {
    checkEffects(node, errors);
  }

  if (options.lintStrokeStyles) {
    checkLibraryStrokeStyles(normalizedStyles, node, errors);
  } else {
    checkStrokes(node, errors);
  }

  checkRadius(node, errors, options.borderRadius);

  return errors;
}

// function lintVectorRules(node: DefaultShapeMixin, options: LintOptions) {
//   let errors = [];

//   // This can be enabled by the user in settings.
//   if (options.lintVectors === true) {
//     checkFills(node, errors);
//     checkStrokes(node, errors);
//     checkEffects(node, errors);
//   }

//   return errors;
// }

function lintShapeRules(
  node: PolygonNode | StarNode | EllipseNode,
  options: LintSettings
) {
  let errors: Array<LintError> = [];

  if (options.lintFillStyles) {
    checkLibraryFillStyles(normalizedStyles, node, errors);
  } else {
    checkFills(node, errors);
  }

  if (options.lintEffectStyles) {
    checkLibraryEffectsStyles(normalizedStyles, node, errors);
  } else {
    checkEffects(node, errors);
  }

  if (options.lintStrokeStyles) {
    checkLibraryStrokeStyles(normalizedStyles, node, errors);
  } else {
    checkStrokes(node, errors);
  }

  return errors;
}
