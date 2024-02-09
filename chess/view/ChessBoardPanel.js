import ChessBoard from "../model/board/ChessBoard.js";
import EventHandlers from "../utils/EventHandlers.js";
import ImageLoader from "../utils/ImageLoader.js";
import ChessBoardHighlighter from "./ChessBoardHighlighter.js";
import PromotionSelector from "./PromotionSelector.js";

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

    this.imageLoader = new ImageLoader();
    this.promotionSelector = new PromotionSelector(
      this.drawBoard.bind(this),
      this.boardContainer,
      this.imageLoader
    );

    this.squareSize = 0;
    this.setScreen = this.setScreen.bind(this);

    this.boardHighlighter = new ChessBoardHighlighter(
      this.board,
      this.ctx,
      this.offscreenCanvas,
      this.offscreenCtx,
      this.imageLoader
    );
    this.imageLoader.loadPieceImages().then(() => {
      this.setScreen();
    });
  }

  init(guiController) {
    this.guiController = guiController;
    this.eventHandlers = new EventHandlers(
      this.clearHighlights.bind(this),
      this.clearSquareOnCanvas.bind(this),
      this.drawGhostPieceOnCanvas.bind(this),
      this.guiController,
      this.imageLoader,
      this.canvas,
      this.board
    );
    this.setupEventListeners();
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
          this.boardHighlighter.drawRankFileLabels(row, col);
        }
      }
    }

    this.drawPieces();
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);

    if (this.boardHighlighter.previousMove) {
      this.boardHighlighter.drawPreviousMoveHighlightedSquares(
        this.boardHighlighter.previousMove
      );
    }
    if (this.boardHighlighter.listOfMovesToHighlight.length > 0) {
      this.boardHighlighter.drawHighlightedSquares(
        this.boardHighlighter.listOfMovesToHighlight
      );
    }
    if (this.boardHighlighter.kingCheckHighlightedSquare) {
      this.boardHighlighter.drawKingCheckHighlight(
        this.boardHighlighter.kingCheckHighlightedSquare.row,
        this.boardHighlighter.kingCheckHighlightedSquare.col
      );
    }
  }

  drawPieces() {
    for (let row = 0; row < ChessBoard.ROW_LENGTH; row++) {
      for (let col = 0; col < ChessBoard.COLUMN_LENGTH; col++) {
        const piece = this.board.getPieceAt(row, col);
        if (piece && !this.shouldSkipDrawingPiece(row, col)) {
          const image = this.imageLoader.getPieceImage(piece);
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

  drawGhostPieceOnCanvas(piece, x, y) {
    const image = this.imageLoader.getPieceImage(piece);
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

  shouldSkipDrawingPiece(row, col) {
    if (this.promotionSelector.activePromotionSelector) {
      const { startSquare, endSquare, selectorSquares } =
        this.promotionSelector.activePromotionSelector;
      if (
        (startSquare.getRow() === row && startSquare.getCol() === col) ||
        (endSquare.getRow() === row && endSquare.getCol() === col) ||
        selectorSquares.some((sq) => sq.row === row && sq.col === col)
      ) {
        return true;
      }
    }
    return false;
  }

  showPromotionSelector(move, callback) {
    this.promotionSelector.createPromotionSelector(
      move,
      callback,
      this.squareSize
    );
  }

  drawHighlightedSquares(moves) {
    this.boardHighlighter.listOfMovesToHighlight = moves;
  }

  drawPreviousMoveHighlightedSquares(move) {
    this.boardHighlighter.previousMove = move;
  }

  drawKingCheckHighlightedSquare(square) {
    const row = square.getRow();
    const col = square.getCol();
    this.boardHighlighter.kingCheckHighlightedSquare = { row, col };
  }

  clearHighlights() {
    this.boardHighlighter.clearHighlights();
  }

  clearPreviousMoveHighlights() {
    this.boardHighlighter.clearPreviousMoveHighlights();
  }

  clearKingCheckHighlightedSquare(square) {
    this.boardHighlighter.redrawSquare(square.getRow(), square.getCol());
    this.boardHighlighter.kingCheckHighlightedSquare = null;
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

  setScreen() {
    const size = Math.min(
      this.boardContainer.offsetWidth,
      this.boardContainer.offsetHeight
    );

    this.canvas.width = size;
    this.canvas.height = size;

    this.squareSize = size / 8;

    this.offscreenCanvas.width = size;
    this.offscreenCanvas.height = size;

    this.reorderSidebarBasedOnScreenWidth();
    this.updatePromotionSelector();
    this.updateSquareSize();
  }

  updatePromotionSelector() {
    if (this.promotionSelector.activePromotionSelector) {
      const { selector, move } = this.promotionSelector.activePromotionSelector;
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
  }

  onPreviousMoveButtonClick() {
    this.guiController.handlePreviousMoveButtonClick();
    this.clearHighlights();
  }

  onNextMoveButtonClick() {
    this.guiController.handleNextMoveButtonClick();
  }

  onImportFromFENButtonClick() {
    this.toggleFENInput();
  }

  toggleFENInput() {
    const fenImportContainer = document.getElementById("fen-import-container");
    fenImportContainer.style.display =
      fenImportContainer.style.display === "none" ? "block" : "none";
  }

  onSubmitFENButtonClick() {
    const fenInput = document.getElementById("fen-input");
    const fenString = fenInput.value;
    if (fenString) {
      this.guiController.handleFENImport(fenString);
    }
    fenInput.value = "";
    this.toggleFENInput();
  }

  writeCurrentFENString(fenString) {
    const fenBox = document.getElementById("fen-box");
    fenBox.value = fenString;
  }

  reorderSidebarBasedOnScreenWidth() {
    const screenWidth = window.innerWidth;
    const chessboardWrapper = document.querySelector(".chessboard-wrapper");
    const sidebar = document.getElementById("sidebar");
    const textAreasContainer = document.getElementById("text-areas-container");

    const isSidebarInside = sidebar.parentNode === chessboardWrapper;

    if (screenWidth <= 1010 && !isSidebarInside) {
      chessboardWrapper.insertBefore(sidebar, textAreasContainer);
    } else if (screenWidth > 1010 && isSidebarInside) {
      document.getElementById("game-container").appendChild(sidebar);
    }
  }

  setupEventListeners() {
    this.canvas.addEventListener(
      "mousedown",
      this.eventHandlers.onMouseDown.bind(this.eventHandlers)
    );
    this.canvas.addEventListener(
      "mousemove",
      this.eventHandlers.onMouseMove.bind(this.eventHandlers)
    );
    this.canvas.addEventListener(
      "mouseup",
      this.eventHandlers.onMouseUp.bind(this.eventHandlers)
    );

    const previousMoveButton = document.getElementById("prev-move");
    const nextMoveButton = document.getElementById("next-move");
    const importFromFENButton = document.getElementById("import-from-fen");
    const submitFENButton = document.getElementById("submit-fen");

    previousMoveButton.addEventListener("click", () => {
      this.onPreviousMoveButtonClick();
    });
    nextMoveButton.addEventListener("click", () => {
      this.onNextMoveButtonClick();
    });
    importFromFENButton.addEventListener("click", () => {
      this.onImportFromFENButtonClick();
    });
    submitFENButton.addEventListener("click", () => {
      this.onSubmitFENButtonClick();
    });

    if (screen.orientation) {
      screen.orientation.addEventListener("change", () => {
        this.setScreen().bind(this);
      });
    }
    window.addEventListener("resize", this.debounce(this.setScreen, 50));
  }

  updateSquareSize() {
    this.squareSize = this.canvas.width / 8;
    if (this.boardHighlighter) {
      this.boardHighlighter.updateSquareSize(this.squareSize);
    }
    if (this.eventHandlers) {
      this.eventHandlers.updateSquareSize(this.squareSize);
    }
    if (this.promotionSelector) {
      this.promotionSelector.updateSquareSize(this.squareSize);
    }
    this.drawBoard();
  }

  debounce(func, wait, immediate) {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
}

export default ChessBoardPanel;
