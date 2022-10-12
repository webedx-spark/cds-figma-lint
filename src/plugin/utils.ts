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

  return '#' + r + g + b;
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
