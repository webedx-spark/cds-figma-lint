import { ChangeEvent, useEffect, useState } from 'react';
import { defaultSettings } from '../../constants';
import {
  arrayToCommaSeparatedStr,
  parseCommaSeparatedNumbers,
} from '../../plugin/utils';
import { LintSettings, MessageType } from '../../types';

const serializers: Partial<Record<keyof LintSettings, Function>> = {
  borderRadius: parseCommaSeparatedNumbers,
};

const deserializeValues = (settings: LintSettings) => {
  return {
    lintFillStyles: settings.lintFillStyles,
    lintStrokeStyles: settings.lintStrokeStyles,
    lintEffectStyles: settings.lintEffectStyles,
    lintTypoStyles: settings.lintTypoStyles,
    borderRadius: settings.borderRadius
      ? arrayToCommaSeparatedStr(settings.borderRadius)
      : '',
  };
};

function SettingsForm() {
  const [values, setValues] = useState(() =>
    deserializeValues(defaultSettings)
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    setValues({ ...values, [name]: value });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newSettings: LintSettings = {};

    for (const [key, value] of Object.entries(values)) {
      const serializer = serializers[key];
      newSettings[key] = serializer ? serializer(value) : value;
    }

    parent.postMessage(
      {
        pluginMessage: {
          type: MessageType.UPDATE_SETTINGS,
          settings: newSettings,
        },
      },
      '*'
    );
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();

    parent.postMessage(
      {
        pluginMessage: {
          type: MessageType.RESET_SETTINGS,
        },
      },
      '*'
    );
  };

  const handleWindowMessage = (event) => {
    const { type, message, errors, storage } = event.data.pluginMessage;

    if (type === MessageType.SAVED_SETTINGS) {
      if (storage) {
        let clientStorage = JSON.parse(storage);
        // update only if not empty
        if (clientStorage && Object.keys(clientStorage).length !== 0) {
          setValues(deserializeValues(clientStorage));
        }
      }
    }
  };

  useEffect(function syncValues() {
    window.addEventListener('message', handleWindowMessage);

    parent.postMessage(
      {
        pluginMessage: {
          type: MessageType.FETCH_SETTINGS,
        },
      },
      '*'
    );

    return () => {
      window.removeEventListener('message', handleWindowMessage);
    };
  }, []);

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <div className="settings-row">
        <h3 className="settings-title">Border radius</h3>
        <div className="settings-label">
          Set your preferred border radius values separated by commas (ex: "2,
          4, 6, 8").
        </div>

        <div className="input-icon">
          <div className="input-icon__icon">
            <div className="icon icon--corner-radius icon--black-3"></div>
          </div>
          <input
            type="input"
            name="borderRadius"
            className="input-icon__input"
            onChange={handleInputChange}
            value={values.borderRadius}
          />
        </div>
      </div>
      <div className="settings-row">
        <div className="settings-title">CDS Lint Settings</div>
        <div className="settings-checkbox-group">
          <div className="switch">
            <input
              className="switch__toggle"
              onChange={handleInputChange}
              checked={values.lintFillStyles}
              type="checkbox"
              name="lintFillStyles"
              id="lintFillStyles"
            />
            <label className="switch__label" htmlFor="lintFillStyles">
              Lint CDS Fill styles {}
            </label>
          </div>
        </div>
        <div className="settings-checkbox-group">
          <div className="switch">
            <input
              onChange={handleInputChange}
              checked={values.lintStrokeStyles}
              className="switch__toggle"
              type="checkbox"
              name="lintStrokeStyles"
              id="lintStrokeStyles"
            />
            <label className="switch__label" htmlFor="lintStrokeStyles">
              Lint CDS Stroke styles
            </label>
          </div>
        </div>
        <div className="settings-checkbox-group">
          <div className="switch">
            <input
              onChange={handleInputChange}
              checked={values.lintEffectStyles}
              className="switch__toggle"
              type="checkbox"
              name="lintEffectStyles"
              id="lintEffectStyles"
            />
            <label className="switch__label" htmlFor="lintEffectStyles">
              Lint CDS Effect styles
            </label>
          </div>
        </div>
        <div className="settings-checkbox-group">
          <div className="switch">
            <input
              onChange={handleInputChange}
              checked={values.lintTypoStyles}
              className="switch__toggle"
              type="checkbox"
              name="lintTypoStyles"
              id="lintTypoStyles"
            />
            <label className="switch__label" htmlFor="lintTypoStyles">
              Lint CDS Typography styles
            </label>
          </div>
        </div>
        <div className="form-button-group">
          <button className="button button--primary" type="submit">
            Save
          </button>
          <button className="button button--secondary" onClick={handleClear}>
            Reset
          </button>
        </div>
      </div>
    </form>
  );
}

export default SettingsForm;
