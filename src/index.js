import * as Vector2 from "./Vector2.js";
import VectorField from "./VectorField.js";
import CanvasApp from "./CanvasApp.js";
import {vectorFieldPositionToCanvas,canvasPositionToVectorFieldPosition} from "./SpatialConversions.js";
import { Enemy, Player, seperateEntities } from "./Entities.js";
import { RGBToHex, blendRGB } from "./Colour.js";


const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const cellSize = Math.max(canvas.width, canvas.height)/15;

const vectorField = new VectorField(
  Math.ceil(canvas.width / cellSize),
  Math.ceil(canvas.height / cellSize)
);

const player = new Player(0, 0);
vectorField.setTarget(0, 0);

const enemies = [];

const removeEnemy = (enemy)=>{
  const index = enemies.indexOf(enemy);
  if(index == -1)return;
  enemies.splice(index, 1);
};


const update = dt => {
  
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];

    //ensures the target pos is in the center of the cell the player resides...
    const playerPosOffset = { x: cellSize * 0.5,y: cellSize * 0.5};
    
    enemy.moveToTarget(
      Vector2.add(player.getPosition(), playerPosOffset),
      vectorField,
      cellSize,
      dt
    );
    
    seperateEntities(enemies, cellSize * 0.5, dt);
    
  }
};

const draw = (canvas, context, dt) => {
  
  //draw cells, distances, normals and blocking visuals
  for (let column = 0; column < vectorField.columns(); column++) {
    for (let row = 0; row < vectorField.rows(); row++) {
      
      const worldPosition = vectorFieldPositionToCanvas(column, row, cellSize);

      const value = vectorField.getValue(column, row);

      //colour in cell based on how hot/cold it is
      const maxHotness =
        Math.max(vectorField.columns(), vectorField.rows()) * 2;
      const hotness = 1 - Math.sin(value.distance / maxHotness);

      const hotrgba = { r: 1, g: 0, b: 0, a: 1 };
      const coldrgba = { r: 0, g: 0, b: 1, a: 0.5};
      const blend = blendRGB(coldrgba, hotrgba, hotness);

      context.beginPath();
      context.lineWidth = "0.5";
      context.strokeStyle = "white";
      if (value.isObstacle) {
        context.fillStyle = "#00000000";
      } else {
        context.fillStyle = RGBToHex(blend.r, blend.g, blend.b, blend.a);
      }
      context.fillRect(worldPosition.x, worldPosition.y, cellSize, cellSize);
      context.stroke();

      //draw cell normal
      context.beginPath();
      context.strokeStyle = "yellow";
      const centerPos = {
        x: worldPosition.x + cellSize * 0.5,
        y: worldPosition.y + cellSize * 0.5
      };
      context.moveTo(centerPos.x, centerPos.y);
      context.lineTo(
        centerPos.x + value.normal.x * cellSize * 0.5,
        centerPos.y + value.normal.y * cellSize * 0.5
      );
      context.stroke();

      //draw cell distance from target
      context.fillStyle = "white";
      context.textAlign = "center";
      context.font = "8px Arial";
      context.fillText(
        "" + value.distance,
        worldPosition.x + cellSize * 0.5,
        worldPosition.y + cellSize * 0.5
      );
    }
  }
  
  //draw enemies...
  for (let eIndex = 0; eIndex < enemies.length; eIndex++) {
        const enemy = enemies[eIndex];
        enemy.draw(context, vectorField, cellSize, dt);
      }
};

const app = new CanvasApp(document, window, canvas, context, update, draw, 60, true);

app.onMouseDownHandler = (x, y, button) => {
  var gridPos = canvasPositionToVectorFieldPosition(x, y, cellSize);
  var worldPos = vectorFieldPositionToCanvas(
    gridPos.column,
    gridPos.row,
    cellSize
  );

  const leftClick = 0;
  const middleClick = 1;
  const rightClick = 2;

  if (button == leftClick) {
    player.setPosition(worldPos);
    vectorField.setTarget(gridPos.column, gridPos.row);
  } else if (button == middleClick) {
    vectorField.toggleObstacle(gridPos.column, gridPos.row);

    const playerFieldPos = canvasPositionToVectorFieldPosition(
      player.getPosition().x,
      player.getPosition().y,
      cellSize
    );
    vectorField.setTarget(playerFieldPos.column, playerFieldPos.row);
  }else if(button === rightClick){
    const enemy = new Enemy(x, y, 80, removeEnemy);
    enemies.push(enemy);
  }
};

app.start();
app.draw();
