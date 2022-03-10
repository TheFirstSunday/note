import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { SlotMachine as Slot } from '../core/lib/slot'

const SlotMachine = forwardRef(({
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
    lucky.current = new Slot({
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

export default SlotMachine;
