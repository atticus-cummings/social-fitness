import React from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

export default function PhotoViewer({ images }) {
  console.log(images)
  return (
    <PhotoProvider>
      {images.map((item, index) => (
        <PhotoView key={index} src={item} style={{ width: '468px' }}>
          <div>{item}</div>
          <img src={item} alt="" style={{ width: '100%' }} />
        </PhotoView>
      ))}
    </PhotoProvider>
  );
}
