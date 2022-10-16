import type { LintError } from './errors';
import * as suggestions from './suggestions';

/**
 * Suggest a style based on error
 * @param error
 */

export type Suggestion = {
  message: string;
  styleKey: string;
  reason?: string;
};

type SuggestionKey = `${LintError['node']['type']}${LintError['type']}`;

const SuggestionsMap: Partial<
  Record<
    SuggestionKey,
    {
      suggestion: (error: LintError) => Suggestion | undefined;
      fix: (error: LintError) => Promise<void>;
    }
  >
> = {
  RECTANGLEFILL: {
    suggestion: suggestions.rectangleFill,
    fix: suggestions.rectangleFillFix,
  },
  TEXTTEXT: {
    suggestion: suggestions.text,
    fix: suggestions.textFix,
  },
  TEXTFILL: {
    suggestion: suggestions.textFill,
    fix: suggestions.textFillFix,
  },
  TEXTPAINT: {
    suggestion: suggestions.textFill,
    fix: suggestions.textFillFix,
  },
};

export const suggestionForError = (
  error: LintError
): Suggestion | undefined => {
  const suggestionFunc = SuggestionsMap[`${error.node.type}${error.type}`];

  return suggestionFunc?.suggestion(error);
};

export const suggestionFix = async (error: LintError) => {
  const suggestionFunc = SuggestionsMap[`${error.node.type}${error.type}`];

  return suggestionFunc?.fix(error);
};
