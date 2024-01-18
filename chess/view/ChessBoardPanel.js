import ChessBoard from "../model/board/ChessBoard.js";

class ChessBoardPanel {
  static GAME_WIDTH = 600;
  static GAME_HEIGHT = 600;
  static lightSquareColor = "rgb(248 240 198)";
  static darkSquareColor = "rgb(156 98 69)";

  constructor(board) {
    this.board = board;
    this.canvas = document.getElementById("chessboard");
    this.ctx = this.canvas.getContext("2d");
    this.boardContainer = document.getElementById("chessboard-container");
    this.squareSize = this.canvas.width / 8;
    this.pieceImages = {};
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
    this.ctx.font = `bold ${fontSize}px Roboto`;
    this.ctx.textBaseline = "top";

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        this.ctx.fillStyle =
          (row + col) % 2 === 0
            ? ChessBoardPanel.lightSquareColor
            : ChessBoardPanel.darkSquareColor;
        this.ctx.fillRect(
          col * this.squareSize,
          row * this.squareSize,
          this.squareSize,
          this.squareSize
        );

        // Column labels
        if (row === 7) {
          this.ctx.fillStyle =
            col % 2 === 1
              ? ChessBoardPanel.darkSquareColor
              : ChessBoardPanel.lightSquareColor;
          this.ctx.fillText(
            colLabels[col],
            col * this.squareSize + fontSize * 0.3,
            (row + 1) * this.squareSize - fontSize * 1
          );
        }

        // Row labels
        if (col === 7) {
          this.ctx.fillStyle =
            row % 2 === 1
              ? ChessBoardPanel.darkSquareColor
              : ChessBoardPanel.lightSquareColor;
          const labelWidth = this.ctx.measureText(rowLabels[row]).width;
          this.ctx.fillText(
            rowLabels[row],
            (col + 1) * this.squareSize - labelWidth - fontSize * 0.3,
            row * this.squareSize + fontSize * 0.3
          );
        }
      }
    }

    this.drawPieces();
  }

  drawPieces() {
    for (let row = 0; row < ChessBoard.ROW_LENGTH; row++) {
      for (let col = 0; col < ChessBoard.COLUMN_LENGTH; col++) {
        const piece = this.board.getPieceAt(row, col);
        if (piece) {
          const pieceName = this.getPieceImageName(piece);
          const image = this.pieceImages[pieceName];
          if (image) {
            this.ctx.drawImage(
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

        square.addEventListener("click", (event) =>
          this.guiController.handleSquareClick(event, row, col)
        );

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

  setScreen() {
    const scaleRatio = this.getScaleRatio();
    this.canvas.width = ChessBoardPanel.GAME_WIDTH * scaleRatio;
    this.canvas.height = ChessBoardPanel.GAME_HEIGHT * scaleRatio;
    this.squareSize = this.canvas.width / 8;
    this.drawBoard();
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
}

export default ChessBoardPanel;
