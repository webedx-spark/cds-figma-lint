import { LintError } from './errors';
import styles from './styles.json';
import {
  checkRadius,
  checkEffects,
  checkFills,
  checkStrokes,
  checkType,
  checkCdsStyles,
  // customCheckTextFills,
  // uncomment this as an example of a custom lint function ^
} from './lintingFunctions';

type NodeErrors = {
  id: string;
  errors?: Array<LintError>;
  children?: Array<string>;
};

type LintOptions = {
  lintVectors?: boolean;
  borderRadiusArray?: Array<number>;
  lintCdsFillStyles?: boolean;
  lintCdsStrokeStyles?: boolean;
  lintCdsEffectStyles?: boolean;
  lintCdsTypoStyles?: boolean;
  lintCdsBorderRadius?: boolean;
};

const defaultOptions: LintOptions = {
  lintVectors: false,
  borderRadiusArray: [0, 2, 4, 8, 16, 24, 32],
  lintCdsFillStyles: true,
  lintCdsStrokeStyles: true,
  lintCdsBorderRadius: true,
  lintCdsEffectStyles: true,
  lintCdsTypoStyles: true,
};

const normalizedStyles = styles.styles.reduce((stylesMap, style) => {
  if (stylesMap[style.style_type]) {
    stylesMap[style.style_type][style.key] = style;
  } else {
    stylesMap[style.style_type] = {};
    stylesMap[style.style_type][style.key] = style;
  }

  return stylesMap;
}, {} as Record<StyleType, Record<string, BaseStyle>>);

export function lint(
  nodes: Readonly<Array<SceneNode>>,
  lockedParentNode?,
  options = defaultOptions
) {
  let errorArray: Array<NodeErrors> = [];
  let childArray: Array<string> = [];

  const lintOptions = Object.assign(defaultOptions, options);

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
        errorArray.push(newObject);
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
          errorArray.push(...lint(node['children'], true, lintOptions));
        } else {
          errorArray.push(...lint(node['children'], false, lintOptions));
        }
      }
    }

    errorArray.push(newObject);
  });

  return errorArray;
}

function determineType(node: SceneNode, options: LintOptions) {
  switch (node.type) {
    case 'SLICE':
    case 'GROUP': {
      // Groups styles apply to their children so we can skip this node type.
      let errors = [];
      return errors;
    }
    case 'BOOLEAN_OPERATION':
    case 'VECTOR': {
      return lintVectorRules(node, options);
    }
    case 'POLYGON':
    case 'STAR':
    case 'ELLIPSE': {
      return lintShapeRules(node);
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
      return lintTextRules(node);
    }
    case 'LINE': {
      return lintLineRules(node);
    }
    default: {
      // Do nothing
    }
  }
}

function lintComponentRules(node: ComponentNode, options: LintOptions) {
  let errors = [];

  // Example of how we can make a custom rule specifically for components
  // if (node.remote === false) {
  //   errors.push(
  //     createErrorObject(node, "component", "Component isn't from library")
  //   );
  // }

  checkFills(node, errors);
  checkRadius(node, errors, options.borderRadiusArray);
  checkEffects(node, errors);
  checkStrokes(node, errors);

  return errors;
}

function lintVariantWrapperRules(node: ComponentSetNode) {
  let errors = [];

  // checkFills(node, errors);
  console.log(`Skip linting: ${node.toString()}`);

  return errors;
}

function lintLineRules(node: LineNode) {
  let errors = [];

  checkStrokes(node, errors);
  checkEffects(node, errors);

  return errors;
}

function lintFrameRules(node: FrameNode, options: LintOptions) {
  let errors = [];

  checkFills(node, errors);
  checkStrokes(node, errors);
  checkRadius(node, errors, options.borderRadiusArray);
  checkEffects(node, errors);

  return errors;
}

function lintTextRules(node: TextNode) {
  let errors = [];

  checkType(node, errors);
  checkFills(node, errors);

  // We could also comment out checkFills and use a custom function instead
  // Take a look at line 122 in lintingFunction.ts for an example.
  // customCheckTextFills(node, errors);
  checkEffects(node, errors);
  checkStrokes(node, errors);

  return errors;
}

function lintRectangleRules(
  node: RectangleNode | InstanceNode,
  options: LintOptions
) {
  let errors = [];

  checkCdsStyles(normalizedStyles)(node, errors);
  checkFills(node, errors);
  checkRadius(node, errors, options.borderRadiusArray);
  checkStrokes(node, errors);
  checkEffects(node, errors);

  return errors;
}

function lintVectorRules(node: DefaultShapeMixin, options: LintOptions) {
  let errors = [];

  // This can be enabled by the user in settings.
  if (options.lintVectors === true) {
    checkFills(node, errors);
    checkStrokes(node, errors);
    checkEffects(node, errors);
  }

  return errors;
}

function lintShapeRules(node: DefaultShapeMixin) {
  let errors = [];

  checkFills(node, errors);
  checkStrokes(node, errors);
  checkEffects(node, errors);

  return errors;
}
