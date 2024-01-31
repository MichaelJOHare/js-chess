import ChessBoard from "../model/board/ChessBoard.js";
import EnPassantMove from "../model/moves/EnPassantMove.js";

class ChessBoardPanel {
  static GAME_WIDTH = 600;
  static GAME_HEIGHT = 600;
  static DRAG_DELTA = 6;
  static LIGHT_SQUARE_COLOR = "rgb(248 240 198)";
  static DARK_SQUARE_COLOR = "rgb(156 98 69)";
  static LIGHT_SQUARE_HIGHLIGHT_COLOR = "rgb(127 158 92)";
  static DARK_SQUARE_HIGHLIGHT_COLOR = "rgb(123 138 50)";
  static LIGHT_SQUARE_SELECTED_PIECE = "rgb(222 117 71)";
  static DARK_SQUARE_SELECTED_PIECE = "rgb(145 56 17)";
  static LIGHT_SQUARE_PREVIOUS_MOVE = "rgb(205 210 106)";
  static DARK_SQUARE_PREVIOUS_MOVE = "rgb(170 162 58)";

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
    this.previousMove = null;
    this.previousMoveHighlightedSquares = [];

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

    this.isDragging = false;
    this.originalSquare = null;
    this.draggingPiece = null;
    this.startX = 0;
    this.startY = 0;
    this.draggingOffsetX = 0;
    this.draggingOffsetY = 0;
  }

  init(guiController) {
    this.guiController = guiController;
    this.drawBoard();
  }

  drawBoard() {
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
        if (row === 7 || col === 7) {
          this.drawRankFileLabels(row, col);
        }
      }
    }

    this.drawPieces();
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    if (this.previousMove) {
      this.drawPreviousMoveHighlightedSquares(this.previousMove);
    }
    if (this.listOfMovesToHighlight.length > 0) {
      this.drawHighlightedSquares(this.listOfMovesToHighlight);
    }
  }

  drawRankFileLabels(row, col) {
    const rowLabels = "87654321";
    const colLabels = "abcdefgh";
    const fontSize = this.squareSize / 6;
    this.offscreenCtx.font = `bold ${fontSize}px Roboto`;
    this.offscreenCtx.textBaseline = "top";

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
      const labelWidth = this.offscreenCtx.measureText(rowLabels[row]).width;
      this.offscreenCtx.fillText(
        rowLabels[row],
        (col + 1) * this.squareSize - labelWidth - fontSize * 0.3,
        row * this.squareSize + fontSize * 0.3
      );
    }
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

  drawGhostPieceOnOffscreenCanvas(piece, x, y) {
    const pieceName = this.getPieceImageName(piece);
    const image = this.pieceImages[pieceName];
    if (image) {
      this.offscreenCtx.save();
      this.offscreenCtx.globalAlpha = 0.5;
      this.offscreenCtx.drawImage(
        image,
        x,
        y,
        this.squareSize * 0.96,
        this.squareSize * 0.96
      );
      this.offscreenCtx.restore();
    }
  }

  drawPieceOnOffscreenCanvas(piece, x, y) {
    const pieceName = this.getPieceImageName(piece);
    const image = this.pieceImages[pieceName];
    if (image) {
      this.offscreenCtx.drawImage(
        image,
        x,
        y,
        this.squareSize * 0.96,
        this.squareSize * 0.96
      );
    }
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
      this.draggingPiece = piece;
      const piecePosition = this.getPiecePosition(row, col);
      this.draggingOffsetX = event.clientX - piecePosition.x;
      this.draggingOffsetY = event.clientY - piecePosition.y;
      this.originalSquare = { row, col };
    }

    this.isDragging = false;
  }

  onMouseMove(event) {
    if (this.draggingPiece) {
      const currentX = event.clientX;
      const currentY = event.clientY;
      const diffX = Math.abs(currentX - this.startX);
      const diffY = Math.abs(currentY - this.startY);

      if (
        diffX > ChessBoardPanel.DRAG_DELTA ||
        diffY > ChessBoardPanel.DRAG_DELTA
      ) {
        this.isDragging = true;
      }

      if (this.isDragging) {
        const x = currentX - this.draggingOffsetX;
        const y = currentY - this.draggingOffsetY;
        this.guiController.handleDragStart(
          this.draggingPiece.getCurrentSquare().getRow(),
          this.draggingPiece.getCurrentSquare().getCol()
        );
        this.clearSquareOnOffscreenCanvas(
          this.originalSquare.col * this.squareSize,
          this.originalSquare.row * this.squareSize
        );
        this.drawGhostPieceOnOffscreenCanvas(
          this.draggingPiece,
          this.originalSquare.col * this.squareSize,
          this.originalSquare.row * this.squareSize
        );
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
        this.drawPiece(this.draggingPiece, x, y);
      }
    }
  }

  onMouseUp(event) {
    this.clearHighlights();

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
  }

  showPromotionSelector(piece, callback) {
    const promotionPieces = ["Queen", "Rook", "Bishop", "Knight"];
    const color = piece.getPlayer().getColor().toLowerCase();
    const colorCapitalized = color.charAt(0).toUpperCase() + color.slice(1);
    const selector = document.createElement("div");
    selector.className = "promotion-selector";
    selector.style.position = "absolute";
    selector.style.left = `${this.canvas.offsetLeft}px`;
    selector.style.top = `${this.canvas.offsetTop}px`;
    //Make dynamic
    selector.style.width = `${this.squareSize}px`;
    selector.style.height = `${this.squareSize * promotionPieces.length}px`;
    selector.style.zIndex = 100;
    selector.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    selector.style.padding = "0";
    selector.style.margin = "0";
    selector.style.lineHeight = "0";
    selector.style.boxSizing = "border-box";

    promotionPieces.forEach((type) => {
      const pieceName = `${colorCapitalized}_${type}`;
      const image = this.pieceImages[pieceName];
      if (image) {
        const img = document.createElement("img");
        img.src = image.src;
        img.style.width = "100%";
        img.style.height = `${this.squareSize}px`;
        img.style.padding = "0";
        img.style.margin = "0";
        img.style.display = "block";
        img.addEventListener("click", () => {
          console.log(`Promotion piece selected: ${type}`);
          callback(type.toUpperCase());
          selector.remove();
        });
        selector.appendChild(img);
      }
    });

    this.boardContainer.appendChild(selector);
  }

  getPieceImageName(piece) {
    if (!piece) {
      return;
    }
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

  drawHighlightedSquares(moves) {
    this.listOfMovesToHighlight = moves;
    this.highlightedSquares = [];

    const startSquare = moves[0].getStartSquare();
    this.highlightedSquares.push(startSquare);

    this.clearSquareOnOffscreenCanvas(
      startSquare.getRow(),
      startSquare.getCol()
    );
    this.drawSelectedPieceHighlightedSquares(
      startSquare.getRow(),
      startSquare.getCol()
    );
    this.drawPieceOnOffscreenCanvas(
      this.board.getPieceAt(startSquare.getRow(), startSquare.getCol()),
      startSquare.getCol() * this.squareSize,
      startSquare.getRow() * this.squareSize
    );

    moves.forEach((move) => {
      const endSquare = move.getEndSquare();
      this.highlightedSquares.push(endSquare);
      const row = endSquare.getRow();
      const col = endSquare.getCol();

      let highlightColor =
        (row + col) % 2 === 0
          ? ChessBoardPanel.LIGHT_SQUARE_HIGHLIGHT_COLOR
          : ChessBoardPanel.DARK_SQUARE_HIGHLIGHT_COLOR;

      if (
        this.board.isOccupiedByOpponent(
          row,
          col,
          move.getPiece().getPlayer()
        ) ||
        move instanceof EnPassantMove
      ) {
        this.drawCornerHighlights(row, col);
      } else {
        this.drawDotHighlight(row, col, highlightColor);
      }
      if (row === 7 || col === 7) {
        this.drawRankFileLabels(row, col);
      }
    });
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  drawPreviousMoveHighlightedSquares(move) {
    if (!move) {
      return;
    }

    this.previousMove = move;
    const squares = [move.getStartSquare(), move.getEndSquare()];
    squares.forEach((square) => {
      this.previousMoveHighlightedSquares.push(square);
      const row = square.getRow();
      const col = square.getCol();

      this.offscreenCtx.fillStyle =
        (row + col) % 2 === 0
          ? ChessBoardPanel.LIGHT_SQUARE_PREVIOUS_MOVE
          : ChessBoardPanel.DARK_SQUARE_PREVIOUS_MOVE;

      this.offscreenCtx.fillRect(
        col * this.squareSize,
        row * this.squareSize,
        this.squareSize,
        this.squareSize
      );
      if (row === 7 || col === 7) {
        this.drawRankFileLabels(row, col);
      }
    });
    this.drawPieceOnOffscreenCanvas(
      move.getPiece(),
      move.getEndSquare().getCol() * this.squareSize,
      move.getEndSquare().getRow() * this.squareSize
    );
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  drawSelectedPieceHighlightedSquares(row, col) {
    this.offscreenCtx.fillStyle =
      (row + col) % 2 === 0
        ? ChessBoardPanel.LIGHT_SQUARE_SELECTED_PIECE
        : ChessBoardPanel.DARK_SQUARE_SELECTED_PIECE;
    this.offscreenCtx.fillRect(
      col * this.squareSize,
      row * this.squareSize,
      this.squareSize,
      this.squareSize
    );
    if (row === 7 || col === 7) {
      this.drawRankFileLabels(row, col);
    }
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

  drawCornerHighlights(row, col) {
    this.clearSquareOnOffscreenCanvas(row, col);

    // Draw the square with the highlight color
    this.offscreenCtx.fillStyle =
      (row + col) % 2 === 0
        ? ChessBoardPanel.LIGHT_SQUARE_HIGHLIGHT_COLOR
        : ChessBoardPanel.DARK_SQUARE_HIGHLIGHT_COLOR;
    this.offscreenCtx.fillRect(
      col * this.squareSize,
      row * this.squareSize,
      this.squareSize,
      this.squareSize
    );

    this.offscreenCtx.save();
    this.offscreenCtx.beginPath();
    this.offscreenCtx.rect(
      col * this.squareSize,
      row * this.squareSize,
      this.squareSize,
      this.squareSize
    );
    this.offscreenCtx.clip();

    const radius = this.squareSize * 0.58;
    const centerX = (col + 0.5) * this.squareSize;
    const centerY = (row + 0.5) * this.squareSize;
    this.offscreenCtx.beginPath();
    this.offscreenCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    this.offscreenCtx.fillStyle =
      (row + col) % 2 === 0
        ? ChessBoardPanel.LIGHT_SQUARE_COLOR
        : ChessBoardPanel.DARK_SQUARE_COLOR;

    this.offscreenCtx.fill();
    this.offscreenCtx.restore();

    const piece = this.board.getPieceAt(row, col);
    if (piece) {
      this.drawPieceOnOffscreenCanvas(
        piece,
        col * this.squareSize,
        row * this.squareSize
      );
    }
  }

  clearHighlights() {
    this.highlightedSquares.forEach((square) => {
      this.redrawSquare(square.getRow(), square.getCol());
    });
    this.highlightedSquares = [];
    this.listOfMovesToHighlight = [];
  }

  clearPreviousMoveHighlights() {
    this.previousMoveHighlightedSquares.forEach((square) => {
      this.redrawSquare(square.getRow(), square.getCol());
    });
    this.previousMoveHighlightedSquares = [];
    this.previousMove = null;
  }

  clearSquareOnOffscreenCanvas(row, col) {
    this.offscreenCtx.clearRect(
      col * this.squareSize,
      row * this.squareSize,
      this.squareSize,
      this.squareSize
    );
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
      this.drawPieceOnOffscreenCanvas(
        piece,
        col * this.squareSize,
        row * this.squareSize
      );
    }
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
