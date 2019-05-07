import anime from "./anime.es.js";
import Player from "./Player.js";
import Cell from "./Cell.js";
const CELL_SIZE = 36;
const MOVING_BALL_RENDERING_DURATION = 40;
const COLOR_WALL = "black";
const COLOR_NOT_PASSED_CELL = "white";
const COLOR_PASSED_CELL = "green";

class App {
  table = document.querySelector("table");
  player = new Player();
  field = [];
  maxWidth = 0;
  maxHeight = 0;

  // ボールが動いている間、onkeydownイベントを発生させないよう監視する
  _isMovingBall = false;
  // ボールが通過したマスを順番に塗っていくため記録する
  _passedCells = [];

  async init() {
    await this._loadField();
    this._render();
    this._onKeyDown();
  }

  _loadField() {
    return new Promise((resolve, reject) => {
      // ステージ情報を読み込み
      fetch("/static/json/preset.json")
        .then(response => response.json())
        .then(json => {
          const { width, height, playerX, playerY, field } = json;
          this.maxWidth = width;
          this.maxHeight = height;
          this.player.x = playerX;
          this.player.y = playerY;
          this.player.element.style.top = `${CELL_SIZE * this.player.y}px`;
          this.player.element.style.left = `${CELL_SIZE * this.player.x}px`;
          this._createField();
          for (let i = 0; i < this.maxHeight; i++) {
            for (let j = 0; j < this.maxWidth; j++) {
              this.field[i][j].state = field[i][j];
            }
          }
          resolve();
        });
    });
  }

  _createField() {
    // テーブルつくる
    for (let i = 0; i < this.maxHeight; i++) {
      const tr = document.createElement("tr");
      this.field[i] = [];
      for (let j = 0; j < this.maxWidth; j++) {
        const td = document.createElement("td");
        this.field[i][j] = new Cell(td);
        tr.appendChild(td);
      }
      this.table.appendChild(tr);
    }
  }

  _render() {
    if (this._isMovingBall) {
      this._renderFieldInOrder();
    } else {
      this._renderFieldInAll();
    }
    this._renderBall();
    this._passedCells.length = 0;
  }

  _renderFieldInAll() {
    for (let i = 0; i < this.maxHeight; i++) {
      for (let j = 0; j < this.maxWidth; j++) {
        const { state, element } = this.field[i][j];
        switch (state) {
          case 0:
            // 壁
            element.style.backgroundColor = COLOR_WALL;
            break;
          case 1:
            // まだ通っていない道
            element.style.backgroundColor = COLOR_NOT_PASSED_CELL;
            break;
          case 2:
            // すでに通った道
            element.style.backgroundColor = COLOR_PASSED_CELL;
            break;
          default:
            break;
        }
      }
    }
  }

  _renderFieldInOrder() {
    if (!this._passedCells.length) {
      return;
    }
    const duration = MOVING_BALL_RENDERING_DURATION;
    this._passedCells.forEach(({ element }, i) => {
      setTimeout(() => {
        element.style.backgroundColor = COLOR_PASSED_CELL;
      }, duration * i);
    });
  }

  _renderBall() {
    anime({
      targets: this.player.element,
      translateX: CELL_SIZE * (this.player.x - 1),
      translateY: CELL_SIZE * (this.player.y - 1),
      easing: "linear",
      duration: MOVING_BALL_RENDERING_DURATION * this._passedCells.length
    }).finished.then(() => {
      this._isMovingBall = false;
    });
  }

  _keydownMap = {
    // 左
    37: () => this._moveField(-1, 0),
    // 上
    38: () => this._moveField(0, -1),
    // 右
    39: () => this._moveField(1, 0),
    // 下
    40: () => this._moveField(0, 1)
  };

  _onKeyDown() {
    document.body.addEventListener("keydown", e => {
      if (!this._keydownMap.hasOwnProperty(e.keyCode) || this._isMovingBall) {
        return;
      }
      this._isMovingBall = true;
      this._keydownMap[e.keyCode]();
      this._render();
    });
  }

  _moveField(addX, addY) {
    while (true) {
      if (this.field[this.player.y + addY][this.player.x + addX].state === 0) {
        break;
      }
      this.field[this.player.y + addY][this.player.x + addX].state = 2;
      this._passedCells.push(
        this.field[this.player.y + addY][this.player.x + addX]
      );
      this.player.x += addX;
      this.player.y += addY;
    }

    if (this._isFinished()) {
      setTimeout(() => {
        alert("クリア!");
      }, MOVING_BALL_RENDERING_DURATION * this._passedCells.length);
    }
  }

  _isFinished() {
    for (let i = 0; i < this.maxHeight; i++) {
      for (let j = 0; j < this.maxWidth; j++) {
        if (this.field[i][j].state === 1) {
          return false;
        }
      }
    }
    return true;
  }
}

const app = new App();
app.init();
