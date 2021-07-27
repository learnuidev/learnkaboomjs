// testing
import { vec2 } from "./kaboomV6/math";
import { appInit } from "./kaboomV6/app";
import { audioInit } from "./kaboomV6/audio";
import { gfxInit, originPt } from "./kaboomV6/gfx";

// console.log("app", appInit);
// console.log("Audio", audioInit);
// console.log("gfx", gfxInit);

window.vec2 = vec2;

function App() {
  return (
    <div className="App">
      <div> Kaboom</div>
    </div>
  );
}

export default App;
