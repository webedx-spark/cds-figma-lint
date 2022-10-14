import * as React from 'react';
import SettingsPanel from './SettingsPanel';
import type { SettingsPanelProps } from './SettingsPanel';

import { ReactComponent as RefreshIcon } from '../assets/refresh.svg';

type NavigationProps = {
  activePage: string;
  onPageSelection: (page: string) => void;
  onRefreshSelection: () => void;
} & Pick<
  SettingsPanelProps,
  'lintVectors' | 'ignoredErrorArray' | 'updateLintRules'
>;

function Navigation(props: NavigationProps) {
  const {
    onPageSelection,
    onRefreshSelection,
    activePage,
    lintVectors,
    ignoredErrorArray,
    updateLintRules,
  } = props;
  const [panelVisible, setPanelVisible] = React.useState(false);

  const layersClick = () => {
    onPageSelection('layers');
  };

  const bulkListClick = () => {
    onPageSelection('bulk');
  };

  const handlePanelVisible = (boolean) => {
    setPanelVisible(boolean);
  };

  const handleRefreshSelection = () => {
    onRefreshSelection();
  };

  return (
    <div key="nav">
      <div className="navigation-wrapper">
        <nav className="nav">
          <div
            className={`nav-item ${activePage === 'layers' ? 'active' : ''}`}
            onClick={layersClick}
          >
            Layers
          </div>
          <div
            className={`nav-item ${activePage === 'bulk' ? 'active' : ''}`}
            onClick={bulkListClick}
          >
            Errors by Category
          </div>
          <div className="nav-icon-wrapper">
            <button
              className="icon icon--refresh icon--button settings-button"
              onClick={(event) => {
                event.stopPropagation();
                handleRefreshSelection();
              }}
            >
              <RefreshIcon />
            </button>
            <button
              className="icon icon--adjust icon--button settings-button"
              onClick={(event) => {
                event.stopPropagation();
                handlePanelVisible(true);
              }}
            ></button>
          </div>
        </nav>
      </div>
      <SettingsPanel
        panelVisible={panelVisible}
        onHandlePanelVisible={handlePanelVisible}
        ignoredErrorArray={ignoredErrorArray}
        updateLintRules={updateLintRules}
        lintVectors={lintVectors}
      />
    </div>
  );
}

export default Navigation;
