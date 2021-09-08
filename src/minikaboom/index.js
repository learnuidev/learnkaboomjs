import kaboom from "./kaboom";

function App() {
  const k = kaboom({
    canvas: document.getElementById("app"),
    global: true,
    width: 640,
    height: 480,
    fullscreen: true,
    scale: 1,
  });

  k.loadRoot("https://kaboomjs.com/pub/examples/");

  // Task: 1 Disable all the loaders, and refresh the screen
  // and see what happens
  // loading indicator indicates that loaders are working

  k.loadSprite("sprite/bg", "img/bg.png");
  return <div className="App"> Mini Kaboom</div>;
}

export default App;
