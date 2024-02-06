// Utility functions for color conversion.
export const convertColor = (color: RGB | RGBA) => {
  const colorObj = color;
  const figmaColor = {};

  Object.entries(colorObj).forEach((cf) => {
    const [key, value] = cf;

    if (['r', 'g', 'b'].includes(key)) {
      figmaColor[key] = (255 * (value as number)).toFixed(0);
    } else if (key === 'a') {
      figmaColor[key] = value;
    } else {
      throw new Error(`Can't convert color ${JSON.stringify(color)}`);
    }
  });
  return figmaColor as { r: string; g: string; b: string; a?: string };
};

export const RGBToHex = (r: string, g: string, b: string) => {
  r = Number(r).toString(16);
  g = Number(g).toString(16);
  b = Number(b).toString(16);

  if (r.length == 1) r = '0' + r;
  if (g.length == 1) g = '0' + g;
  if (b.length == 1) b = '0' + b;

  return `#${r}${g}${b}`.toUpperCase();
};

// Serialize nodes to pass back to the UI.
export const serializeNodes = (nodes: Readonly<Array<SceneNode>>) => {
  let serializedNodes = JSON.stringify(nodes, [
    'name',
    'type',
    'children',
    'id',
  ]);

  return serializedNodes;
};

export const parseCommaSeparatedNumbers = (str: string): Array<number> => {
  let newString = str.replace(/\s+/g, '');
  let newRadiusArray = newString.split(',');
  return newRadiusArray
    .filter((x) => x.trim().length && !isNaN(parseInt(x, 10)))
    .map(Number);
};

export const arrayToCommaSeparatedStr = (arr: Array<number>): string => {
  return arr.join(', ');
};

export function determineFill(fills) {
  let fillValues: Array<string> = [];

  fills.forEach((fill) => {
    if (fill.type === 'SOLID') {
      let rgbObj = convertColor(fill.color);

      fillValues.push(RGBToHex(rgbObj['r'], rgbObj['g'], rgbObj['b']));
    } else if (fill.type === 'IMAGE') {
      fillValues.push('Image - ' + fill.imageHash);
    } else {
      const gradientValues: Array<string> = [];
      fill.gradientStops.forEach((gradientStops) => {
        let gradientColorObject = convertColor(gradientStops.color);
        gradientValues.push(
          RGBToHex(
            gradientColorObject['r'],
            gradientColorObject['g'],
            gradientColorObject['b']
          )
        );
      });
      let gradientValueString = gradientValues.toString();
      fillValues.push(`${fill.type} ${gradientValueString}`);
    }
  });

  return fillValues[0];
}

export function isSceneNode(node: BaseNode): node is SceneNode {
  return node.type !== 'PAGE' && node.type !== 'DOCUMENT';
}

export function isAutoLayout(node: any): node is AutoLayoutMixin {
  return 'layoutMode' in node;
}
