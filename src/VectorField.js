import { normalized } from "./Vector2.js";

class VectorField {
  constructor(columns, rows) {
    this._columns = Math.round(columns);
    this._rows = Math.round(rows);
    this._data = [];

    for (let c = 0; c < this._columns; c++) {
      const row = [];
      this._data.push(row);
      for (let r = 0; r < this._rows; r++) {
        row.push({
          normal: { x: 0, y: 0 },
          distance: 0,
          column: c,
          row: r,
          isObstacle: false
        });
      }
    }
  }

  getLegalSurroundingValues(column, row) {
    
    //8 cardinal direction normals around col/row
    const mooreNeighborhoodMask = [
      { column: column + -1,row: row + 0 },
      { column: column + -1,row: row + -1 },
      { column: column + 0, row: row + -1 },
      { column: column + 1, row: row + -1 },
      { column: column + 1, row: row + 0 },
      { column: column + 1, row: row + 1 },
      { column: column + 0, row: row + 1 },
      { column: column + -1,row: row + 1 }
    ];
    
    const lst = mooreNeighborhoodMask
    .filter(pos =>this.isLegalFieldPosition(pos.column, pos.row))
    .map(pos=>this.getValue(pos.column, pos.row));

    return lst;
  }

  getValue(column, row) {
    if (!this.isLegalFieldPosition(column, row)) {
      return null;
    }
    return { ...this._data[column][row] };
  }

  columns() {
    return this._columns;
  }
  rows() {
    return this._rows;
  }

  isLegalFieldPosition(column, row) {
    return (
      column >= 0 && row >= 0 && column < this._columns && row < this._rows
    );
  }


  toggleObstacle(column, row) {
    if(!this.isLegalFieldPosition(column, row))return;
    
    const nodeData = this._data[column][row];
    nodeData.isObstacle = !nodeData.isObstacle;
  }

  setTarget(column, row) {
    
    const vonNeumannNeighborhood = [
      { c: -1, r: 0 },
      { c: 0, r: -1 },
      { c: 1, r: 0 },
      { c: 0, r: 1 }
    ];
    
    const start = this._data[column][row];
    const fronteir = [start];

    const visited = new Map();
    visited.set(start, true);

    const distances = new Map();
    distances.set(start, 0);

    while (fronteir.length > 0) {
      const current = fronteir.pop();

      for (let nIndex = 0; nIndex < vonNeumannNeighborhood.length; nIndex++) {
        
        const neighborPos = {
          column: Math.round(current.column + vonNeumannNeighborhood[nIndex].c),
          row: Math.round(current.row + vonNeumannNeighborhood[nIndex].r)
        };

        //outside the bounds of the map
        if (!this.isLegalFieldPosition(neighborPos.column, neighborPos.row))
          continue;

        const neighborData = this._data[neighborPos.column][neighborPos.row];

        //all ready done this one
        if (visited.has(neighborData)) continue;

        if (neighborData.isObstacle) {
          neighborData.normal = { x: 0, y: 0 };
          continue;
        }

        neighborData.normal = normalized({
          x: current.column - neighborData.column,
          y: current.row - neighborData.row
        });

        distances.set(neighborData, 1.0 + distances.get(current));
        fronteir.unshift(neighborData);
        visited.set(neighborData, true);
      }
    }

    for (let [key, val] of distances) {
      key.distance = val;
    }
    start.normal = { x: 0, y: 0 };
  }
  js;
}

export default VectorField;
