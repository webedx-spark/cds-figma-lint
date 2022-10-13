import * as React from 'react';
import { motion } from 'framer-motion';
import PanelHeader from './PanelHeader';
import SettingsForm from './SettingsForm';
import type { SettingsFormProps } from './SettingsForm';
import '../styles/panel.css';
import { LintSettings, MessageType } from '../../types';

export type SettingsPanelProps = {
  panelVisible: boolean;
  lintVectors: boolean;
  onHandlePanelVisible: (arg: boolean) => void;
  updateLintRules: (arg: boolean) => void;
  ignoredErrorArray: Array<any>;
} & SettingsFormProps;

function SettingsPanel(props: SettingsPanelProps) {
  const {
    panelVisible,
    defaultSettings,
    lintVectors,
    onHandlePanelVisible,
    updateLintRules,
    ignoredErrorArray,
  } = props;

  const isVisible = panelVisible;

  const variants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: '100%' },
  };

  function handleHide() {
    onHandlePanelVisible(false);
  }

  function clearIgnoredErrors() {
    parent.postMessage(
      {
        pluginMessage: {
          type: MessageType.UPDATE_STORAGE_FROM_SETTINGS,
          storageArray: [],
        },
      },
      '*'
    );
    onHandlePanelVisible(false);
  }

  return (
    <React.Fragment>
      <motion.div
        className={`panel`}
        initial={{ opacity: 0, x: '100%' }}
        animate={isVisible ? 'open' : 'closed'}
        transition={{ duration: 0.3, type: 'tween' }}
        variants={variants}
        key="settings-panel"
      >
        <PanelHeader title={'Settings'} handleHide={handleHide}></PanelHeader>

        <div className="settings-wrapper">
          <div className="settings-row">
            <h3 className="settings-title">Skipping Layers</h3>
            <div className="settings-label">
              If you have an illustration or set of layers you want the linter
              to ignore, lock them in the Figma layer list.
            </div>
          </div>
          <SettingsForm defaultSettings={defaultSettings} />
          {/* <div className="settings-row">
            <h3 className="settings-title">Lint Vectors (Default Off)</h3>
            <div className="settings-label">
              Illustrations, vectors, and boolean shapes often throw a lot of
              errors as they rarely use styles for fills. If you'd like to lint
              them as well, check the box below.
              <div className="settings-checkbox-group" onClick={handleCheckbox}>
                <input
                  name="vectorsCheckbox"
                  type="checkbox"
                  checked={lintVectors}
                  onChange={handleCheckbox}
                />
                <label>Lint Vectors and Boolean Shapes</label>
              </div>
            </div>
          </div> */}
          <div className="settings-row">
            <h3 className="settings-title">Ignored errors</h3>
            {ignoredErrorArray.length > 0 ? (
              <React.Fragment>
                <div className="settings-label">
                  {ignoredErrorArray.length} errors are being ignored in
                  selection.
                </div>
                <button
                  className="button button--primary"
                  onClick={clearIgnoredErrors}
                >
                  Reset ignored errors
                </button>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className="settings-label">
                  You haven't ignored any errors yet.
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </motion.div>

      {isVisible ? <div className="overlay" onClick={handleHide}></div> : null}
    </React.Fragment>
  );
}

export default React.memo(SettingsPanel);
