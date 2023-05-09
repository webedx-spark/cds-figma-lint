import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ReactComponent as ContextIcon } from '../assets/context.svg';

import { ReactComponent as effectsIcon } from '../assets/error-type/effects.svg';
import { ReactComponent as fillIcon } from '../assets/error-type/fill.svg';
import { ReactComponent as radiusIcon } from '../assets/error-type/radius.svg';
import { ReactComponent as strokeIcon } from '../assets/error-type/stroke.svg';
import { ReactComponent as textIcon } from '../assets/error-type/text.svg';
import { LintError } from '../../plugin/errors';

const iconType = {
  effects: effectsIcon,
  fill: fillIcon,
  radius: radiusIcon,
  stroke: strokeIcon,
  text: textIcon,
};

type ErrorListItemProp = {
  error: LintError;
  index: number;
  handleIgnoreChange?: () => void;
  handleSelectAll?: () => void;
  handleSelect?: (error: LintError) => void;
  handleIgnoreAll?: () => void;
};

function ErrorListItem(props: ErrorListItemProp) {
  const { error, index } = props;

  const Icon = iconType[error.type.toLowerCase()];

  function handleSelect(error) {
    props.handleSelect?.(error);
  }

  const variants = {
    initial: { opacity: 1, y: 10, scale: 1 },
    enter: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.8 },
  };

  return (
    <motion.li
      className="error-list-item"
      role="button"
      onClick={handleSelect}
      key={error.node.id + index}
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <div className="flex-row">
        <span className="error-type">{Icon ? <Icon /> : null}</span>
        <span className="error-description">
          <div className="error-description__message">{error.message}</div>
          <div className="current-value">{error.node.name}</div>
        </span>
      </div>
    </motion.li>
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
