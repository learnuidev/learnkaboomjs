import kaboom from "./kaboom";

function App() {
  kaboom({
    canvas: document.getElementById("app"),
    global: true,
    width: 640,
    height: 480,
    scale: 1,
  });
  return <div className="App"> Mini Kaboom</div>;
}

export default App;
