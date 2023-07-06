import * as React from 'react';
import { useState } from 'react';

import Navigation from './Navigation';
import Preloader from './Preloader';
import EmptyState from './EmptyState';
import ErrorList from './ErrorList';

import '../styles/figma.ds.css';
import '../styles/ui.css';
import '../styles/empty-state.css';
import { MessageType } from '../../types';
import { LintError } from '../../plugin/errors';
import ErrorDetails from './ErrorDetails';
import TotalErrorCount from './TotalErrorCount';
import HelpPage from './HelpPage';

const App = ({}) => {
  const [errorArray, setErrorArray] = useState<Array<LintError>>([]);
  const [activePage, setActivePage] = useState('errors');
  const [ignoredErrorArray, setIgnoreErrorArray] = useState<Array<LintError>>(
    []
  );
  const [activeError, setActiveError] = React.useState<number>();
  const [activeNodeIds, setActiveNodeIds] = React.useState([]);
  const [lintVectors, setLintVectors] = useState(false);
  const [initialLoad, setInitialLoad] = React.useState(false);
  const [timedLoad, setTimeLoad] = React.useState(false);

  let newWindowFocus = false;
  let counter = 0;

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      // Close plugin when pressing Escape
      window.parent.postMessage({ pluginMessage: { type: 'close' } }, '*');
    }
  });

  // const updateSelectedList = (id) => {
  //   setSelectedListItem((selectedListItems) => {
  //     selectedListItems.splice(0, selectedListItems.length);
  //     return selectedListItems.concat(id);
  //   });

  //   setActiveNodeIds((activeNodeIds) => {
  //     if (activeNodeIds.includes(id)) {
  //       // Remove this node if it exists in the array already from intial run.
  //       // Don't ignore it if there's only one layer total.
  //       if (activeNodeIds.length !== 1) {
  //         return activeNodeIds.filter((activeNodeId) => activeNodeId !== id);
  //       } else {
  //         return activeNodeIds;
  //       }
  //     }
  //     // Since the ID is not already in the list, we want to add it
  //     return activeNodeIds.concat(id);
  //   });
  // };

  const updateNavigation = (page) => {
    setActivePage(page);

    parent.postMessage(
      {
        pluginMessage: {
          type: MessageType.UPDATE_ACTIVE_PAGE_IN_SETTINGS,
          page: page,
        },
      },
      '*'
    );
  };

  const updateActiveError = (error: LintError, index: number) => {
    setActiveError(index);
  };

  const ignoreAll = (errors) => {
    setIgnoreErrorArray((ignoredErrorArray) => [
      ...ignoredErrorArray,
      ...errors,
    ]);
  };

  const updateIgnoredErrors = (error) => {
    if (ignoredErrorArray.some((e) => e.node.id === error.node.id)) {
      if (ignoredErrorArray.some((e) => e.value === error.value)) {
        return;
      } else {
        setIgnoreErrorArray([error].concat(ignoredErrorArray));
      }
    } else {
      setIgnoreErrorArray([error].concat(ignoredErrorArray));
    }
  };

  const updateErrorArray = (errors: Array<LintError>) => {
    setErrorArray(errors);
  };

  const updateLintRules = (boolean) => {
    setLintVectors(boolean);

    parent.postMessage(
      {
        pluginMessage: {
          type: MessageType.UPDATE_LINT_RULES_FROM_SETTINGS,
          boolean: boolean,
        },
      },
      '*'
    );
  };

  const onFocus = () => {
    newWindowFocus = true;
    counter = 0;
  };

  const onBlur = () => {
    newWindowFocus = false;
    pollForChanges();
  };

  const onRunApp = React.useCallback(() => {
    parent.postMessage(
      {
        pluginMessage: { type: MessageType.RUN_APP, lintVectors: lintVectors },
      },
      '*'
    );
  }, []);

  // Recursive function for detecting if the user updates a layer.
  // polls for up to two minutes.
  function pollForChanges() {
    if (newWindowFocus === false && counter < 600) {
      // How often we poll for new changes.
      let timer = 1500;

      parent.postMessage(
        { pluginMessage: { type: MessageType.UPDATE_ERRORS } },
        '*'
      );
      counter++;

      setTimeout(() => {
        pollForChanges();
      }, timer);
    }
  }

  const handleNextError = () => {
    setActiveError((prev = 0) => (prev + 1) % errorArray.length);
  };

  const handlePrevError = () => {
    setActiveError((prev = 0) => {
      return prev - 1 > 0 ? prev - 1 : errorArray.length - 1;
    });
  };

  const handleAutoFix = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: MessageType.AUTOFIX,
          errors: errorArray,
        },
      },
      '*'
    );
  };

  // If no layer is selected after 3 seconds, show the empty state.
  setTimeout(function () {
    setTimeLoad(true);
  }, 3000);

  React.useEffect(() => {
    // Update client storage so the next time we run the app
    // we don't have to ignore our errors again.
    if (initialLoad !== false && ignoredErrorArray.length) {
      parent.postMessage(
        {
          pluginMessage: {
            type: MessageType.UPDATE_STORAGE,
            storageArray: ignoredErrorArray,
          },
        },
        '*'
      );
    }
  }, [ignoredErrorArray]);

  React.useEffect(() => {
    onRunApp();

    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);

    window.onmessage = (event) => {
      const { type, message, errors, storage } = event.data.pluginMessage;
      console.log('onmessage', type);

      // Plugin code returns this message after we return the first node
      // for performance, then we lint the remaining layers.
      if (type === 'complete') {
        updateErrorArray(errors);

        setInitialLoad(true);
      } else if (type === 'first node') {
        let nodeObject = JSON.parse(message);

        updateErrorArray(errors);

        setActiveNodeIds((activeNodeIds) => {
          return activeNodeIds.concat(nodeObject[0].id);
        });

        // After we have the first node, we want to
        // lint the remaining selection.
        parent.postMessage(
          {
            pluginMessage: {
              type: MessageType.LINT_ALL,
              nodes: nodeObject,
            },
          },
          '*'
        );
      } else if (type === 'fetched storage') {
        if (storage) {
          let clientStorage = JSON.parse(storage);

          setIgnoreErrorArray((ignoredErrorArray) => [
            ...ignoredErrorArray,
            ...clientStorage,
          ]);
        }
      } else if (type === 'fetched active page') {
        if (storage) {
          let clientStorage = JSON.parse(storage);
          setActivePage(clientStorage);
        }
      } else if (type === 'reset storage') {
        if (storage) {
          let clientStorage = JSON.parse(storage);
          setIgnoreErrorArray([...clientStorage]);
          parent.postMessage(
            { pluginMessage: { type: MessageType.UPDATE_ERRORS } },
            '*'
          );
        }
      } else if (type === 'fetched layer') {
        // Grabs the properties of the first layer.
        // setSelectedNode(() => JSON.parse(message));
        // Ask the controller to lint the layers for errors.
        // parent.postMessage(
        //   { pluginMessage: { type: MessageType.UPDATE_ERRORS } },
        //   '*'
        // );
      } else if (type === 'updated errors') {
        // Once the errors are returned, update the error array.
        updateErrorArray(errors);
      }
    };
  }, []);

  console.info('Navigation', activePage);

  return (
    <div className="container">
      <Navigation
        onPageSelection={updateNavigation}
        activePage={activePage}
        updateLintRules={updateLintRules}
        ignoredErrorArray={ignoredErrorArray}
        lintVectors={lintVectors}
        onRefreshSelection={onRunApp}
      />
      {activePage === 'errors' && (
        <>
          {activeNodeIds.length !== 0 ? (
            <div>
              <ErrorList
                errorArray={errorArray}
                ignoredErrorArray={ignoredErrorArray}
                onIgnoredUpdate={updateIgnoredErrors}
                onIgnoreAll={ignoreAll}
                ignoredErrors={ignoredErrorArray}
                onSelect={updateActiveError}
              />
              <div className="footer sticky-footer">
                <TotalErrorCount totalErrorNumber={errorArray.length} />
                <div className="actions-row">
                  <button
                    className="button button--secondary"
                    onClick={() => onRunApp()}
                  >
                    Re-run
                  </button>
                  <button
                    className="button button--primary button--flex"
                    onClick={handleAutoFix}
                  >
                    Auto-fix {errorArray.length}{' '}
                    {errorArray.length === 1 ? 'error' : 'errors'}
                  </button>
                </div>
              </div>
            </div>
          ) : timedLoad === false ? (
            <Preloader />
          ) : (
            <EmptyState onHandleRunApp={onRunApp} />
          )}

          <ErrorDetails
            isVisible={typeof activeError !== 'undefined'}
            error={errorArray[activeError || 0]}
            onClose={() => setActiveError(undefined)}
            onNext={handleNextError}
            onPrev={handlePrevError}
          />
        </>
      )}

      {activePage === 'help' && <HelpPage />}
    </div>
  );
};

export default App;
