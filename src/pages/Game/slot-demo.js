import React from 'react'
import SlotMachine from './components/SlotMachine.js'

const data = [
  { name: '1元红包', img: 'https://cdn.jsdelivr.net/gh/buuing/cdn/imgs/lucky-canvas.png' },
  { name: '100元红包', img: 'https://cdn.jsdelivr.net/gh/buuing/cdn/imgs/lucky-canvas.png' },
  { name: '0.5元红包', img: 'https://cdn.jsdelivr.net/gh/buuing/cdn/imgs/lucky-canvas.png' },
  { name: '2元红包', img: 'https://cdn.jsdelivr.net/gh/buuing/cdn/imgs/lucky-canvas.png' },
  { name: '10元红包', img: 'https://cdn.jsdelivr.net/gh/buuing/cdn/imgs/lucky-canvas.png' },
  { name: '50元红包', img: 'https://cdn.jsdelivr.net/gh/buuing/cdn/imgs/lucky-canvas.png' },
  { name: '0.3元红包', img: 'https://cdn.jsdelivr.net/gh/buuing/cdn/imgs/lucky-canvas.png' },
  { name: '5元红包', img: 'https://cdn.jsdelivr.net/gh/buuing/cdn/imgs/lucky-canvas.png' }
]
const axis = [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [0, 1]]

const genPrizes = () => {
  const prizes = []
  for (let i = 0; i < 8; i++) {
    let item = data[i]
    prizes.push({
      name: item.name,
      index: i, x: axis[i][0], y: axis[i][1],
      fonts: [{ text: item.name, top: '70%' }],
      imgs: [{ src: item.img, width: '100%', top: '0%' }]
    })
  }

  return prizes;
};

const blocks = [
  { padding: '10px', background: '#ffc27a' },
  { padding: '10px', paddingRight: '90px', background: '#ff4a4c' },
  { padding: '0px', background: '#fff' }
];
const slots = [
  {},
  {},
  {},
];
const defaultStyle = {
  borderRadius: 15,
    fontColor: '#DF424B',
    fontSize: '14px',
    textAlign: 'center',
    background: '#fff',
    shadow: '0 5 1 #ebf1f4'
};

const SlotDemo = () => {
  const lucky = React.useRef(null);

  return (
    <div>
      <SlotMachine
        ref={lucky}
        width="300px"
        height="300px"
        blocks={blocks}
        prizes={genPrizes()}
        slots={slots}
        defaultStyle={defaultStyle}
        onStart={() => {
          lucky.current.play()
          setTimeout(() => {
            const index = Math.random() * 6 >> 0
            lucky.current.stop(index)
          }, 2500)
        }}
        onEnd={prize => {
          alert('恭喜获得大奖:' + prize.name)
        }}
      />
      <button onClick={e => {
        lucky.current.play()
      }}>play</button>
    </div>
  );
};

export default SlotDemo;
