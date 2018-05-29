/**
 * Class to represent meta information of a cell
 */
class CellMeta {

    constructor() {
        this.id; //id
        this.ports = [];
        this.kind; //kind of element, e.g. container or element
        this.specification; //specification
        this.class; //class of the node
    }
}

/**
 * Class to represent meta information of a port
 */
class PortMeta {

    constructor() {
        this.id; //
        this.iokind;   //input or output I/O
        this.position; //position: T,R,B,L
        this.label;    //label of the port
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
}