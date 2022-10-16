import { ReactComponent as FastForwardIcon } from '../assets/forward-arrow.svg';

type PanelHeaderProps = {
  title: string;
  actions?: React.ReactNode;
  handleHide?: React.MouseEventHandler<HTMLButtonElement>;
};

function PanelHeader(props: PanelHeaderProps) {
  const { title, actions, handleHide } = props;
  return (
    <div className="panel-header">
      <div className="panel-header__action">
        <button className="button--icon" onClick={handleHide}>
          <FastForwardIcon className="panel-collapse-icon" />
        </button>
      </div>
      <div className="panel-header__title">{title}</div>
      <div className="panel-header__actions">{actions}</div>
    </div>
  );
}

export default PanelHeader;
