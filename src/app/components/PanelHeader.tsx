import { ReactComponent as FastForwardIcon } from '../assets/forward-arrow.svg';

function PanelHeader(props) {
  return (
    <div className="panel-header">
      <div className="panel-header__action">
        <button className="button--icon" onClick={props.handleHide}>
          <FastForwardIcon className="panel-collapse-icon" />
        </button>
      </div>
      <div className="panel-header__title">{props.title}</div>
    </div>
  );
}

export default PanelHeader;
