
var ae_data;


function exportAlloy(graph) {
    ae_data = {};
    var all = graph.getChildVertices(graph.getDefaultParent());
    all.forEach(c=> {
        exportAlloyRec(c);
        /*console.log("=");
        console.log(c);*/
    });
    console.log("--DONE--");
    console.log(ae_data);
    var src;
    src = "/* Automatically generated by the architectural editor\n  This is an experimental feature still under development\n*/\n\n"
    src += exportAlloyTxt();
    console.log(src);
    return src;
}

function exportAlloyRec(component) {
    console.log(component);
    if(component.meta) {
        var clss = component.meta.class;
        console.log("CLASS:: " + clss);
        if(!ae_data[clss] && clss) {
            ae_data[clss] = [];
        }
        if(clss) {
            ae_data[clss].push(component);
        }
    }

    if(component.children) {
        component.children.forEach(c=> {
            exportAlloyRec(c);
        });
    }
}

//TODO: ports
function exportAlloyTxt() {
    var src = "";
    Object.keys(ae_data).forEach(k=>{
        src += "one sig ";
        ae_data[k].forEach(e=> {
            parent = k;
            src += e.value+", ";
            console.log(e.meta.kind);
            console.log(e.meta.io);
        });
        src+=" extends "+k+"{}\n";
        if(k==="Leaf") {
            
        } else if(k==="Composite") {

        }

    });
    return src;
}


/**
 * Export the model to JSON
 * @param {*} editor 
 * @param {*} cell 
 */
function exportToJson(editor, cell) {
    //create the representation
    var json = {};

    //add meta information
    json.descriptor = {};
    json.descriptor.file_type="emdl";
    json.descriptor.version="2.0";
    json.descriptor.description="emucharts model";
    json.descriptor.chart_name="none";
    json.descriptor.serial=serial;

    //initialize chart variables
    json.chart = {};
    json.chart.states=[];
    json.chart.transitions=[];
    json.chart.initial_transitions=[];
    json.chart.variables=[];
    json.chart.constants=[];
    json.chart.datatypes=[];
    
    var model = _graph.getModel();

    Object.keys(model.cells).forEach(function (k) {
        if(model.cells[k].value && !model.cells[k].edge) {
            var tcell = model.cells[k];
            var s = {};
            s.id=tcell.id;
            if(tcell.parent && tcell.parent.meta && tcell.parent.meta.role && tcell.parent.meta.role==='port') {
                s.id = tcell.parent.id;
            }
            s.value=tcell.value;
            s.x = tcell.geometry.x;
            s.y = tcell.geometry.y;
            s.width = tcell.geometry.width;
            s.height = tcell.geometry.height;

            if(tcell.meta) {
                if(tcell.meta.specification) {
                    s.specification = tcell.meta.specification;
                }
                if(tcell.meta.iokind) {
                    s.iokind = tcell.meta.iokind;
                }
                if(tcell.meta.kind) {
                    s.kind = tcell.meta.kind;
                }
                if(tcell.meta.class) {
                    s.class = tcell.meta.class;
                }
                if(tcell.meta.direction) {
                    s.direction = tcell.meta.direction;
                }
            }

            //handle parent properties
            if(tcell.parent.meta) {
                if(tcell.parent.meta.position) {
                    s.position = tcell.parent.meta.position;
                }
                if(tcell.parent.meta && tcell.parent.meta.role) {
                    s.role = tcell.parent.meta.role;
                }

                if(tcell.parent.meta.role && tcell.parent.meta.role === 'port') {
                    //parent of port label is a rectangle with no value
                    s.parent=tcell.parent.parent.value;
                } else {
                    s.parent=tcell.parent.value;
                }

                if(tcell.parent.meta.position) {
                    s.position = tcell.parent.meta.position;
                }
                if(tcell.parent.meta.direction) {
                    s.direction = tcell.parent.meta.direction;
                }
            }
            
            //Check children
            if(tcell.children) {
                s.children=[];
                tcell.children.forEach(function (c) {
                    if(c.value) {
                        s.children.push(c.id);
                    }
                    if(c.meta && c.meta.role && c.meta.role==='port') {
                        s.children.push(c.id);
                    }
                });
            }
            
            json.chart.states.push(s);
        }

        //edges
        if(model.cells[k].edge) {
            var t = {};
            t.id = model.cells[k].id;
            t.name = model.cells[k].value;
            

            var s = {};
            s.id = model.cells[k].source.id;
            if(model.cells[k].source.meta.role==='port') {
                s.id = model.cells[k].source.id;
            }
            t.source = s;
            
            var s = {};
            s.id = model.cells[k].target.id;
            if(model.cells[k].target.meta.role==='port') {
                s.id = model.cells[k].target.id;
            }
            t.target = s;					
            json.chart.transitions.push(t);
        }
    });

    json = JSON.stringify(json);
    console.log(json);

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(json);
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "model.json");
    dlAnchorElem.click();

    //TODO show window ?
    /*
    var textarea = document.createElement('textarea');
    textarea.style.width = '400px';
    textarea.style.height = '400px';
    var enc = new mxCodec(mxUtils.createXmlDocument());
    var node = enc.encode(editor.graph.getModel());
    textarea.value = mxUtils.getPrettyXml(node);
    showModalWindow(graph, 'XML', textarea, 410, 440);*/
}


