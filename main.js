// roller splat
const CELL_SIZE = 36;
const MAX_WIDTH = 9;
const MAX_HEIGHT = 10;
const MOVING_BALL_RENDER_DURATION = 200;
const COLOR_WALL = 'black';
const COLOR_NOT_PASSED_CELL = 'white';
const COLOR_PASSED_CELL = 'green';

class Player {
    x = 0;
    y = 0;
    element = document.querySelector('#player');
}

class Cell {
    state = 0;
    constructor(element) {
        this.element = element;
    }
}

class Manager {
    table = document.querySelector('table');
    player = new Player();
    field = [];

    // ボールが動いている間、onkeydownイベントを発生させないよう監視する
    _isMovingBall = false;
    // ボールが通過したマスを順番に塗っていくため記録する
    _passedCells = [];

    constructor() {
        this.initField();
        this.loadField();
        this.render();
        this.onKeyDown();
    }

    initField() {
        // テーブルつくる
        for (let i = 0; i < MAX_HEIGHT; i++) {
            const tr = document.createElement('tr');
            this.field[i] = [];
            for (let j = 0; j < MAX_WIDTH; j++) {
                const td = document.createElement('td');
                this.field[i][j] = new Cell(td);
                tr.appendChild(td);
            }
            this.table.appendChild(tr);
        }
    }

    loadField() {
        // ステージ情報を読み込み
        this.player.x = 1;
        this.player.y = 1;
        this.player.element.style.top = `${CELL_SIZE * this.player.y}px`;
        this.player.element.style.left = `${CELL_SIZE * this.player.x}px`;
        const preset = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 1, 0, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 0, 1, 1, 0],
            [0, 1, 1, 1, 1, 0, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];
        for (let i = 0; i < MAX_HEIGHT; i++) {
            for (let j = 0; j < MAX_WIDTH; j++) {
                this.field[i][j].state = preset[i][j];
            }
        }
    }

    render() {
        if (this._isMovingBall) {
            this._renderFieldInOrder();
        } else {
            this._renderFieldInAll();
        }
        this._renderBall();
    }

    _renderFieldInAll() {
        for (let i = 0; i < MAX_HEIGHT; i++) {
            for (let j = 0; j < MAX_WIDTH; j++) {
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
        const duration = MOVING_BALL_RENDER_DURATION / this._passedCells.length;
        this._passedCells.forEach(({ element }, i) => {
            setTimeout(() => {
                element.style.backgroundColor = COLOR_PASSED_CELL;
            }, duration * i);
        });
        this._passedCells.length = 0;
    }

    _renderBall() {
        anime({
            targets: this.player.element,
            translateX: CELL_SIZE * (this.player.x - 1),
            translateY: CELL_SIZE * (this.player.y - 1),
            easing: 'easeInOutQuad',
            duration: MOVING_BALL_RENDER_DURATION,
        }).finished.then(() => {
            this._isMovingBall = false;
        })
    }

    _keydownMap = {
        // 左
        37: () => this._moveField(-1, 0),
        // 上
        38: () => this._moveField(0, -1),
        // 右
        39: () => this._moveField(1, 0),
        // 下
        40: () => this._moveField(0, 1),
    }

    onKeyDown() {
        document.body.addEventListener('keydown', e => {
            if (!this._keydownMap.hasOwnProperty(e.keyCode) || this._isMovingBall) {
                return;
            }
            this._isMovingBall = true;
            this._keydownMap[e.keyCode]();
            this.render();
            if (this._isFinished()) {
                // アラートを出したあと若干動いたので1.1倍して猶予をもたせる
                setTimeout(() => {
                    alert('クリア!');
                }, MOVING_BALL_RENDER_DURATION * 1.1);
            }
        });
    }

    _moveField(addX, addY) {
        while (true) {
            if (this.field[this.player.y + addY][this.player.x + addX].state === 0) {
                return;
            }
            this.field[this.player.y + addY][this.player.x + addX].state = 2;
            this._passedCells.push(this.field[this.player.y + addY][this.player.x + addX]);
            this.player.x += addX;
            this.player.y += addY;
        }
    }

    _isFinished() {
        for (let i = 0; i < MAX_HEIGHT; i++) {
            for (let j = 0; j < MAX_WIDTH; j++) {
                if (this.field[i][j].state === 1) {
                    return false;
                }
            }
        }
        return true;
    }
}
const manager = new Manager();