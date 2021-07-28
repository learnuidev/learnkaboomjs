// testing
import kaboom from "./kaboomV6/kaboom";

const k = kaboom({ canvas: document.getElementById("app"), global: true });
k.loadRoot("https://kaboomjs.com/pub/examples/");

// Task: 1 Disable all the loaders, and refresh the screen
// and see what happens
// loading indicator indicates that loaders are working
k.loadSprite("sprite/bg", "img/bg.png");
k.loadSprite("sprite/birdy", "img/birdy.png");
k.loadSprite("sprite/pipe", "img/pipe.png");
k.loadSound("sound/score", "sounds/score.mp3");
k.loadSound("sound/wooosh", "sounds/wooosh.mp3");
k.loadSound("sound/hit", "sounds/hit.mp3");

// Lesson 2: Components
// Add function accepts array of component

// Two ways to write the game
// Task: Convery this into data driven style
// k.reg_comp("ui/text", [k.text("oh hi", 32), k.pos(100, 100)]);

k.reg_comp("ui_text", [
  ["text", "oh hi", 32],
  ["pos", [100, 100]],
]);

k.reg_comp("player", [
  ["sprite", "sprite/birdy"],
  ["pos", [450, 100]],
  ["scale", 4],
  { health: 100 },
  {
    getHealth: ({ player }) => {
      return player.health;
    },
    setHealth: ({ player }, health) => {
      return (player.health = health);
    },
  },
]);

// better key-down
function key_down(id, cb) {
  const handler = () => {
    return cb(k.state.components);
  };
  return k.keyDown(id, handler);
}

// after ===
key_down("left", ({ player }) => {
  player.pos.x = player.pos.x - 10;
});
key_down("right", ({ player }) => {
  player.pos.x = player.pos.x + 10;
});
key_down("up", ({ player }) => {
  player.pos.y = player.pos.y - 10;
});
key_down("down", ({ player }) => {
  player.pos.y = player.pos.y + 10;
});

// before ===
// k.keyDown("left", () => {
//   const player = k.get_comp("player");
//   player.pos.x = player.pos.x - 10;
// });
// k.keyDown("right", () => {
//   const player = k.get_comp("player");
//   player.pos.x = player.pos.x + 10;
// });
// k.keyDown("up", () => {
//   const player = k.get_comp("player");
//   player.pos.y = player.pos.y - 10;
// });
// k.keyDown("down", () => {
//   const player = k.get_comp("player");
//   player.pos.y = player.pos.y + 10;
// });

function App() {
  return <div className="App"></div>;
}

export default App;
