import * as React from 'react';
import SettingsPanel from './SettingsPanel';
import type { SettingsPanelProps } from './SettingsPanel';

import { ReactComponent as RefreshIcon } from '../assets/refresh.svg';
import classNames from 'classnames';

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

  const errorsClick = () => {
    onPageSelection('errors');
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
            className={classNames('nav-item', {
              active: activePage === 'errors',
            })}
            onClick={errorsClick}
          >
            Errors
          </div>
          <div
            className={classNames('nav-item', {
              active: activePage === 'help',
            })}
            onClick={() => onPageSelection('help')}
          >
            Help
          </div>
          <div className="nav-icon-wrapper">
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
