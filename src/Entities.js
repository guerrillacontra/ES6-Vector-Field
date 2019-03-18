import {
  vectorFieldPositionToCanvas,
  canvasPositionToVectorFieldPosition
} from "./SpatialConversions.js";

import * as Vector2 from "./Vector2.js";

export class Player{
  constructor(x, y) {
    this._x = x;
    this._y = y;
  }
  
    getPosition() {
    return { x: this._x, y: this._y };
  }

  setPosition(pos) {
    this._x = pos.x;
    this._y = pos.y;
  }
}


export class Enemy{
  constructor(x, y, speed, onEnemyTouchedPlayer) {
    this._x = x;
    this._y = y;
    this._speed = speed;
    this._onEnemyTouchedPlayer = onEnemyTouchedPlayer;
  }


  getPosition() {
    return { x: this._x, y: this._y };
  }

  setPosition(pos) {
    this._x = pos.x;
    this._y = pos.y;
  }

  moveToTarget(playerPos, vectorField, cellSize, dt) {
    /* Multiple phases */

    const myCanvasPos = this.getPosition();

    const myVectorFieldPos = canvasPositionToVectorFieldPosition(
      myCanvasPos.x,
      myCanvasPos.y,
      cellSize
    );

    
    //move into legal space if not in the field...
    
    if (!vectorField.isLegalFieldPosition(myVectorFieldPos.column,myVectorFieldPos.row)) {
     
      this.followEuclidean(playerPos, cellSize, dt);
      return;
    }

    //make a try for the most direct route in canvas space if there are no blocking cells
    //this makes it feel more realistic
    
    const directDelta = Vector2.sub(playerPos, myCanvasPos);
    const directNormal = Vector2.normalized(directDelta);
    
    const nextDirectPos = Vector2.add(
      myCanvasPos,
      Vector2.scale(directNormal, this._speed * dt)
    );
    
    const nextDirectFieldPos = canvasPositionToVectorFieldPosition(
      nextDirectPos.x,
      nextDirectPos.y,
      cellSize
    );

    if (vectorField.isLegalFieldPosition(nextDirectFieldPos.column,nextDirectFieldPos.row)) {
      
      const surroundingFieldCells = vectorField.getLegalSurroundingValues(
        myVectorFieldPos.column,
        myVectorFieldPos.row
      );

      let canIgnoreField = surroundingFieldCells.filter(cell => cell.isObstacle).length == 0;


      if ( canIgnoreField) {
        
        const nextCellNormal = vectorField.getValue(nextDirectFieldPos.column,nextDirectFieldPos.row).normal;
        const dot = Vector2.dot(directNormal, nextCellNormal);
        
        //ensures we don't hit a "local minima" where we head towards the target
        //but the field is pointing against us. Which causes us to get stuck
        //for ever...

        if(dot > 0){
           this.followEuclidean(playerPos, cellSize, dt);
            return;
        }
      }
    }

    //obstacle is in front of me...

    const myVectorFieldVal = vectorField.getValue(
      myVectorFieldPos.column,
      myVectorFieldPos.row
    );

    const myNormal = myVectorFieldVal.normal;

    //where does the field tell me to be next?

    const destinationVectorFieldPos = {
      column: myVectorFieldPos.column + Math.round(myNormal.x),
      row: myVectorFieldPos.row + Math.round(myNormal.y)
    };

    //where is this in canvas space?
    //offset by half a cell size as we are targeting the center of each cell...
    const destinationCanvasPos = Vector2.add(
      vectorFieldPositionToCanvas(
        destinationVectorFieldPos.column,
        destinationVectorFieldPos.row,
        cellSize
      ),
      { x: cellSize * 0.5, y: cellSize * 0.5 }
    );

    const destinationValue = vectorField.getValue(
      destinationVectorFieldPos.column,
      destinationVectorFieldPos.row
    );

    this.followEuclidean(destinationCanvasPos, cellSize, dt);
  }

  followEuclidean(pos, cellSize, dt) {
    const delta = Vector2.sub(pos, this.getPosition());

    const dist = Vector2.mag(delta);

    if (dist < cellSize * 0.5) {
      this._onEnemyTouchedPlayer(this);
      return;
    }

    const norm = Vector2.normalized(delta);
    const nextPos = Vector2.add(
      this.getPosition(),
      Vector2.scale(norm, this._speed * dt)
    );
    this.setPosition(nextPos);
  }

  draw(context, vectorField, cellSize, dt) {
    context.beginPath();
    context.lineWidth = "0.5";
    context.strokeStyle = "white";
    context.fillStyle = "#ffff00ff";
    context.fillRect(
      this.getPosition().x - cellSize * 0.25,
      this.getPosition().y - cellSize * 0.25,
      cellSize * 0.5,
      cellSize * 0.5
    );
    context.stroke();
  }
}


//Keep entities seperate so they do not "bunch" together.
export const seperateEntities = (entities, radius, dt) => {
  
  for(let i = 0; i < entities.length;i++){
    for(let k = 0; k < entities.length;k++){
      
      if(i === k)continue;
      
      const a = entities[i];
      const aPos = a.getPosition();
      
      const b = entities[k];
      const bPos = b.getPosition();
      
      const delta = Vector2.sub(bPos, aPos);
      const mag = Vector2.mag(delta);
      
      
      if(mag < radius){
        
        const norm = Vector2.normalized(delta);
        
        const amount = mag / radius;
        
        aPos.x -= (amount * 0.5 * (norm.x * radius)) * dt;
        aPos.y -= (amount * 0.5 * (norm.y * radius)) * dt;
        
        bPos.x += (amount * 0.5 * (norm.x * radius)) * dt;
        bPos.y += (amount * 0.5 * (norm.y * radius)) * dt;
        
        a.setPosition(aPos);
        b.setPosition(bPos);
      }
      
    }
  }
  
}
