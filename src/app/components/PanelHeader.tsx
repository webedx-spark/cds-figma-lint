import { ReactComponent as BackIcon } from '../assets/back.svg';

type PanelHeaderProps = {
  title: string;
  actions?: React.ReactNode;
  handleHide?: React.MouseEventHandler<HTMLButtonElement>;
};

function PanelHeader(props: PanelHeaderProps) {
  const { actions, handleHide, title } = props;
  return (
    <div className="panel-header">
      <div className="panel-header__action">
        <button className="button--icon" onClick={handleHide}>
          <BackIcon className="panel-collapse-icon" />
        </button>
      </div>
      <div className="panel-header__title">{title}</div>
      <div className="panel-header__actions">{actions}</div>
    </div>
  );
}

export default PanelHeader;
