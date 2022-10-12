import { useState } from 'react';
import { MessageType } from '../../types';

function SettingsForm(props) {
  const [radiusValue, setRadiusValue] = useState('');
  const [cdsLintStyles, setCdsLintStyles] = useState(true);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (radiusValue.length) {
      parent.postMessage(
        {
          pluginMessage: {
            type: MessageType.UPDATE_BORDER_RADIUS,
            radiusValues: radiusValue,
          },
        },
        '*'
      );
    }
  };

  function handleClear() {
    parent.postMessage(
      {
        pluginMessage: {
          type: MessageType.RESET_BORDER_RADIUS,
        },
      },
      '*'
    );
  }

  return (
    <div className="settings-row">
      <div className="settings-form" onSubmit={handleSubmit}>
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
            className="input-icon__input"
            value={radiusValue}
            onChange={(e) => setRadiusValue(e.target.value)}
            placeholder={props.borderRadiusValues}
          />
        </div>

        <div className="settings-checkbox-group">
          <input
            name="vectorsCheckbox"
            type="checkbox"
            onChange={(e) => setCdsLintStyles(e.target.checked)}
            checked={cdsLintStyles}
          />
          <label>Lint CDS Styles</label>
        </div>
      </div>
      <div className="form-button-group">
        <button className="button button--primary" onClick={handleSubmit}>
          Save
        </button>
        <button className="button button--secondary" onClick={handleClear}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default SettingsForm;
