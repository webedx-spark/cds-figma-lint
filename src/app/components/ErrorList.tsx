import * as React from 'react';
import type { LintError } from '../../plugin/errors';
import type { NodeErrors } from '../../plugin/lint';
import ErrorListItem from './ErrorListItem';

type ErrorListProps = {
  errors: Array<LintError>;
  onIgnoredUpdate: (error: any) => void;
  onIgnoreAll: (error: any) => void;
  onSelectAll: (error: any) => void;
  allErrors: Array<NodeErrors>;
};

function ErrorList(props: ErrorListProps) {
  const { errors, onIgnoredUpdate, onIgnoreAll, onSelectAll, allErrors } =
    props;

  const handleIgnoreClick = (error) => {
    onIgnoredUpdate(error);
  };

  const handleIgnoreAll = (error) => {
    onIgnoreAll(error);
  };

  const handleSelectAll = (error) => {
    onSelectAll(error);
  };

  // Finds how many other nodes have this exact error.
  function countInstancesOfThisError(error) {
    let nodesToBeSelected = [];

    allErrors.forEach((node) => {
      node.errors.forEach((item) => {
        if (item.value === error.value) {
          if (item.type === error.type) {
            nodesToBeSelected.push(item.node.id);
          }
        }
      });
    });

    return nodesToBeSelected.length;
  }

  // ErrorListItem and BulkErrorListItem are nearly indentical bar a
  // few differences in what information and context menu items they have.
  const errorListItems = errors.map((error, index) => (
    <ErrorListItem
      error={error}
      errorCount={countInstancesOfThisError(error)}
      key={index}
      handleIgnoreChange={handleIgnoreClick}
      handleSelectAll={handleSelectAll}
      handleIgnoreAll={handleIgnoreAll}
    />
  ));

  return <ul className="errors-list">{errorListItems}</ul>;
}

export default React.memo(ErrorList);
