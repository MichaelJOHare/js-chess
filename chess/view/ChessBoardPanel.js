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
    this.draggingDiv = document.createElement("div");
    this.draggingDiv.style.position = "absolute";
    this.draggingDiv.style.visibility = "hidden";
    this.draggingDiv.style.zIndex = "2";
    this.draggingDiv.style.pointerEvents = "none";
    this.boardContainer.appendChild(this.draggingDiv);

    this.squareSize = this.canvas.width / 8;
    this.activePromotionSelector = null;
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
        if (piece && !this.shouldSkipDrawingPiece(row, col)) {
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

  drawGhostPieceOnCanvas(piece, x, y) {
    const pieceName = this.getPieceImageName(piece);
    const image = this.pieceImages[pieceName];
    if (image) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.5;
      this.ctx.drawImage(
        image,
        x,
        y,
        this.squareSize * 0.96,
        this.squareSize * 0.96
      );
      this.ctx.restore();
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

  shouldSkipDrawingPiece(row, col) {
    if (this.activePromotionSelector) {
      const { startSquare, endSquare, selectorSquares } =
        this.activePromotionSelector;
      if (
        (startSquare.row === row && startSquare.col === col) ||
        (endSquare.row === row && endSquare.col === col) ||
        selectorSquares.some((sq) => sq.row === row && sq.col === col)
      ) {
        return true;
      }
    }
    return false;
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
      const pieceName = this.getPieceImageName(piece);
      const image = this.pieceImages[pieceName];

      this.draggingDiv.innerHTML = `<img src="${image.src}" width="${this.squareSize}" height="${this.squareSize}">`;
      this.draggingDiv.style.left = `${event.clientX - this.squareSize / 2}px`;
      this.draggingDiv.style.top = `${event.clientY - this.squareSize / 2}px`;
      this.draggingDiv.style.visibility = "visible";

      this.draggingPiece = piece;
      this.originalSquare = { row, col };
      this.isDragging = false;
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
    if (this.isDragging) {
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
  }

  showPromotionSelector(move, callback) {
    let promotionPieces = ["Queen", "Rook", "Bishop", "Knight"];
    const pawnPosition = move.getEndSquare();
    const pawnRow = pawnPosition.getRow();
    const pawnCol = pawnPosition.getCol();
    const color = move.piece.getPlayer().getColor().toLowerCase();
    const colorCapitalized = color.charAt(0).toUpperCase() + color.slice(1);
    const selector = document.createElement("div");
    const selectorHeight = this.squareSize * promotionPieces.length;
    selector.className = "promotion-selector";
    selector.style.position = "absolute";

    this.activePromotionSelector = {
      selector: selector,
      move: move,
      startSquare: move.getStartSquare(),
      endSquare: move.getEndSquare(),
      selectorSquares: this.calculateSelectorSquares(
        move.getEndSquare(),
        color
      ),
    };

    if (color === "black") {
      promotionPieces = promotionPieces.reverse();
    }

    if (pawnRow === 0) {
      // Might change to 0 since always = 0 but may not if board is flipped when that is implemented
      selector.style.top = `${pawnRow * this.squareSize}px`;
    } else if (pawnRow === 7) {
      selector.style.top = `${
        (pawnRow + 1) * this.squareSize - selectorHeight
      }px`;
    }
    selector.style.left = `${pawnCol * this.squareSize}px`;

    selector.style.width = `${this.squareSize}px`;
    selector.style.height = `${this.squareSize * promotionPieces.length}px`;
    selector.style.zIndex = "3";
    selector.style.padding = "0";
    selector.style.margin = "0";
    selector.style.lineHeight = "0";
    selector.style.boxSizing = "border-box";

    // Shade the entire chessboard
    const boardOverlay = document.createElement("div");
    boardOverlay.className = "board-overlay";
    boardOverlay.style.position = "absolute";
    boardOverlay.style.left = "0";
    boardOverlay.style.top = "0";
    boardOverlay.style.width = "100%";
    boardOverlay.style.height = "100%";
    boardOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    boardOverlay.style.zIndex = "2";
    this.boardContainer.appendChild(boardOverlay);

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
          callback(type.toUpperCase());
          boardOverlay.remove();
          this.removePromotionSelector();
        });
        selector.appendChild(img);
      }
    });

    this.boardContainer.appendChild(selector);
  }

  calculateSelectorSquares(endSquare, color) {
    const squares = [];
    const startRow =
      color === "white" ? endSquare.getRow() : endSquare.getRow() - 3;

    for (let i = 0; i < 4; i++) {
      const row = startRow + (color === "white" ? i : -i);
      const col = endSquare.getCol();
      squares.push({ row, col });
    }

    return squares;
  }

  removePromotionSelector() {
    if (this.activePromotionSelector) {
      this.activePromotionSelector.selector.remove();
      this.activePromotionSelector = null;

      this.drawBoard();
    }
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

  clearSquareOnCanvas(row, col) {
    const x = row * this.squareSize;
    const y = col * this.squareSize;
    this.ctx.clearRect(x, y, this.squareSize, this.squareSize);
    this.ctx.fillStyle =
      (row + col) % 2 === 0
        ? ChessBoardPanel.LIGHT_SQUARE_SELECTED_PIECE
        : ChessBoardPanel.DARK_SQUARE_SELECTED_PIECE;
    this.ctx.fillRect(
      row * this.squareSize,
      col * this.squareSize,
      this.squareSize,
      this.squareSize
    );
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

    this.boardContainer.style.width = `${
      ChessBoardPanel.GAME_WIDTH * scaleRatio
    }px`;
    this.boardContainer.style.height = `${
      ChessBoardPanel.GAME_HEIGHT * scaleRatio
    }px`;

    this.squareSize = this.canvas.width / 8;

    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;

    if (this.activePromotionSelector) {
      const { selector, move } = this.activePromotionSelector;
      const pawnPosition = move.getEndSquare();
      const pawnRow = pawnPosition.getRow();
      const pawnCol = pawnPosition.getCol();

      selector.style.top = `${pawnRow * this.squareSize}px`;
      selector.style.left = `${pawnCol * this.squareSize}px`;
      selector.style.width = `${this.squareSize}px`;
      selector.style.height = `${this.squareSize * 4}px`;
      Array.from(selector.children).forEach((img) => {
        img.style.height = `${this.squareSize}px`;
      });
    }

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
}

export default ChessBoardPanel;
