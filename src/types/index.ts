export const MessageType = {
  FETCH_LAYER_DATA: 'fetch-layer-data',
  UPDATE_ERRORS: 'update-errors',
  UPDATE_STORAGE: 'update-storage',
  UPDATE_STORAGE_FROM_SETTINGS: 'update-storage-from-settings',
  UPDATE_ACTIVE_PAGE_IN_SETTINGS: 'update-active-page-in-settings',
  UPDATE_LINT_RULES_FROM_SETTINGS: 'update-lint-rules-from-settings',
  UPDATE_BORDER_RADIUS: 'update-border-radius',
  RESET_BORDER_RADIUS: 'reset-border-radius',
  UPDATE_SETTINGS: 'update-settings',
  SAVED_SETTINGS: 'saved-settings',
  RESET_SETTINGS: 'reset-settings',
  FETCH_SETTINGS: 'fetch-settings',
  SELECT_MULTIPLE_LAYERS: 'select-multiple-layers',
  LINT_ALL: 'lint-all',
  RUN_APP: 'run-app',
} as const;

export const StorageKeys = {
  SETTINGS: 'cds-style-lint-settings',
} as const;

export type LintSettings = {
  lintFillStyles?: boolean;
  lintStrokeStyles?: boolean;
  lintEffectStyles?: boolean;
  lintTypoStyles?: boolean;

  borderRadius?: Array<number>;
};
