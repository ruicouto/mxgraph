var _graph;
var _sidebar;
var _metamodel;
var serial=0;

/**
 * 
 * @param {*} container 
 * @param {*} outline 
 * @param {*} toolbar 
 * @param {*} sidebar 
 * @param {*} status 
 */
function main(container, outline, toolbar, sidebar, status) {
    init(container, outline, toolbar, sidebar, status);
}

/**
 * Add a port to a cell
 * @param {*} graph 
 * @param {*} cell 
 * @param {*} x 
 * @param {*} y 
 * @param {*} pos 
 * @param {*} id 
 * @param {*} lbl 
 */
function addPort(graph, cell, x, y, pos='l', id, lbl, params) {
    if(!cell.meta.ports[pos]) {
        cell.meta.ports[pos] = 0;
    }
    cell.meta.ports[pos]++;
    serial++;
    var rotation = 0;
    if(!id) {
        id = "p"+serial;
    }
    if(!lbl) {
        lbl = "p"+serial;
    }

    switch(pos) {
        case 't': rotation="-90"; y = 0; break;
        case 'r': x = 1; break;
        case 'b': y = 1; rotation="90"; break;
        case 'l': x = 0; rotation="180"; break;
    }

    var img = 'editors/images/rectangle.gif';
    if(params) {
        if(params.kind == 'I') {
            img = 'images/port_in.svg;shape=image';
        } else if(params.kind == 'O') {
            img = 'images/port_out.svg;shape=image';
        }
    }

    var port = graph.insertVertex(cell, id, null, x, y, 16, 16,'image='+img+';align=right;imageAlign=right;verticalLabelPosition=bottom;verticalAlign=top;rotation='+rotation, true);
    port.meta= new PortMeta();
    port.meta.setPosition(pos);

    /*var lblv = graph.insertVertex(port, id, lbl, x*cell.meta.ports[pos], y, 0, 0,
        'align=right;imageAlign=right;resizable=0;dragEnabled=0;', false);
    lblv.meta = new Meta();
    lblv.meta.role = 'lbl';*/

    if(params) {
        if(params.name) {
            //lblv.meta.klass = params.name;
            port.meta.klass = params.name;
        }
        if(params.kind) {
            console.log("SETTING KIND",params);
            port.meta.setIOKind(params.kind);
        }
    }

    //lblv.setConnectable(true);
    port.geometry.offset = new mxPoint(-6, -8);

    updateComponentPorts(graph, cell);
}


function p() {
    return _graph.model.cells;
}




function updateComponentPorts(graph, cell) {
    //spaces
    var spt = 0.9/ (cell.children.filter(c=> c.meta && c.meta.position === 't').length+0.1);
    var spb = 0.9/ (cell.children.filter(c=> c.meta && c.meta.position === 'b').length+0.1);
    var spl = 0.9/ (cell.children.filter(c=> c.meta && c.meta.position === 'l').length+0.1);
    var spr = 0.9/ (cell.children.filter(c=> c.meta && c.meta.position === 'r').length+0.1);

    //deltas
    var dt = 0.1; 
    var db = 0.1;
    var dl = 0.1;
    var dr = 0.1;

    cell.children.forEach(c=> {
        if(c.meta) {
            if(c.meta.position==='t') {
                c.geometry.x = dt;
                c.geometry.y = 0;
                dt += spt;
            } else if(c.meta.position==='r') {
                c.geometry.y = dr;
                c.geometry.x = 1;
                dr += spr;
            } else if(c.meta.position==='b') {
                c.geometry.x = db;
                c.geometry.y = 1;
                db += spb;
            } else if(c.meta.position==='l') {
                c.geometry.y = dl;
                c.geometry.x = 0;
                dl += spl;
            } 
        }
        graph.getView().clear(c, false, false);
    });
    graph.getView().validate();

}


/**
 * Clear all elements
 */
function reset(graph=_graph) {
    graph.removeCells(graph.getChildVertices(graph.getDefaultParent()));
}


/**
 * Create the popup menu
 */
