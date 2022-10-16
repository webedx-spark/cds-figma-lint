import type { LintNodes } from '../types';
import type { Suggestion } from './suggestion';

type SerializedNode = {
  id: LintNodes['id'];
  type: LintNodes['type'];
};

export type LintError = {
  message: string;
  node: SerializedNode;
  /**
   * There is some misalignment between Figma WEB API and Figma Plugin types.
   * StyleType "PAINT" doesn't exist instead use "FILL"
   */
  type: StyleType | 'FILL' | 'STROKE' | 'RADIUS';
  value?: any;
  suggestion?: Suggestion;
};

// Generic function for creating an error object to pass to the app.
export const createErrorObject = (
  node: LintNodes,
  type: LintError['type'],
  message: string,
  value?
) => {
  let error: LintError = {
    message,
    type,
    node: {
      id: node.id,
      type: node.type,
    },
  };

  if (value !== undefined) {
    error.value = value;
  }

  return error;
};
