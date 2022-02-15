import { useState, useEffect, useRef, ReactElement } from 'react';
import { Tooltip } from 'antd';
import classNames from 'classnames';

import './index.less';

const isSupportLineClamp = document.body.style.webkitLineClamp !== undefined;

export type EllipsisTextParams = {
  text: string | any;
  length: number;
  tooltip: boolean;
  [propName: string]: any
};

function EllipsisText({ text, length, tooltip, ...other }: EllipsisTextParams){
  if (typeof text !== 'string') {
    throw new Error('Ellipsis children must be string.');
  }
  if (text.length <= length || length < 0) {
    return <span {...other}>{text}</span>;
  }
  const tail = '...';
  let displayText;
  if (length <= 0) {
    displayText = '';
  } else {
    displayText = text.slice(0, length);
  }

  if (tooltip) {
    return (
      <Tooltip overlayStyle={{ wordBreak: 'break-all' }} title={text}>
        <span {...other}>
          {displayText}
          {tail}
        </span>
      </Tooltip>
    );
  }

  return (
    <span {...other}>
      {displayText}
      {tail}
    </span>
  );
}

export type EllipsisParams = {
  children: React.ReactElement,
  lines: number;
  length: number;
  className?: string;
  tooltip: boolean;
  [propName: string]: any
};

const bisection = (
  th: number,
  m: number,
  b: number,
  e: any,
  text: string,
  shadowNode: { innerHTML: string; offsetHeight: any; }): number => {
  const suffix = '...';
  let mid = m;
  let end = e;
  let begin = b;
  shadowNode.innerHTML = text.substring(0, mid) + suffix;
  let sh = shadowNode.offsetHeight;

  if (sh <= th) {
    shadowNode.innerHTML = text.substring(0, mid + 1) + suffix;
    sh = shadowNode.offsetHeight;
    if (sh > th) {
      return mid;
    } else {
      begin = mid;
      mid = Math.floor((end - begin) / 2) + begin;
      return bisection(th, mid, begin, end, text, shadowNode);
    }
  } else {
    if (mid - 1 < 0) {
      return mid;
    }
    shadowNode.innerHTML = text.substring(0, mid - 1) + suffix;
    sh = shadowNode.offsetHeight;
    if (sh <= th) {
      return mid - 1;
    } else {
      end = mid;
      mid = Math.floor((end - begin) / 2) + begin;
      return bisection(th, mid, begin, end, text, shadowNode);
    }
  }
};

function Ellipsis({ children, lines, length, className, tooltip = true, ...restProps }: EllipsisParams) {
  const [text, setText] = useState<string>('');
  const [targetCount, setTargetCount] = useState<number>(0);
  const node = useRef<HTMLSpanElement>(null);
  const shadow = useRef<{ firstChild: HTMLElement }>(null);
  const shadowChildren = useRef<{ innerText: string; offsetHeight: number }>(null);
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  const computeLine = () => {
    if (lines && !isSupportLineClamp) {
      const innerText = shadowChildren.current!.innerText;
      const lineHeight = parseInt(window.getComputedStyle(root).lineHeight, 10);
      const targetHeight = lines * lineHeight;
      content.style.height = `${targetHeight}px`;
      const totalHeight = shadowChildren.current!.offsetHeight;
      const shadowNode = shadow.current!.firstChild;

      if (totalHeight <= targetHeight) {
        setText(innerText);
        setTargetCount(innerText.length);
        return;
      }

      // bisection
      const len = innerText.length;
      const mid = Math.floor(len / 2);

      const count = bisection(targetHeight, mid, 0, len, innerText, shadowNode);

      setText(innerText);
      setTargetCount(count);
    }
  };
  const cls = classNames('text-ellipsis', className, {
    'text-ellipsis-lines': lines && !isSupportLineClamp,
    'text-ellipsis-lineClamp': lines && isSupportLineClamp,
  });

  useEffect(() => {
    if (node) {
      computeLine();
    }
  }, []);

  useEffect(() => {
    computeLine();
  }, [lines]);

  if (!lines && !length) {
    return (
      <span className={cls} {...restProps}>
        {children}
      </span>
    );
  }

  // length
  if (!lines) {
    return <EllipsisText className={cls} length={length} text={children || ''} tooltip={tooltip} {...restProps} />;
  }

  const id = `text-ellipsis-${`${new Date().getTime()}${Math.floor(Math.random() * 100)}`}`;

  // support document.body.style.webkitLineClamp
  if (isSupportLineClamp) {
    const style = `#${id}{
      display:-webkit-box;
      -webkit-line-clamp:${lines};
      -webkit-box-orient: vertical;
      overflow:hidden;
    }`;
    return (
      <div id={id} className={cls} {...restProps}>
        <style>{style}</style>
        {tooltip ? (
          <Tooltip overlayStyle={{ wordBreak: 'break-all' }} title={children}>
            <span>{children}</span>
          </Tooltip>
        ) : (
          <span>{children}</span>
        )}
      </div>
    );
  }

  const childNode = (
    <span ref={node}>
      {targetCount > 0 && text.substring(0, targetCount)}
      {targetCount > 0 && targetCount < text.length && '...'}
    </span>
  );

  return (
    <div {...restProps} ref={root} className={cls}>
      <div ref={content}>
        {tooltip ? (
          <Tooltip overlayStyle={{ wordBreak: 'break-all' }} title={text}>
            {childNode}
          </Tooltip>
        ) : (
          childNode
        )}
        <div className="text-ellipsis-shadow" ref={shadowChildren}>
          {children}
        </div>
        <div className="text-ellipsis-shadow" ref={shadow}>
          <span>{text}</span>
        </div>
      </div>
    </div>
  );
}

export default Ellipsis;
