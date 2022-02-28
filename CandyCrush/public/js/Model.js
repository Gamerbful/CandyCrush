
import Event from './Event.js';

class Sweet {
    constructor() {
        this.type = Math.floor(Math.random() * 4);
    }
}


export default class Model {

    
    constructor() {
        this.drawEvent = new Event();
        this.grid = null;
    }

    initGrid(n, m) {
        this.grid = Array(n).fill();
        this.grid = this.grid.map((value, idx) => {
            let rows = Array(m).fill();
            rows = rows.map((value, idx) => {
                return new Sweet();
            });
            return rows;
        });
        this.drawEvent.trigger(this.grid);
        
    }


}