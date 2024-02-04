import ChessBoardPanel from "../view/ChessBoardPanel.js";

class EventHandlers {
  constructor(
    clearHighlightsCallback,
    clearSquareOnCanvasCallback,
    drawGhostPieceOnCanvasCallback,
    boardContainer,
    guiController,
    imageLoader,
    canvas,
    board
  ) {
    this.clearHighlights = clearHighlightsCallback;
    this.clearSquareOnCanvas = clearSquareOnCanvasCallback;
    this.drawGhostPieceOnCanvas = drawGhostPieceOnCanvasCallback;
    this.boardContainer = boardContainer;
    this.guiController = guiController;
    this.imageLoader = imageLoader;
    this.canvas = canvas;
    this.board = board;

    this.squareSize = this.canvas.width / 8;
    this.dragInitiated = false;
    this.isDragging = false;
    this.originalSquare = null;
    this.draggingPiece = null;
    this.startX = 0;
    this.startY = 0;

    this.draggingDiv = document.createElement("div");
    this.draggingDiv.className = "draggingDiv";
    this.draggingDiv.style.position = "absolute";
    this.draggingDiv.style.visibility = "hidden";
    this.draggingDiv.style.zIndex = "2";
    this.draggingDiv.style.pointerEvents = "none";
    this.boardContainer.appendChild(this.draggingDiv);
  }

  onMouseDown(event) {
    this.clearHighlights();

    const { row, col } = this.getSquareFromCoordinates(
      event.clientX,
      event.clientY
    );

    const piece = this.board.getPieceAt(row, col);
    if (piece) {
      this.startX = event.clientX;
      this.startY = event.clientY;
      const image = this.imageLoader.getPieceImage(piece);

      this.draggingDiv.innerHTML = `<img src="${image.src}" width="${this.squareSize}" height="${this.squareSize}">`;
      this.draggingDiv.style.left = `${event.clientX - this.squareSize / 2}px`;
      this.draggingDiv.style.top = `${event.clientY - this.squareSize / 2}px`;
      this.draggingDiv.style.visibility = "visible";

      this.draggingPiece = piece;
      this.originalSquare = { row, col };
      this.isDragging = false;
      this.dragInitiated = false;
    }
  }

  onMouseMove(event) {
    if (this.draggingPiece) {
      this.draggingDiv.style.left = `${event.clientX - this.squareSize / 2}px`;
      this.draggingDiv.style.top = `${event.clientY - this.squareSize / 2}px`;

      const diffX = Math.abs(event.clientX - this.startX);
      const diffY = Math.abs(event.clientY - this.startY);
      if (
        diffX > ChessBoardPanel.DRAG_DELTA ||
        diffY > ChessBoardPanel.DRAG_DELTA
      ) {
        this.isDragging = true;
      }
    }
    if (!this.dragInitiated && this.isDragging) {
      this.guiController.handleDragStart(
        this.draggingPiece.getCurrentSquare().getRow(),
        this.draggingPiece.getCurrentSquare().getCol()
      );
      this.clearSquareOnCanvas(
        this.originalSquare.col,
        this.originalSquare.row
      );
      this.drawGhostPieceOnCanvas(
        this.draggingPiece,
        this.originalSquare.col * this.squareSize,
        this.originalSquare.row * this.squareSize
      );
      this.dragInitiated = true;
    }
  }

  onMouseUp(event) {
    this.clearHighlights();
    this.draggingDiv.style.visibility = "hidden";

    const { row, col } = this.getSquareFromCoordinates(
      event.clientX,
      event.clientY
    );

    if (this.isDragging) {
      this.guiController.handleDragDrop(row, col);
    } else {
      this.guiController.handleSquareClick(row, col);
    }
    this.draggingPiece = null;
    this.originalSquare = null;
    this.isDragging = false;
    this.dragInitiated = false;
  }

  getSquareFromCoordinates(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const relX = x - rect.left;
    const relY = y - rect.top;
    const col = Math.floor(relX / this.squareSize);
    const row = Math.floor(relY / this.squareSize);
    return { row, col };
  }

  updateSquareSize(squareSize) {
    this.squareSize = squareSize;
  }
}

export default EventHandlers;