function createPopupMenu(graph, menu, cell, evt) {
    if (cell != null) {
        if(cell.meta instanceof PortMeta) {
            menu.addItem('To top', 'images/up.png', function() {
                cell.meta.position='t';
                updateComponentPorts(graph, cell.parent);
            });
            menu.addItem('To right', 'images/right.png', function() {
                cell.meta.position='r';
                updateComponentPorts(graph, cell.parent);
            });
            menu.addItem('To bottom', 'images/down.png', function() {
                cell.meta.position='b';
                updateComponentPorts(graph, cell.parent);
            });
            menu.addItem('To left', 'images/left.png', function() {
                cell.meta.position='l';
                updateComponentPorts(graph, cell.parent);
            });
            /*menu.addItem('Output', 'images/application_put.png', function() {
                cell.meta.direction='output';
                graph.getView().clear(cell, false, false);
                graph.getView().validate();
            });
            menu.addItem('Reset', 'images/table_refresh.png', function() {
                delete cell.meta.direction;
                graph.getView().clear(cell, false, false);
                graph.getView().validate();
            });*/
            menu.addSeparator();            
            menu.addItem('Remove', 'images/delete2.png', function() {
                graph.model.beginUpdate();
                graph.removeCells([cell]);
                graph.model.endUpdate();
            });
        } else {
            menu.addItem('Spec', 'images/edit.png', function() {
                showSpec(cell, graph);
            });
        }        
    }
};


/**
 * Open the specification window
 * @param {*} cell 
 * @param {*} graph 
 */
function showSpec(cell, graph) {
    var tb = document.createElement('textarea');
    //set the window content, if present
    if(cell.meta.specification) {
        tb.value = cell.meta.specification;
    }
    tb.style.width=200;
    tb.style.height=200;
    var wnd = new mxWindow('Properties ['+cell.value+']', tb, cell.geometry.x, cell.geometry.y, 200, 200, true, true);
    wnd.setMaximizable(false);
    wnd.setMinimizable(false);
    wnd.setScrollable(false);
    wnd.setResizable(false);
    wnd.setVisible(true);
    wnd.setClosable(true)
    wnd.addListener(mxEvent.CLOSE, function(sender, evt) { 
        cell.meta.specification = tb.value;
        var overlays = graph.getCellOverlays(cell);
        processOverlay(cell, graph);
    });
}


/**
 * Process the cell overlay
 * @param {*} cell 
 */
function processOverlay(cell, graph) {
    //if cell has specification
    if (cell.meta.specification && cell.meta.specification!=='') {
        // Creates a new overlay with an image and a tooltip
        var overlay = new mxCellOverlay(new mxImage('editors/images/overlays/comment.png', 16, 16), cell.meta.specification);
        overlay.addListener(mxEvent.CLICK, function(sender, evt2) {
            showSpec(cell, graph);
        });
        graph.addCellOverlay(cell, overlay);
    } else {
        graph.removeCellOverlays(cell);
    }
}








/**
 * Handle file open event
 */
function handleFileSelect(evt) {
    reset();
    var files = evt.target.files; // FileList object
    var output = [];
    
        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();
            reader.onload = function(e) {
                try {
                    var text = reader.result;
                    buildModel(JSON.parse(text));
                } catch(err) {
                    console.log(err);
                    mxUtils.alert('Invalid specification file');
                }
            }
            reader.readAsText(f, "utf-8");
        }
    
}

function handleMetamodelSelect(evt) {
    var files = evt.target.files; // FileList object
        for (var i = 0, f; f = files[i]; i++) {
            $("#metamodel-name").text("("+f.name.split(".")[0]+")");
            var reader = new FileReader();
            var text = reader.result;
            reader.onload = function(e) {
                try {
                    _metamodel = Metamodel.parse(reader.result);
                    processToolbox();
                    
                    
                    console.log("metamodel imported");
                    //console.log(_metamodel);
                } catch(err) {
                    console.log(err);
                    console.log("Invalid metamodel");
                    mxUtils.alert('Invalid metamodel file');
                }
            }
            reader.readAsText(f, "utf-8");
        }
}







/**
 * Create a modal window to show content
 * @param {*} graph 
 * @param {*} title 
 * @param {*} content 
 * @param {*} width 
 * @param {*} height 
 */
function showModalWindow(graph, title, content, width, height)
{
    var background = document.createElement('div');
    background.style.position = 'absolute';
    background.style.left = '0px';
    background.style.top = '0px';
    background.style.right = '0px';
    background.style.bottom = '0px';
    background.style.background = 'black';
    mxUtils.setOpacity(background, 50);
    document.body.appendChild(background);
    
    if (mxClient.IS_IE) {
        new mxDivResizer(background);
    }
    
    var x = Math.max(0, document.body.scrollWidth/2-width/2);
    var y = Math.max(10, (document.body.scrollHeight || document.documentElement.scrollHeight)/2-height*2/3);
    var wnd = new mxWindow(title, content, x, y, width, height, false, true);
    wnd.setClosable(true);

    // Fades the background out after after the window has been closed
    wnd.addListener(mxEvent.DESTROY, function(evt)
    {
        graph.setEnabled(true);
        mxEffects.fadeOut(background, 50, true, 10, 30, true);
    });

    graph.setEnabled(false);
    graph.tooltipHandler.hide();
    wnd.setVisible(true);
};

