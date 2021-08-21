// camera
import { Camera } from "./camera";
import { Scene } from "./scene";
import { cube, pyramid } from "./gameObject";
import { WebGPURenderer } from "./renderer";

let device;

// APP
export function patu(props) {
  if (!navigator.gpu) {
    console.log("WEBGPU Not supported");
    return "WEBGPU Not supported";
  }
  const outputCanvas = props.canvas;
  outputCanvas.width = window.innerWidth;
  outputCanvas.height = window.innerHeight;
  document.body.appendChild(outputCanvas);

  const camera = new Camera({
    aspect: outputCanvas.width / outputCanvas.height,
  });
  camera.z = 7;
  const scene = new Scene();

  window.scene = scene;

  const renderer = new WebGPURenderer();
  renderer.init(outputCanvas).then((dev) => {
    if (!dev) return;

    device = dev;
    scene.add(cube(device, { x: -2, y: 1 }));
    scene.add(pyramid(device, { x: 2 }));

    const doFrame = () => {
      // ANIMATE
      const now = Date.now() / 1000;
      for (let object of scene.getObjects()) {
        object.rotX = Math.sin(now);
        object.rotZ = Math.cos(now);
      }

      // RENDER
      renderer.frame(camera, scene);
      requestAnimationFrame(doFrame);
    };
    requestAnimationFrame(doFrame);
  });

  window.onresize = () => {
    outputCanvas.width = window.innerWidth;
    outputCanvas.height = window.innerHeight;
    camera.aspect = outputCanvas.width / outputCanvas.height;
    renderer.update(outputCanvas);
  };

  function addCube() {
    scene.add(
      cube(device, {
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 10,
      })
    );
  }

  window.addCube = addCube;

  function addPyramid() {
    scene.add(
      pyramid(device, {
        x: (Math.random() - 0.5) * 20,
        z: (Math.random() - 0.5) * 20,
      })
    );
  }

  // outputCanvas.canva.style = styles.join(";");
  outputCanvas.setAttribute("tabindex", "0");

  window.addPyramid = addPyramid;

  // MOUSE CONTROLS

  // ZOOM
  outputCanvas.onwheel = (event) => {
    camera.z += event.deltaY / 100;
  };

  // MOUSE DRAG
  var mouseDown = false;
  outputCanvas.onmousedown = (event) => {
    mouseDown = true;

    lastMouseX = event.pageX;
    lastMouseY = event.pageY;
  };

  outputCanvas.onmouseup = (event) => {
    mouseDown = false;
  };

  // outputCanvas.onkeydown = (event) => {
  //   console.log("event", event);
  // };
  // outputCanvas.onkeypress = (event) => {
  //   console.log("event", event);
  // };

  outputCanvas.addEventListener("keydown", (evt) => {
    console.log("RUNNER", evt);
    if (evt.code === "ArrowUp") {
      console.log("ZOOM IN");
      camera.z -= 5;
    } else if (evt.code === "ArrowDown") {
      console.log("ZOOM OUT");
      camera.z += 5;
    } else if (evt.code === "ArrowLeft") {
      camera.x -= 5;
    } else if (evt.code === "ArrowRight") {
      camera.x += 5;
    }
  });
  outputCanvas.addEventListener("keypress", () => {
    console.log("RUN yo");
  });

  window.canvas = outputCanvas;

  var lastMouseX = -1;
  var lastMouseY = -1;
  outputCanvas.onmousemove = (event) => {
    if (!mouseDown) {
      return;
    }

    var mousex = event.pageX;
    var mousey = event.pageY;

    if (lastMouseX > 0 && lastMouseY > 0) {
      const roty = mousex - lastMouseX;
      const rotx = mousey - lastMouseY;

      camera.rotY += roty / 100;
      camera.rotX += rotx / 100;
    }

    lastMouseX = mousex;
    lastMouseY = mousey;
  };
}

function App() {
  // testing
  let props = {
    canvas: document.getElementById("app"),
  };
  patu(props);
  return (
    <div className="App">
      <button onClick={window.addCube}> Add Circle</button>
      <button onClick={window.addPyramid}> Add Pyramid</button>
    </div>
  );
}

export default App;
