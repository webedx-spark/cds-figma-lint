import * as React from 'react';
import ErrorListItem from './ErrorListItem';
import TotalErrorCount from './TotalErrorCount';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactComponent as SmileIcon } from '../assets/smile.svg';
import { MessageType } from '../../types';
import { LintError } from '../../plugin/errors';

type ErrorListProps = {
  errorArray: Array<LintError>;
  ignoredErrorArray: any;
  onIgnoredUpdate: (error: LintError) => void;
  onIgnoreAll: (errors: Array<LintError>) => void;
  ignoredErrors: any;
  onSelect: (error: LintError, index: number) => void;
  onSelectedListUpdate?: () => void;
};

function ErrorList(props: ErrorListProps) {
  const {
    errorArray = [],
    ignoredErrorArray,
    ignoredErrors,
    onSelect,
    onIgnoreAll,
    onIgnoredUpdate,
    onSelectedListUpdate,
  } = props;

  function handleIgnoreChange(error) {
    onIgnoredUpdate(error);
  }

  function handleSelectAll(error) {
    parent.postMessage(
      {
        pluginMessage: {
          type: MessageType.SELECT_MULTIPLE_LAYERS,
          nodeArray: error.nodes,
        },
      },
      '*'
    );
  }

  function handleSelect(error) {
    parent.postMessage(
      {
        pluginMessage: {
          type: MessageType.FETCH_LAYER_DATA,
          id: error.node.id,
        },
      },
      '*'
    );
  }

  function handleIgnoreAll(error) {
    let errorsToBeIgnored = [];

    // filteredErrorArray.forEach((node) => {
    //   node.errors.forEach((item) => {
    //     if (item.value === error.value) {
    //       if (item.type === error.type) {
    //         errorsToBeIgnored.push(item);
    //       }
    //     }
    //   });
    // });

    // if (errorsToBeIgnored.length) {
    //   onIgnoreAll(errorsToBeIgnored);
    // }
  }

  const errorListItems = errorArray.map((error, index) => (
    <ErrorListItem
      error={error}
      index={index}
      key={index}
      handleSelect={() => onSelect(error, index)}
    />
  ));

  return (
    <div className="bulk-errors-list">
      <div className="panel-body panel-body-errors">
        {errorArray.length ? (
          <ul className="errors-list">
            <AnimatePresence>{errorListItems}</AnimatePresence>
          </ul>
        ) : (
          <div className="success-message">
            <div className="success-shape">
              <SmileIcon className="success-icon" />
            </div>
            All errors fixed in the selection
          </div>
        )}
      </div>
    </div>
  );
}

export default ErrorList;
