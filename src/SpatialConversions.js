export const vectorFieldPositionToCanvas = (column, row, cellSize) => {
    const xPos = column * cellSize;
    const yPos = row * cellSize;
    return { x: xPos, y: yPos };
};


export const canvasPositionToVectorFieldPosition = (x, y, cellSize) => {
    const xCol = Math.floor(x/ cellSize);
    const yRow =  Math.floor(y/ cellSize);
    return { column:xCol, row:yRow};
};