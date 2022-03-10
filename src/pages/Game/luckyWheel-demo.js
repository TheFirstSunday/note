import React from 'react'
import LuckyWheel  from './components/LuckyWheel.js'

const blocks = [
  { padding: '13px', background: '#d64737' }
];

const buttons = [
  { radius: '50px', background: '#d64737' },
  { radius: '45px', background: '#fff' },
  { radius: '41px', background: '#f6c66f', pointer: true },
  {
    radius: '35px', background: '#ffdea0',
    fonts: [{ text: '开始\n抽奖', fontSize: '18px', top: -18 }]
  }
];

const defaultStyle = {
  fontColor: '#d64737',
  fontSize: '14px'
};

const prizes = [
  { title: '1元红包', background: '#f9e3bb', fonts: [{ text: '1元红包', top: '18%' }] },
  { title: '100元红包', background: '#f8d384', fonts: [{ text: '100元红包', top: '18%' }] },
  { title: '0.5元红包', background: '#f9e3bb', fonts: [{ text: '0.5元红包', top: '18%' }] },
  { title: '2元红包', background: '#f8d384', fonts: [{ text: '2元红包', top: '18%' }] },
  { title: '10元红包', background: '#f9e3bb', fonts: [{ text: '10元红包', top: '18%' }] },
  { title: '50元红包', background: '#f8d384', fonts: [{ text: '50元红包', top: '18%' }] },
];

const Wheel = () => {
  const lucky = React.useRef(null);

  return (
    <LuckyWheel
      ref={lucky}
      width="300px"
      height="300px"
      blocks={blocks}
      prizes={prizes}
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
        alert('恭喜获得大奖:' + prize.title)
      }}
    />
  );
};

export default Wheel;
