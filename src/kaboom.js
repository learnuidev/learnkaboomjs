// testing
import kaboom from "./kaboomV6/kaboom";

// tiledmap plugin
import tiledMapPlugin from "./kaboomV6/plugins/tiledmaps";

// json
import map from "./example.json";
import terrain from "./terrain.png";

window.module = module;
window.map = map;
// window.export = ex;

const k = kaboom({
  canvas: document.getElementById("app"),
  global: true,
  width: 640,
  height: 480,
  plugins: [tiledMapPlugin],
});
// k.loadRoot("https://kaboomjs.com/pub/examples/");

// Task: 1 Disable all the loaders, and refresh the screen
// and see what happens
// loading indicator indicates that loaders are working

// k.loadSprite("sprite/bg", "img/bg.png");
// k.loadSprite("sprite/birdy", "img/birdy.png");
// k.loadSprite("sprite/pipe", "img/pipe.png");
// k.loadSound("sound/score", "sounds/score.mp3");
// k.loadSound("sound/wooosh", "sounds/wooosh.mp3");
// k.loadSound("sound/hit", "sounds/hit.mp3");

k.loadSprite("sprite/bg", "https://kaboomjs.com/pub/examples/img/bg.png");
k.loadSprite("sprite/birdy", "https://kaboomjs.com/pub/examples/img/birdy.png");
k.loadSprite("sprite/pipe", "https://kaboomjs.com/pub/examples/img/pipe.png");
k.loadSound(
  "sound/score",
  "https://kaboomjs.com/pub/examples/sounds/score.mp3"
);
k.loadSound(
  "sound/wooosh",
  "https://kaboomjs.com/pub/examples/sounds/wooosh.mp3"
);
k.loadSound("sound/hit", "https://kaboomjs.com/pub/examples/sounds/hit.mp3");

// Lesson 2: Components
// Add function accepts array of component

// Two ways to write the game
// Task: Convery this into data driven style
// k.reg_comp("ui/text", [k.text("oh hi", 32), k.pos(100, 100)]);

// k.reg_comp("ui_text", [
//   ["text", "oh hi", 32],
//   ["pos", [100, 100]],
// ]);

// k.reg_comp("player", [
//   ["sprite", "sprite/birdy"],
//   ["pos", [450, 100]],
//   ["scale", 4],
//   { health: 100 },
//   {
//     getHealth: ({ player }) => {
//       return player.health;
//     },
//     setHealth: ({ player }, health) => {
//       return (player.health = health);
//     },
//   },
// ]);

// better key-down
function keyDown(id, cb) {
  return k.keyDown(id, cb.bind(null, k.state.components));
}

// after ===
// keyDown("left", ({ player }) => {
//   player.pos.x = player.pos.x - 10;
// });
// keyDown("right", ({ player }) => {
//   player.pos.x = player.pos.x + 10;
// });
// keyDown("up", ({ player }) => {
//   player.pos.y = player.pos.y - 10;
// });
// keyDown("down", ({ player }) => {
//   player.pos.y = player.pos.y + 10;
// });

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

// TESTING
console.log("MAP", map);
k.loadTiledMap("/example.json", terrain).then((val) => {
  console.log("VAL", val);
  const { sprites, levels, key } = val;

  // here you can do whatever you like to key, for example adding solid()
  // eventually, I will auto-load tags when I load the map.

  var levels2 = levels.slice(0, 5);
  window.state = val;
  for (let level of levels2) {
    k.addLevel(level, { width: 32, height: 32, ...key });
  }

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

  keyDown("left", ({ player }) => {
    player.pos.x = player.pos.x - 10;
  });
  keyDown("right", ({ player }) => {
    player.pos.x = player.pos.x + 10;
  });
  keyDown("up", ({ player }) => {
    player.pos.y = player.pos.y - 10;
  });
  keyDown("down", ({ player }) => {
    player.pos.y = player.pos.y + 10;
  });
});
// k.loadTiledMap(map, terrain).then((val) => {
//   console.log("VAL", val);
//   const { sprites, levels, key } = val;

//   // here you can do whatever you like to key, for example adding solid()
//   // eventually, I will auto-load tags when I load the map.

//   var levels2 = levels.slice(0, 5);
//   window.val = val;
//   for (let level of levels2) {
//     k.addLevel(level, { width: 32, height: 32, ...key });
//   }

//   k.reg_comp("player", [
//     ["sprite", "sprite/birdy"],
//     ["pos", [450, 100]],
//     ["scale", 4],
//     { health: 100 },
//     {
//       getHealth: ({ player }) => {
//         return player.health;
//       },
//       setHealth: ({ player }, health) => {
//         return (player.health = health);
//       },
//     },
//   ]);

//   keyDown("left", ({ player }) => {
//     player.pos.x = player.pos.x - 10;
//   });
//   keyDown("right", ({ player }) => {
//     player.pos.x = player.pos.x + 10;
//   });
//   keyDown("up", ({ player }) => {
//     player.pos.y = player.pos.y - 10;
//   });
//   keyDown("down", ({ player }) => {
//     player.pos.y = player.pos.y + 10;
//   });
// });

function App() {
  return <div className="App"></div>;
}

export default App;
