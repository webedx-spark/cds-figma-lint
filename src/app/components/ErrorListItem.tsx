import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

import { ReactComponent as effectsIcon } from '../assets/error-type/effects.svg';
import { ReactComponent as fillIcon } from '../assets/error-type/fill.svg';
import { ReactComponent as radiusIcon } from '../assets/error-type/radius.svg';
import { ReactComponent as strokeIcon } from '../assets/error-type/stroke.svg';
import { ReactComponent as textIcon } from '../assets/error-type/text.svg';
import { ReactComponent as ContextIcon } from '../assets/context.svg';
import { LintError } from '../../plugin/errors';
import { MessageType } from '../../types';

const iconType = {
  effects: effectsIcon,
  fill: fillIcon,
  radius: radiusIcon,
  stroke: strokeIcon,
  text: textIcon,
};

type ErrorListItemProp = {
  error: LintError;
  errorCount: number;
  handleIgnoreChange: (error: LintError) => void;
  handleSelectAll: (error: LintError) => void;
  handleIgnoreAll: (error: LintError) => void;
};

function ErrorListItem(props: ErrorListItemProp) {
  const ref = useRef();
  const [menuState, setMenuState] = useState(false);
  const { error, handleIgnoreChange, handleSelectAll, handleIgnoreAll } = props;

  const Icon = iconType[error.type.toLowerCase()];

  useOnClickOutside(ref, () => hideMenu());

  const showMenu = () => {
    setMenuState(true);
  };

  const hideMenu = () => {
    setMenuState(false);
  };

  const handleFix = (event: React.MouseEvent) => {
    event.stopPropagation();

    parent.postMessage(
      {
        pluginMessage: {
          type: MessageType.AUTOFIX,
          error,
        },
      },
      '*'
    );

    hideMenu();
  };

  return (
    <li className="error-list-item" ref={ref} onClick={showMenu}>
      <div className="flex-row">
        <span className="error-type">{Icon ? <Icon /> : null}</span>
        <span className="error-description">
          <div className="error-description__message">{error.message}</div>
          {error.value ? (
            <div className="current-value">{error.value}</div>
          ) : null}

          <div className="current-value">
            Autofix: {error.suggestion ? error.suggestion?.message : 'None'}
          </div>
        </span>
        <span className="context-icon">
          <div className="menu" ref={ref}>
            <div className="menu-trigger" onClick={showMenu}>
              <ContextIcon />
            </div>
          </div>
        </span>

        {props.errorCount > 1 ? (
          <ul
            className={
              'menu-items select-menu__list ' +
              (menuState ? 'select-menu__list--active' : '')
            }
          >
            {error.suggestion && (
              <li
                className="select-menu__list-item"
                key="list-item-2"
                onClick={handleFix}
              >
                Fix
              </li>
            )}
            <li
              className="select-menu__list-item"
              key="list-item-1"
              onClick={(event) => {
                event.stopPropagation();
                handleSelectAll(error);
                hideMenu();
              }}
            >
              Select All ({props.errorCount})
            </li>
            <li
              className="select-menu__list-item"
              key="list-item-2"
              onClick={(event) => {
                event.stopPropagation();
                handleIgnoreChange(error);
                hideMenu();
              }}
            >
              Ignore
            </li>
            <li
              className="select-menu__list-item"
              key="list-item-3"
              onClick={(event) => {
                event.stopPropagation();
                handleIgnoreAll(error);
                hideMenu();
              }}
            >
              Ignore All
            </li>
          </ul>
        ) : (
          <ul
            className={
              'menu-items select-menu__list ' +
              (menuState ? 'select-menu__list--active' : '')
            }
          >
            {error.suggestion && (
              <li
                className="select-menu__list-item"
                key="list-item-2"
                onClick={handleFix}
              >
                Fix
              </li>
            )}
            <li
              className="select-menu__list-item"
              key="list-item-2"
              onClick={(event) => {
                event.stopPropagation();
                handleIgnoreChange(error);
                hideMenu();
              }}
            >
              Ignore
            </li>
            <li
              className="select-menu__list-item"
              key="list-item-3"
              onClick={(event) => {
                event.stopPropagation();
                handleIgnoreAll(error);
                hideMenu();
              }}
            >
              Ignore All
            </li>
          </ul>
        )}
      </div>
    </li>
  );
}

// React hook click outside the component
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export default ErrorListItem;
