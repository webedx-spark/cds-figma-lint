import * as React from 'react';
import classNames from 'classnames';

import { ReactComponent as CaretIcon } from '../assets/caret.svg';

import { ReactComponent as InstanceIcon } from '../assets/instance.svg';
import { ReactComponent as FrameIcon } from '../assets/frame.svg';
import { ReactComponent as TextIcon } from '../assets/text.svg';
import { ReactComponent as LineIcon } from '../assets/line.svg';
import { ReactComponent as ComponentIcon } from '../assets/component.svg';
import { ReactComponent as ComponentSetIcon } from '../assets/component_set.svg';
import { ReactComponent as EllipseIcon } from '../assets/ellipse.svg';
import { ReactComponent as GroupIcon } from '../assets/group.svg';
import { ReactComponent as PolygonIcon } from '../assets/polygon.svg';
import { ReactComponent as RectangleIcon } from '../assets/rectangle.svg';
import { ReactComponent as SliceIcon } from '../assets/slice.svg';
import { ReactComponent as StarIcon } from '../assets/star.svg';
import { ReactComponent as VectorIcon } from '../assets/vector.svg';

type NodeType =
  | 'BOOLEAN_OPERATION'
  | 'COMPONENT'
  | 'COMPONENT_SET'
  | 'ELLIPSE'
  | 'FRAME'
  | 'GROUP'
  | 'INSTANCE'
  | 'LINE'
  | 'POLYGON'
  | 'RECTANGLE'
  | 'SLICE'
  | 'STAR'
  | 'TEXT'
  | 'VECTOR';

const listItemIcon: Record<Lowercase<NodeType>, React.ComponentType> = {
  instance: InstanceIcon,
  frame: FrameIcon,
  text: TextIcon,
  line: LineIcon,
  boolean_operation: LineIcon,
  component: ComponentIcon,
  component_set: ComponentSetIcon,
  ellipse: EllipseIcon,
  group: GroupIcon,
  polygon: PolygonIcon,
  rectangle: RectangleIcon,
  slice: SliceIcon,
  star: StarIcon,
  vector: VectorIcon,
};

function ListItem(props) {
  const { onClick } = props;
  const node = props.node;
  let childNodes = null;
  let errorObject = { errors: [] };
  let childErrorsCount = 0;

  let filteredErrorArray = props.errorArray;

  const Icon = listItemIcon[node.type.toLowerCase()];

  // Check to see if this node has corresponding errors.
  if (filteredErrorArray.some((e) => e.id === node.id)) {
    errorObject = filteredErrorArray.find((e) => e.id === node.id);
  }

  // The component calls itself if there are children
  if (node.children && node.children.length) {
    // Find errors in this node's children.
    childErrorsCount = findNestedErrors(node);

    let reversedArray = node.children.slice().reverse();
    childNodes = reversedArray.map(function (childNode) {
      return (
        <ListItem
          ignoredErrorArray={props.ignoredErrorArray}
          activeNodeIds={props.activeNodeIds}
          selectedListItems={props.selectedListItems}
          errorArray={filteredErrorArray}
          onClick={onClick}
          key={childNode.id}
          node={childNode}
        />
      );
    });
  }

  // Recursive function for finding the amount of errors
  // nested within this nodes children.
  function findNestedErrors(node) {
    let errorCount = 0;

    node.children.forEach((childNode) => {
      if (filteredErrorArray.some((e) => e.id === childNode.id)) {
        let childErrorObject = filteredErrorArray.find(
          (e) => e.id === childNode.id
        );
        errorCount = errorCount + childErrorObject.errors.length;
      }

      if (childNode.children) {
        errorCount = errorCount + findNestedErrors(childNode);
      }
    });

    return errorCount;
  }

  return (
    <li
      id={node.id}
      className={classNames(`list-item`, {
        'list-item--active': props.activeNodeIds.includes(node.id),
        'list-item--selected': props.selectedListItems.includes(node.id),
      })}
      onClick={(event) => {
        event.stopPropagation();
        onClick(node.id);
      }}
    >
      <div className="list-flex-row">
        <span className="list-arrow">{childNodes ? <CaretIcon /> : null}</span>
        <span className="list-icon">
          {Icon ? <Icon /> : node.type.toLowerCase()}
        </span>
        <span className="list-name">{node.name}</span>
        {childErrorsCount >= 1 && <span className="dot"></span>}
        {errorObject.errors.length >= 1 && (
          <span className="badge">{errorObject.errors.length}</span>
        )}
      </div>
      {childNodes ? <ul className="sub-list">{childNodes}</ul> : null}
    </li>
  );
}

export default ListItem;
