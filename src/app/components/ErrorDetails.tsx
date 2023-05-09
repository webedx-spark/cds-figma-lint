import type { LintError } from '../../plugin/errors';

import '../styles/panel.css';
import { motion } from 'framer-motion';
import Preloader from './Preloader';
import PanelHeader from './PanelHeader';
import { ReactComponent as SmileIcon } from '../assets/smile.svg';
import { MessageType } from '../../types';
import { memo, useEffect } from 'react';

const formatStyleName = (name: string) => {
  const arr = name.split('/');

  const prev = arr.length > 1 ? `${arr[arr.length - 2]}/` : undefined;

  return `${prev || ''}${arr[arr.length - 1]}`;
};

type ErrorDetailsProps = {
  isVisible?: boolean;
  error?: LintError;
  onNext?: () => void;
  onPrev?: () => void;
  onClose?: () => void;
};

const variants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: '100%' },
};

const ErrorDetails = (props: ErrorDetailsProps) => {
  const { isVisible, onNext, onPrev, error, onClose } = props;

  const handleAutoFix = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: MessageType.AUTOFIX,
          errors: [error],
        },
      },
      '*'
    );
  };

  useEffect(() => {
    if (error) {
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
  }, [error?.node.id]);

  return (
    <>
      <motion.div
        className="panel"
        initial={{ opacity: 0, x: '100%' }}
        animate={isVisible ? 'open' : 'closed'}
        transition={{ duration: 0.3, type: 'tween' }}
        variants={variants}
      >
        <PanelHeader title="Error details" handleHide={onClose} />

        <div className="panel-body">
          {error ? (
            <div className="details">
              <div className="details__row">
                <div className="details__label">Layer name</div>
                {error.node.name}
              </div>

              <div className="details__row">
                <div className="details__label">Error</div>
                {error.message}
              </div>

              {!!error.suggestion ? (
                <div className="details__row">
                  <div className="details__label">Suggested fix</div>
                  <button
                    title={error.suggestion?.reason}
                    className="button button--full button--primary"
                    onClick={handleAutoFix}
                  >
                    🛠 Change to{' '}
                    {error.suggestion?.message
                      ? formatStyleName(error.suggestion.message)
                      : 'unknown style'}
                  </button>
                </div>
              ) : null}

              <div className="details__row">
                <div className="details__label">Options</div>
                <button className="button button--secondary button--full">
                  Ignore error
                </button>
                <button className="button button--secondary button--full">
                  Ignore all identical errors
                </button>
                <button className="button button--secondary button--full">
                  Select all layers w/ identical errors
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="panel-footer">
          <button
            onClick={onPrev}
            className="button previous button--secondary button--flex"
          >
            ← Previous
          </button>

          <button
            onClick={onNext}
            className="button next button--secondary button--flex"
          >
            Next →
          </button>
        </div>
      </motion.div>
      {isVisible ? <div className="overlay" onClick={onClose}></div> : null}
    </>
  );
};

export default memo(ErrorDetails);
