// testing
import { vec2 } from "./kaboomV6/math";
import kaboom from "./kaboomV6/kaboom";

// console.log("app", appInit);
// console.log("Audio", audioInit);
// console.log("gfx", gfxInit);

// kaboom();
window.vec2 = vec2;

function App() {
  return (
    <div className="App">
      <div> Kaboom</div>
    </div>
  );
}

export default App;
