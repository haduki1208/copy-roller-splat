// roller splat
class Player {
    x = 0;
    y = 0;
    element = document.querySelector('#player');
}

class Manager {
    TABLE = document.querySelector('table');
    MAX_WIDTH = 9;
    MAX_HEIGHT = 10;
    player = new Player();
    field = [];

    constructor() {
        this.initTable();
        this.loadTable();
        this.render();
        this.onKeyDown();
    }

    initTable() {
        // テーブルつくる
        for (let i = 0; i < this.MAX_HEIGHT; i++) {
            const tr = document.createElement('tr');
            this.field[i] = [];
            for (let j = 0; j < this.MAX_WIDTH; j++) {
                const td = document.createElement('td');
                this.field[i][j] = {
                    state: 0,
                    element: td,
                };
                tr.appendChild(td);
            }
            this.TABLE.appendChild(tr);
        }
    }

    loadTable() {
        // ステージ情報を読み込み
        this.player.x = 1;
        this.player.y = 1;
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
        for (let i = 0; i < this.MAX_HEIGHT; i++) {
            for (let j = 0; j < this.MAX_WIDTH; j++) {
                this.field[i][j].state = preset[i][j];
            }
        }
    }

    render() {
        for (let i = 0; i < this.MAX_HEIGHT; i++) {
            for (let j = 0; j < this.MAX_WIDTH; j++) {
                const { state, element } = this.field[i][j];
                switch (state) {
                    case 0:
                        // 壁
                        element.style.backgroundColor = 'black';
                        break;
                    case 1:
                        // まだ通っていない道
                        element.style.backgroundColor = 'white';
                        break;
                    case 2:
                        // すでに通った道
                        element.style.backgroundColor = 'green';
                        break;
                    default:
                        break;
                }
            }
        }
        this.player.element.style.top = `${this.player.y * 36}px`;
        this.player.element.style.left = `${this.player.x * 36}px`;
    }

    onKeyDown() {
        document.body.addEventListener('keydown', e => {
            switch (e.keyCode) {
                case 37:
                    // left
                    this.__moveField(-1, 0);
                    break;
                case 38:
                    // up
                    this.__moveField(0, -1);
                    break;
                case 39:
                    // right
                    this.__moveField(1, 0);
                    break;
                case 40:
                    // down
                    this.__moveField(0, 1);
                    break;
                default:
                    break;
            }
            this.render();
            if (this.__isFinished()) {
                setTimeout(() => alert('クリア!'), 0);
            }
        });
    }

    __moveField(addX = 0, addY = 0) {
        while (true) {
            if (this.field[this.player.y + addY][this.player.x + addX].state === 0) {
                return;
            }
            this.field[this.player.y + addY][this.player.x + addX].state = 2;
            this.player.x += addX;
            this.player.y += addY;
        }
    }

    __isFinished() {
        for (let i = 0; i < this.MAX_HEIGHT; i++) {
            for (let j = 0; j < this.MAX_WIDTH; j++) {
                if (this.field[i][j].state === 1) {
                    return false;
                }
            }
        }
        return true;
    }
}
const manager = new Manager();