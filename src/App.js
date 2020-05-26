import React, {useCallback, useRef} from 'react';
import './App.css';
import {WebGLRenderer} from './renderer';

function App() {
  const renderer = useRef(null);
  const canvasRefCallback = useCallback(canvas => {
    console.log(canvas);
    if (renderer.current) {
      renderer.current.stop();
    }

    renderer.current = WebGLRenderer(canvas);
    renderer.current.start();
  }, [renderer]);
  console.log('rerun');
  return (
    <div className="App">
      <canvas ref={canvasRefCallback} style={{width: `100vw`, height: `100vh`}}/>
    </div>
  );
}

export default App;
