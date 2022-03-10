import React, { useEffect, useImperativeHandle, useRef, forwardRef } from 'react'
import { LuckyGrid as Grid } from '../core/lib/grid'

const LuckyGrid = forwardRef(({
    width = '',
    height = '',
    blocks = [],
    prizes = [],
    slots = [],
    defaultStyle = {},
    defaultConfig = {},
    onSuccess,
    onFinally,
    onError,
    onStart,
    onEnd
  }, ref) => {
  const lucky = useRef(null);
  const container = useRef<HTMLDivElement>null;

  const init = () => {
    lucky.current = new Grid({
      flag: 'WEB',
      divElement: container.current
    }, {
      width,
      height,
      blocks,
      prizes,
      slots,
      defaultStyle,
      defaultConfig,
      onSuccess,
      start: (...rest) => {
        onStart?.(...rest)
      },
      end: (...rest) => {
        onEnd?.(...rest)
      }
    })
  };

  useImperativeHandle(ref, () => ({
    play (...rest) {
      lucky.current?.play(...rest)
    },
    stop (...rest) {
      lucky.current?.stop(...rest)
    }
  }));
  useEffect(() => {
    try {
      init()
      onSuccess?.()
    } catch (err) {
      onError?.(err)
    } finally {
      onFinally?.(err)
    }
    lucky.current.width = width
    lucky.current.height = height
    lucky.current.blocks = blocks
    lucky.current.prizes = prizes
    lucky.current.slots = slots
  }, [width, height, blocks, prizes, slots])

  return <div ref={container} />
});

export default LuckyGrid;
