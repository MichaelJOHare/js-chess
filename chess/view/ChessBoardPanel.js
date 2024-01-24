import ChessBoard from "../model/board/ChessBoard.js";

class ChessBoardPanel {
  static GAME_WIDTH = 600;
  static GAME_HEIGHT = 600;
  static DRAG_DELTA = 6;
  static LIGHT_SQUARE_COLOR = "rgb(248 240 198)";
  static DARK_SQUARE_COLOR = "rgb(156 98 69)";
  static LIGHT_SQUARE_HIGHLIGHT_COLOR = "rgb(127 158 92)";
  static DARK_SQUARE_HIGHLIGHT_COLOR = "rgb(123 138 50)";

  constructor(board) {
    this.board = board;
    this.canvas = document.getElementById("chessboard");
    this.ctx = this.canvas.getContext("2d");
    this.boardContainer = document.getElementById("chessboard-container");
    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;
    this.offscreenCtx = this.offscreenCanvas.getContext("2d");

    this.squareSize = this.canvas.width / 8;
    this.pieceImages = {};
    this.listOfMovesToHighlight = [];
    this.highlightedSquares = [];

    this.loadPieceImages();
    this.setScreen();

    window.addEventListener("resize", () => this.setScreen());
    if (screen.orientation) {
      screen.orientation.addEventListener("change", () => this.setScreen());
    }
    this.resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => this.setScreen(), 500);
    });

    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.draggingPiece = null;
    this.startX = 0;
    this.startY = 0;
    this.draggingOffsetX = 0;
    this.draggingOffsetY = 0;
  }

  init(guiController) {
    this.guiController = guiController;
    this.drawBoard();
    this.createOverlaySquares();
  }

  drawBoard() {
    const rowLabels = "87654321";
    const colLabels = "abcdefgh";
    const fontSize = this.squareSize / 6;
    this.offscreenCtx.font = `bold ${fontSize}px Roboto`;
    this.offscreenCtx.textBaseline = "top";

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        this.offscreenCtx.fillStyle =
          (row + col) % 2 === 0
            ? ChessBoardPanel.LIGHT_SQUARE_COLOR
            : ChessBoardPanel.DARK_SQUARE_COLOR;
        this.offscreenCtx.fillRect(
          col * this.squareSize,
          row * this.squareSize,
          this.squareSize,
          this.squareSize
        );

        // Column labels
        if (row === 7) {
          this.offscreenCtx.fillStyle =
            col % 2 === 1
              ? ChessBoardPanel.DARK_SQUARE_COLOR
              : ChessBoardPanel.LIGHT_SQUARE_COLOR;
          this.offscreenCtx.fillText(
            colLabels[col],
            col * this.squareSize + fontSize * 0.3,
            (row + 1) * this.squareSize - fontSize * 1
          );
        }

        // Row labels
        if (col === 7) {
          this.offscreenCtx.fillStyle =
            row % 2 === 1
              ? ChessBoardPanel.DARK_SQUARE_COLOR
              : ChessBoardPanel.LIGHT_SQUARE_COLOR;
          const labelWidth = this.offscreenCtx.measureText(
            rowLabels[row]
          ).width;
          this.offscreenCtx.fillText(
            rowLabels[row],
            (col + 1) * this.squareSize - labelWidth - fontSize * 0.3,
            row * this.squareSize + fontSize * 0.3
          );
        }
      }
    }

    this.drawPieces();
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  drawPieces() {
    for (let row = 0; row < ChessBoard.ROW_LENGTH; row++) {
      for (let col = 0; col < ChessBoard.COLUMN_LENGTH; col++) {
        const piece = this.board.getPieceAt(row, col);
        if (piece) {
          const pieceName = this.getPieceImageName(piece);
          const image = this.pieceImages[pieceName];
          if (image) {
            this.offscreenCtx.drawImage(
              image,
              col * this.squareSize,
              row * this.squareSize,
              this.squareSize * 0.96,
              this.squareSize * 0.96
            );
          }
        }
      }
    }
  }

  drawPiece(piece, x, y) {
    const pieceName = this.getPieceImageName(piece);
    const image = this.pieceImages[pieceName];
    if (image) {
      this.ctx.drawImage(
        image,
        x,
        y,
        this.squareSize * 0.96,
        this.squareSize * 0.96
      );
    }
  }

  onMouseDown(event) {
    const { row, col } = this.getSquareFromCoordinates(
      event.clientX,
      event.clientY
    );
    const piece = this.board.getPieceAt(row, col);
    if (piece) {
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.draggingPiece = piece;
      this.guiController.handleDragStart(row, col);
      const piecePosition = this.getPiecePosition(row, col);
      this.draggingOffsetX = event.clientX - piecePosition.x;
      this.draggingOffsetY = event.clientY - piecePosition.y;
    }
  }

  onMouseMove(event) {
    if (this.draggingPiece) {
      const x = event.clientX - this.draggingOffsetX;
      const y = event.clientY - this.draggingOffsetY;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.offscreenCanvas, 0, 0);
      this.drawPiece(this.draggingPiece, x, y);
    }
  }

  onMouseUp(event) {
    if (this.draggingPiece) {
      const { row, col } = this.getSquareFromCoordinates(
        event.clientX,
        event.clientY
      );
      const diffX = Math.abs(event.clientX - this.startX);
      const diffY = Math.abs(event.clientY - this.startY);
      if (
        diffX < ChessBoardPanel.DRAG_DELTA &&
        diffY < ChessBoardPanel.DRAG_DELTA
      ) {
        //this.draggingPiece = null;
        this.guiController.handleSquareClick(row, col);
      } else {
        const moveResult = this.guiController.handleDragDrop(row, col);
        this.draggingPiece = null;
        this.drawBoard();
      }
    }
  }

  getPieceImageName(piece) {
    const color = piece.getPlayer().getColor().toLowerCase();
    const colorCapitalized = color.charAt(0).toUpperCase() + color.slice(1);

    const type = piece.getType().toLowerCase();
    const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);

    return `${colorCapitalized}_${typeCapitalized}`;
  }

  loadPieceImages() {
    const pieceTypes = ["Pawn", "Rook", "Knight", "Bishop", "Queen", "King"];
    const pieceColors = ["White", "Black"];
    let loadedImagesCount = 0;
    const totalImages = pieceColors.length * pieceTypes.length;

    pieceColors.forEach((color) => {
      pieceTypes.forEach((type) => {
        const imageName = `${color}_${type}`;
        const imagePath = `./chess/images/${imageName}.svg`;
        this.pieceImages[imageName] = new Image();
        this.pieceImages[imageName].src = imagePath;
        this.pieceImages[imageName].onload = () => {
          loadedImagesCount++;
          if (loadedImagesCount === totalImages) {
            this.drawBoard();
          }
        };
      });
    });
  }

  createOverlaySquares() {
    const squareSize = this.canvas.width / 8;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        let square = document.createElement("div");
        square.classList.add("square");
        square.style.top = `${row * squareSize}px`;
        square.style.left = `${col * squareSize}px`;
        square.style.width = `${squareSize}px`;
        square.style.height = `${squareSize}px`;
        square.dataset.row = row;
        square.dataset.col = col;

        /*         square.addEventListener("click", () =>
          this.guiController.handleSquareClick(row, col)
        ); */

        this.boardContainer.appendChild(square);
      }
    }
  }

  updateOverlaySquares() {
    const squares = this.boardContainer.querySelectorAll(".square");
    squares.forEach((square) => {
      const row = square.dataset.row;
      const col = square.dataset.col;
      square.style.top = `${row * this.squareSize}px`;
      square.style.left = `${col * this.squareSize}px`;
      square.style.width = `${this.squareSize}px`;
      square.style.height = `${this.squareSize}px`;
    });
  }

  drawHighlightedSquares(moves) {
    this.listOfMovesToHighlight = moves;
    this.highlightedSquares = [];

    moves.forEach((move) => {
      const endSquare = move.getEndSquare();
      const startSquare = move.getStartSquare();

      this.highlightedSquares.push(endSquare, startSquare);

      let endHighlightColor =
        (endSquare.getRow() + endSquare.getCol()) % 2 === 0
          ? ChessBoardPanel.LIGHT_SQUARE_HIGHLIGHT_COLOR
          : ChessBoardPanel.DARK_SQUARE_HIGHLIGHT_COLOR;

      let startHighlightColor =
        (startSquare.getRow() + startSquare.getCol()) % 2 === 0
          ? ChessBoardPanel.LIGHT_SQUARE_HIGHLIGHT_COLOR
          : ChessBoardPanel.DARK_SQUARE_HIGHLIGHT_COLOR;

      this.drawDotHighlight(
        endSquare.getRow(),
        endSquare.getCol(),
        endHighlightColor
      );
      this.drawCornerHighlights(
        startSquare.getRow(),
        startSquare.getCol(),
        startHighlightColor
      );
    });
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  drawDotHighlight(row, col, color) {
    const centerX = (col + 0.5) * this.squareSize;
    const centerY = (row + 0.5) * this.squareSize;
    const radius = this.squareSize * 0.1;

    this.offscreenCtx.beginPath();
    this.offscreenCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    this.offscreenCtx.fillStyle = color;
    this.offscreenCtx.fill();
  }

  drawCornerHighlights(row, col, color) {
    const cornerSize = this.squareSize * 0.2;
    const positions = [
      { x: col * this.squareSize, y: row * this.squareSize },
      { x: (col + 1) * this.squareSize - cornerSize, y: row * this.squareSize },
      { x: col * this.squareSize, y: (row + 1) * this.squareSize - cornerSize },
      {
        x: (col + 1) * this.squareSize - cornerSize,
        y: (row + 1) * this.squareSize - cornerSize,
      },
    ];

    this.offscreenCtx.fillStyle = color;
    positions.forEach((pos) => {
      this.offscreenCtx.fillRect(pos.x, pos.y, cornerSize, cornerSize);
    });
  }

  clearHighlights() {
    this.highlightedSquares.forEach((square) => {
      this.redrawSquare(square.getRow(), square.getCol());
    });
    this.highlightedSquares = [];
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  redrawSquare(row, col) {
    this.offscreenCtx.fillStyle =
      (row + col) % 2 === 0
        ? ChessBoardPanel.LIGHT_SQUARE_COLOR
        : ChessBoardPanel.DARK_SQUARE_COLOR;
    this.offscreenCtx.fillRect(
      col * this.squareSize,
      row * this.squareSize,
      this.squareSize,
      this.squareSize
    );

    const piece = this.board.getPieceAt(row, col);
    if (piece) {
      this.drawPiece(piece, col * this.squareSize, row * this.squareSize);
    }
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  setScreen() {
    const scaleRatio = this.getScaleRatio();
    this.canvas.width = ChessBoardPanel.GAME_WIDTH * scaleRatio;
    this.canvas.height = ChessBoardPanel.GAME_HEIGHT * scaleRatio;
    this.squareSize = this.canvas.width / 8;

    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;

    this.drawBoard();
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    this.updateOverlaySquares();
  }

  getScaleRatio() {
    const screenHeight = Math.min(
      window.innerHeight,
      document.documentElement.clientHeight
    );

    const screenWidth = Math.min(
      window.innerWidth,
      document.documentElement.clientWidth
    );

    if (
      screenWidth / screenHeight <
      ChessBoardPanel.GAME_WIDTH / ChessBoardPanel.GAME_HEIGHT
    ) {
      return screenWidth / ChessBoardPanel.GAME_WIDTH;
    } else {
      return screenHeight / ChessBoardPanel.GAME_HEIGHT;
    }
  }

  getSquareFromCoordinates(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const relX = x - rect.left;
    const relY = y - rect.top;
    const col = Math.floor(relX / this.squareSize);
    const row = Math.floor(relY / this.squareSize);
    return { row, col };
  }

  getPiecePosition(row, col) {
    return {
      x: col * this.squareSize,
      y: row * this.squareSize,
    };
  }
}

export default ChessBoardPanel;