/**
 * Create sidebar icon
 */
function addSidebarIcon(graph, sidebar, label, image, id, kind, params) {
    // Function that is executed when the image is dropped on
    // the graph. The cell argument points to the cell under
    // the mousepointer if there is one.
    var funct = function(graph, evt, cell, x, y) {
        //if the parent is not a container
        // graph.getCellAt(x,y);
        if(cell && cell.meta) {
            if(kind!=='port' && cell.meta.kind!=='container') {
                return;
            }
        }
        var parent = cell;// graph.getCellAt(x,y);
        s.l(parent);
        var dx = dy= 0;
        if(cell) {
            //s.l(cell);
            dx = cell.geometry.x;
            dy = cell.geometry.y;
            //s.l(dx+","+dy);
        }

        var model = graph.getModel();
        var v1 = null;
        model.beginUpdate();
        if(kind!=='port') {
            try	{
                v1 = graph.insertVertex(parent, null, label.toLowerCase(), x-dx, y-dy, 80, 60);
                v1.setConnectable(true); 
                v1.k = this.id;
                
                //TODO: set component label
                v1.meta= new CellMeta();
                v1.meta.kind = kind;
                v1.meta.class = this.id;
                v1.meta.id = this.id;
                v1.meta.ports = {};//use meta.ports to handle ports
                //additional param

                graph.setSelectionCell(v1);
            } finally {
                model.endUpdate();
            }       
        }  else {
            console.log("ADD PORT ");
            console.log(params);
            
            //bug: in recursive children, parent is the outermost element. This is confusing port location
            if(parent && parent.geometry) {
                var rx = x-parent.geometry.x;
                var ry = y-parent.geometry.y;
                var dr = parent.geometry.width - rx;
                var db = parent.geometry.height - ry; 
                var p = 'l';
                console.log("--> " + rx + ", " + ry + "," + dr+","+db);

                if(ry<rx && ry < dr && ry < db) { //top
                    console.log("TOP");
                    p = 't';
                } else if(dr < rx && dr < ry && dr < db) { //right
                    console.log("RIGHT");
                    p = 'r';
                } else if(db < rx && db < ry && db < dr) {
                    p = 'b';
                    console.log("BOTTOM");
                } else {
                    //console.log("LEFT");
                }
                //additional param
                console.log("PARAMS");
                console.log(params);
                addPort(graph, cell, 0.1, 0, p,"","",params);
            }            
            model.endUpdate();
        }        
    }

    // Creates the image which is used as the sidebar icon (drag source)
    var img = document.createElement('img');
    img.setAttribute('src', image);
    img.style.width = '32px';
    img.style.height = '32px';
    img.title = 'Drag this to the diagram to create a new vertex';
    sidebar.appendChild(img);

    var p = document.createElement('p');
    p.innerHTML = id;
    
    sidebar.appendChild(p);

    var dragElt = document.createElement('div');
    dragElt.style.border = 'dashed gray 1px';
    dragElt.style.width = '80px';
    dragElt.style.height = '60px';    

    // Creates the image which is used as the drag icon (preview)
    var ds = mxUtils.makeDraggable(img, graph, funct, dragElt, 0, 0, true, true);
    ds.id=id;
    ds.setGuidesEnabled(true);
};





/*
function go() {
    _metamodel = Metamodel.parse("--@container\nabstract sig Comp { ... } \n\n--@leaf\nabstract sig Leaf { ... }\n\n--@leaf\nabstract sig ALeaf { ... }\n\n--@port(kind=I)\nabstract sig InP, OutP { ... }");
    Object.keys(_metamodel).forEach(name => {
        var label = name;
        if(_metamodel[name].props &&  _metamodel[name].props.label) {
            label = _metamodel[name].props.label;
        }
         
        var kind = _metamodel[name].k;
        var img;
        if(!label) {
            label = name;
        }
        console.log("-----");
        console.log(name);
        console.log(label);
        console.log(kind);

        console.log("-----");

        if(kind==="leaf") {
            img = "images/icons48/leaf.svg";
        } else if(kind === "container") {
            img = "images/icons48/sig.png";
        } else if(kind === "port") {
            img = "images/port_out.svg";
        }
        addSidebarIcon(_graph, _sidebar,name,img,label,kind);
    });
}*/
