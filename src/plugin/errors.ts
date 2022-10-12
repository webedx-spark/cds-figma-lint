export type LintError = {
  message: string;
  node: DefaultShapeMixin;
  type: string;
  value?: any;
};

// Generic function for creating an error object to pass to the app.
export const createErrorObject = (
  node: DefaultShapeMixin,
  type: string,
  message: string,
  value?
) => {
  let error: LintError = {
    message,
    type,
    node,
  };

  if (value !== undefined) {
    error.value = value;
  }

  return error;
};
