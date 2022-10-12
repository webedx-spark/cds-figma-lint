import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

import { ReactComponent as effectsIcon } from '../assets/error-type/effects.svg';
import { ReactComponent as fillIcon } from '../assets/error-type/fill.svg';
import { ReactComponent as radiusIcon } from '../assets/error-type/radius.svg';
import { ReactComponent as strokeIcon } from '../assets/error-type/stroke.svg';
import { ReactComponent as textIcon } from '../assets/error-type/text.svg';
import { ReactComponent as ContextIcon } from '../assets/context.svg';

const iconType = {
  effects: effectsIcon,
  fill: fillIcon,
  radius: radiusIcon,
  stroke: strokeIcon,
  text: textIcon,
};

function ErrorListItem(props) {
  const ref = useRef();
  const [menuState, setMenuState] = useState(false);
  let error = props.error;

  const Icon = iconType[error.type.toLowerCase()];

  useOnClickOutside(ref, () => hideMenu());

  const showMenu = () => {
    setMenuState(true);
  };

  const hideMenu = () => {
    setMenuState(false);
  };

  function handleIgnoreChange(error) {
    props.handleIgnoreChange(error);
  }

  function handleSelectAll(error) {
    props.handleSelectAll(error);
  }

  function handleIgnoreAll(error) {
    props.handleIgnoreAll(error);
  }

  return (
    <li className="error-list-item" ref={ref} onClick={showMenu}>
      <div className="flex-row">
        <span className="error-type">{Icon ? <Icon /> : null}</span>
        <span className="error-description">
          <div className="error-description__message">{error.message}</div>
          {error.value ? (
            <div className="current-value">{error.value}</div>
          ) : null}
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
