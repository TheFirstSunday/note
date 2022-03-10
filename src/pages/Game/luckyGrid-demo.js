import React from 'react'
import LuckyGrid from './components/LuckyGrid.js'

const data = [
    { name: '1元红包', img: 'https://cdn.jsdelivr.net/gh/buuing/cdn/imgs/lucky-canvas.png' },
    { name: '100元红包', img: 'https://cdn.jsdelivr.net/gh/buuing/cdn/imgs/lucky-canvas.png' },
    { name: '0.5元红包', img: 'https://cdn.jsdelivr.net/gh/buuing/cdn/imgs/lucky-canvas.png' },
    { name: '2元红包', img: 'https://cdn.jsdelivr.net/gh/buuing/cdn/imgs/lucky-canvas.png' },
    { name: '10元红包', img: 'https://cdn.jsdelivr.net/gh/buuing/cdn/imgs/lucky-canvas.png' },
    { name: '50元红包', img: 'https://cdn.jsdelivr.net/gh/buuing/cdn/imgs/lucky-canvas.png' },
    { name: '0.3元红包', img: 'https://cdn.jsdelivr.net/gh/buuing/cdn/imgs/lucky-canvas.png' },
    { name: '5元红包', img: 'https://cdn.jsdelivr.net/gh/buuing/cdn/imgs/lucky-canvas.png' }
];

const axis = [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [0, 1]]

const defaultStyle = {
  borderRadius: 15,
  fontColor: '#DF424B',
  fontSize: '14px',
  textAlign: 'center',
  background: '#fff',
  shadow: '0 5 1 #ebf1f4'
};

const buttons =  [{
    x: 1, y: 1,
    background: 'linear-gradient(270deg, #FFDCB8, #FDC689)',
    shadow: '0 5 1 #e89b4f',
    fonts: [
      { text: `1 次`, fontColor: '#fff', top: '73%', fontSize: '11px' },
    ],
    imgs: [
      // { src: 'https://100px.net/assets/img/button.2f4ac3e9.png', width: '65%', top: '12%' },
      // { src: './img/btn.png', width: '50%', top: '73%' }
    ]
  }
];

const blocks = [
  { padding: '10px', background: '#ffc27a' },
  { padding: '10px', paddingRight: '90px', background: '#ff4a4c' },
  { padding: '0px', background: '#fff' }
];

const genPrizes = () => {
  const prizes = []
  for (let i = 0; i < 8; i++) {
    let item = data[i]
    prizes.push({
      name: item.name,
      index: i, x: axis[i][0], y: axis[i][1],
      fonts: [{ text: item.name, top: '70%' }],
      imgs: [{ src: item.img, width: '53%', top: '8%' }]
    })
  }

  return prizes;
};

const GridDemo = () => {
  const lucky = React.useRef(null);

  return (
    <LuckyGrid
        ref={lucky}
        width="300px"
        height="300px"
        blocks={blocks}
        prizes={genPrizes()}
        buttons={buttons}
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
  );
};

export default GridDemo;
