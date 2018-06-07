/**
 * Class to represent meta information of a cell
 */
class CellMeta {

    constructor() {
        this.id = null;            //id
        this.ports = [];           //
        this.kind = null;          //kind of element, e.g. container or element
        this.specification = null; //specification
        this.klass = null;         //class of the node
    }

    setClass(klass) {
        this.klass = klass;
    }
}


/**
 * Class to represent meta information of a port
 */
class PortMeta {

    constructor() {
        this.id = null;       //
        this.iokind = null;   //input or output I/O
        this.position = null; //position: T,R,B,L
        this.label = null;    //label of the port
    }

    setPosition(position) {
        this.position = position;
    }

    setIOKind(kind) {
        this.iokind = kind;
    }
}


/**
 * Class to represent meta information of a generic components
 */
class Meta {
    constructor() {
        this.id; //
        this.role; //role of the component, e.g. Label
    }

    setRole(role) {
        this.role = role;
    }
}