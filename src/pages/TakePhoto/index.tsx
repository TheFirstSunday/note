import React from 'react';
import { Button } from 'antd';

import './index.less';

let streaming = false;
const width = 320;
let height = 0;

const TakePhoto = () => {
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const video = React.useRef<HTMLVideoElement>(null);
  const photo = React.useRef<HTMLImageElement>(null);

  const clearPhoto = () => {
    const context = canvas!.current!.getContext('2d');
    // 生成空白图片
    context!.fillStyle = '#AAA';
    context!.fillRect(0, 0, canvas!.current!.width, canvas!.current!.height);
    const data = canvas!.current!.toDataURL('image/png');
    photo!.current!.setAttribute('src', data);
  };

  const takePhoto = () => {
    const context = canvas!.current!.getContext('2d');
    if (width && height) {
      // 将 video 元素的 width 和 height 拿过来
      canvas!.current!.width = width;
      canvas!.current!.height = height;

      context!.drawImage(video!.current as CanvasImageSource, 0, 0, width, height);

      // 生成图片
      const data = canvas!.current!.toDataURL('image/png');
      photo!.current!.setAttribute('src', data);
    } else {
      clearPhoto();
    }
  };

  const downloadPhoto = () => {
    const link = document.createElement('a');
    link.download = '你的帅照.png';
    link.href = canvas!.current!.toDataURL();
    link.click();
  };

  const onCanPlay = () => {
    if (!streaming) {
      // 按比例放大 videoHeight
      height = video!.current!.videoHeight / (video!.current!.videoWidth / width);

      // 设置 video 的宽高
      video!.current!.setAttribute('width', String(width));
      video!.current!.setAttribute('height', String(height));
      // 设置 canvas 的宽高
      canvas!.current!.setAttribute('width', String(width));
      canvas!.current!.setAttribute('height', String(height));
      streaming = true;
    }
  };

  const start = async () => {
    try {
      video!.current!.srcObject = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      video!.current!.play();
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    start();
  }, []);

  return (
    <>
      <video ref={video} onCanPlay={onCanPlay}>
        浏览器不支持 Video
      </video>

      <canvas ref={canvas}>
        <img ref={photo} alt="拍照后的照片" />
      </canvas>

      <div className="actions">
        <Button onClick={takePhoto}>拍照</Button>
        <Button onClick={downloadPhoto}>下载</Button>
        <Button onClick={clearPhoto}>清空</Button>
      </div>
    </>
  );
};

export default TakePhoto;
