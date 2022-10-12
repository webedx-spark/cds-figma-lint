export const MessageType = {
  FETCH_LAYER_DATA: 'fetch-layer-data',
  UPDATE_ERRORS: 'update-errors',
  UPDATE_STORAGE: 'update-storage',
  UPDATE_STORAGE_FROM_SETTINGS: 'update-storage-from-settings',
  UPDATE_ACTIVE_PAGE_IN_SETTINGS: 'update-active-page-in-settings',
  UPDATE_LINT_RULES_FROM_SETTINGS: 'update-lint-rules-from-settings',
  UPDATE_BORDER_RADIUS: 'update-border-radius',
  RESET_BORDER_RADIUS: 'reset-border-radius',
  SELECT_MULTIPLE_LAYERS: 'select-multiple-layers',
  LINT_ALL: 'lint-all',
  RUN_APP: 'run-app',
} as const;
