class CanvasApp {
  constructor(
    document,
    window,
    canvas,
    context,
    updateHandler,
    drawHandler,
    frameRate = 60,
    autoDraw = true
  ) {
    this._document = document;
    this._window = window;
    this._canvas = canvas;
    this._context = context;
    this._updateHandler = updateHandler;
    this._drawHandler = drawHandler;
    this._frameRate = frameRate;
    this._autoDraw = autoDraw;
    this._lastTime = 0;
    this._currentTime = 0;
    this._deltaTime = 0;
    this._interval = 0;
    this.onMouseMoveHandler = (x, y) => {};
    this.onMouseDownHandler = (x, y) => {};
    this.start = this.start.bind(this);
    this._onMouseEventHandlerWrapper = this._onMouseEventHandlerWrapper.bind(
      this
    );

    this._onRequestAnimationFrame = this._onRequestAnimationFrame.bind(this);
  }

  start() {
    
    
    this._lastTime = new Date().getTime();
    this._currentTime = 0;
    this._deltaTime = 0;
    this._interval = 1000 / this._frameRate;
    
    //disable drag icon when middle mouse
    this._document.body.onmousedown = function(e) { if (e.button === 1 || e.button === 2) return false; }
    
    this._canvas.addEventListener(
      "mousemove",
      e => {
        this._onMouseEventHandlerWrapper(e, this.onMouseMoveHandler);
      },
      false
    );

    this._canvas.addEventListener(
      "mousedown",
      e => {
        this._onMouseEventHandlerWrapper(e, this.onMouseDownHandler);
      },
      false
    );

   this._window.requestAnimationFrame(this._onRequestAnimationFrame);
  }

  _onMouseEventHandlerWrapper(e, callback) {
    let element = this._canvas;
    let offsetX = 0;
    let offsetY = 0;

    if (element.offsetParent) {
      do {
        offsetX += element.offsetLeft;
        offsetY += element.offsetTop;
      } while ((element = element.offsetParent));
    }

    const x = e.pageX - offsetX;
    const y = e.pageY - offsetY;

    callback(x, y, e.button);
  }

  _onRequestAnimationFrame() {
    
    if(this._autoDraw)
    this._window.requestAnimationFrame(this._onRequestAnimationFrame);

    this._currentTime = new Date().getTime();
    this._deltaTime = this._currentTime - this._lastTime;

    if (this._deltaTime > this._interval) {
      
      //delta time in seconds
      const dts = this._deltaTime * 0.001;
      
      this._updateHandler(dts);

      this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
      this._drawHandler(this._canvas, this._context, dts);

      this._lastTime = this._currentTime - this._deltaTime % this._interval;
    }
  }
  
  draw(){
  this._window.requestAnimationFrame(this._onRequestAnimationFrame);
  }
}

export default CanvasApp;