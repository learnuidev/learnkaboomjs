// testing
import { vec2 } from "./kaboomV6/math";
import app from "./kaboomV6/app";

console.log("app", app);
window.vec2 = vec2;

function App() {
  return (
    <div className="App">
      <div> Kaboom</div>
    </div>
  );
}

export default App;