/**
 * Aux method for model import
 * @param {*} states 
 * @param {*} cell 
 * @param {*} parent 
 */
function processCell(states, cell, parent) {
    if(!cell || cell.drawn) {
        return;
    }
    if(cell.role && cell.role==='port') {
        //component.meta.class
        if(parent) {
            initCellPorts(cell);
            if(cell.position==='l') {
                cell.meta.ports_left++;
            }
            if(cell.position==='r') {
                cell.meta.ports_right++;
            }
            if(cell.position==='b') {
                cell.meta.ports_bottom++;
            }
            if(cell.position==='t') {
                cell.meta.ports_top++;
            }
            if(cell.iokind) {
                cell.meta.iokind = cell.iokind;
            }
            if(cell.kind) {
                cell.meta.kind = cell.kind;
            }
            var par = {};
            par.kind = cell.iokind;
            par.direction = cell.direction;

            addPort(_graph,parent,cell.x,cell.y, cell.position, cell.id, cell.value, par);
        } else {
            return;
        }        
    } else {
        if(parent || !cell.parent) {
            var v1 = _graph.insertVertex(parent, cell.id, cell.value, cell.x, cell.y, cell.width, cell.height);
            v1.meta = {};
        } else {
            return;
        }
    }
    if(parent && v1) {
        v1.parent=parent;
        _graph.addCell(v1, parent);
        //parent.children.push(v1);
    }
    cell.drawn = true;
    if(cell.spec && v1) {
        v1.spec = cell.spec;
        v1.meta.spec = cell.spec;
        processOverlay(v1,_graph);
    }

    if(cell.kind && v1) {
        v1.k = cell.kind;
        v1.meta.kind = cell.kind;
    }
    
    if(cell.iokind && v1) {
        v1.meta.iokind = cell.iokind;
    }


    if(cell.class && v1) {
        v1.meta.class=cell.class;
    }

    if(cell.direction && v1) {
        v1.meta.direction=cell.direction;
    }

    if(cell.role && v1) {
        v1.r = cell.role;
        v1.meta.role = cell.role;
    }
    
    var model = _graph.getModel();

    if(cell.children) {
        cell.children.forEach(function (c) {
            var tc = states.filter(function f(e) {return e.id == c})[0];
            processCell(states, tc, v1);
        });
    }
}


/**
 * Create the visual representation from an emdl file
 * @param {*} json 
 */
function buildModel(json) {
    console.log(json);
    var parent = _graph.getDefaultParent();
    var model = _graph.getModel();
    model.beginUpdate();
    //draw all edges
    try {
        //add root vertexes
        json.chart.states.forEach(function(f) {
            processCell(json.chart.states, f, null);            
        });
        
        //edges
        json.chart.transitions.forEach(function(t) {
            var sv = model.getCell(t.source.id);
            var tv = model.getCell(t.target.id);
            var e1 = _graph.insertEdge(parent, t.id, t.value, sv, tv);
        });
        serial = json.descriptor.serial;
    }
    finally
    {
        model.endUpdate();		
    }
}







/*
open metamodel

// MODEL

// these name should be generated automatically by the graphical tool, not decided by the user
one sig p1, p2, p3, p4, p5, p6, p7, p8, p9, p10 extends IPort {}
one sig p11, p12, p13, p14, p15, p16, p17, p18, p19 extends OPort {}

// all names here should be decided by the user
one sig A extends Leaf { disj i1 : input, disj o1 : output }
one sig B extends Leaf { disj i1 : input, disj o1 : output }
one sig C extends Leaf { disj i1, i2 : input, disj o1 : output }
one sig D extends Leaf { disj i1 : input, disj o1 : output }
one sig E extends Leaf { disj i1 : input, disj o1 : output }
one sig F extends Composite { disj i1, i2 : input, disj o1, o2 : output } 
one sig Sys extends Composite { disj i1, i2 : input, disj o1, o2 : output }

// here there are two facts, but only one would be OK, I split them for a better reading

fact connections { 
to =
  Sys.i1->F.i1
+ Sys.i2->F.i2
+ F.i1->A.i1 
+ F.i1->B.i1
+ A.o1->C.i1
+ B.o1->C.i2
+ C.o1->F.o1
+ B.o1->F.o2
+ F.o1->D.i1
+ F.o2->E.i1
+ D.o1->Sys.o1
+ E.o1->Sys.o2
}

fact subComponents {
	F.subs = A + B + C
	Sys.subs = D + E + F
}
run {}*/