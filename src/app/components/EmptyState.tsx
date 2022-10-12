import * as React from 'react';
import { motion } from 'framer-motion';
import meshBackgroundIcon from '../assets/mesh-background.png';
import { ReactComponent as NewLogo } from '../assets/new-logo.svg';

function EmptyState(props) {
  const onRunApp = () => {
    props.onHandleRunApp();
  };

  return (
    <motion.div
      className="empty-state-wrapper"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
    >
      <div className="background-wrapper">
        <img className="empty-state-background" src={meshBackgroundIcon} />
      </div>
      <div className="empty-state">
        <div className="empty-state__image">
          <NewLogo className="layer-icon" />
        </div>
        <div className="empty-state__title">Select a layer to get started.</div>
        <button
          className="button button--primary button--full"
          onClick={onRunApp}
        >
          Run Design Lint
        </button>
      </div>
    </motion.div>
  );
}

export default EmptyState;
