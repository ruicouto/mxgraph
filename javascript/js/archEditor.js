var _graph;
var serial=0;


// Program starts here. Creates a sample graph in the
// DOM node with the specified ID. This function is invoked
// from the onLoad event handler of the document (see below).
function main(container, outline, toolbar, sidebar, status) {
    // Checks if the browser is supported
    if (!mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    } else {
        // Assigns some global constants for general behaviour, eg. minimum
        // size (in pixels) of the active region for triggering creation of
        // new connections, the portion (100%) of the cell area to be used
        // for triggering new connections, as well as some fading options for
        // windows and the rubberband selection.
        mxConstants.MIN_HOTSPOT_SIZE = 16;
        mxConstants.DEFAULT_HOTSPOT = 1;
        
        // Enables guides
        mxGraphHandler.prototype.guidesEnabled = true;

        // Alt disables guides
        mxGuide.prototype.isEnabledForEvent = function(evt) {
            return !mxEvent.isAltDown(evt);
        };

        // Enables snapping waypoints to terminals
        mxEdgeHandler.prototype.snapToTerminals = true;

        // Workaround for Internet Explorer ignoring certain CSS directives
        if (mxClient.IS_QUIRKS) {
            document.body.style.overflow = 'hidden';
            new mxDivResizer(container);
            new mxDivResizer(outline);
            new mxDivResizer(toolbar);
            new mxDivResizer(sidebar);
            new mxDivResizer(status);
        }
        
        // Creates a wrapper editor with a graph inside the given container.
        // The editor is used to create certain functionality for the
        // graph, such as the rubberband selection, but most parts
        // of the UI are custom in this example.
        var editor = new mxEditor();
        var graph = editor.graph;
        var model = graph.getModel();
        _graph = graph;

        // Disable highlight of cells when dragging from toolbar
        graph.setDropEnabled(true);
    
        //allow loops
        graph.setAllowLoops(true);

        // Show icon while connections are previewed
        graph.connectionHandler.getConnectImage = function(state) {
            return new mxImage(state.style[mxConstants.STYLE_IMAGE], 16, 16);
        };

        // Centers the port icon on the target port
        graph.connectionHandler.targetConnectImage = true;

        // Does not allow dangling edges
        graph.setAllowDanglingEdges(false);

        // Sets the graph container and configures the editor
        editor.setGraphContainer(container);
        var config = mxUtils.load('editors/config/keyhandler-commons.xml').getDocumentElement();
        editor.configure(config);
        
        // Defines the default group to be used for grouping. The
        // default group is a field in the mxEditor instance that
        // is supposed to be a cell which is cloned for new cells.
        // The groupBorderSize is used to define the spacing between
        // the children of a group and the group bounds.
        var group = new mxCell('Group', new mxGeometry(), 'group');
        group.setVertex(true);
        group.setConnectable(false);
        editor.defaultGroup = group;
        editor.groupBorderSize = 20;

        //configure drop targets
        graph.isValidDropTarget = function(cell, cells, evt) {
            return true; //will allow all, for now
        };
        
        // Disables drilling into non-swimlanes.
        graph.isValidRoot = function(cell) {
            return this.isValidDropTarget(cell);
        }

        // Does not allow selection of locked cells
        graph.isCellSelectable = function(cell) {
            return !this.isCellLocked(cell);
        };

        // Returns a shorter label if the cell is collapsed and no
        // label for expanded groups
        graph.getLabel = function(cell) {
            var tmp = mxGraph.prototype.getLabel.apply(this, arguments); // "supercall"
            
            if (this.isCellLocked(cell)) {
                // Returns an empty label but makes sure an HTML
                // element is created for the label (for event
                // processing wrt the parent label)
                return '';
            } else if (this.isCellCollapsed(cell)) {
                var index = tmp.indexOf('</h1>');
                if (index > 0) {
                    tmp = tmp.substring(0, index+5);
                }
            }
            return tmp;
        }

        // Disables HTML labels for swimlanes to avoid conflict
        // for the event processing on the child cells. HTML
        // labels consume events before underlying cells get the
        // chance to process those events.
        //
        // NOTE: Use of HTML labels is only recommended if the specific
        // features of such labels are required, such as special label
        // styles or interactive form fields. Otherwise non-HTML labels
        // should be used by not overidding the following function.
        // See also: configureStylesheet.
        graph.isHtmlLabel = function(cell) {
            return !this.isSwimlane(cell);
        }

        //disable folding, for now
        graph.isCellFoldable = function(cell) {
            return false;
        }

        // Shows a "modal" window when double clicking a vertex.
        /*graph.dblClick = function(evt, cell)
        {
            // Do not fire a DOUBLE_CLICK event here as mxEditor will
            // consume the event and start the in-place editor.
            if (this.isEnabled() &&
                !mxEvent.isConsumed(evt) &&
                cell != null &&
                this.isCellEditable(cell))
            {
                if (this.model.isEdge(cell) ||
                    !this.isHtmlLabel(cell))
                {
                    this.startEditingAtCell(cell);
                }
                else
                {
                    var content = document.createElement('div');
                    content.innerHTML = this.convertValueToString(cell);
                    showModalWindow(this, 'Properties', content, 400, 300);
                }
            }

            // Disables any default behaviour for the double click
            mxEvent.consume(evt);
        };*/

        // Enables new connections
        graph.setConnectable(true);

        // Adds all required styles to the graph (see below)
        configureStylesheet(graph);

        // Adds sidebar icons.
        //
        // NOTE: For non-HTML labels a simple string as the third argument
        // and the alternative style as shown in configureStylesheet should
        // be used. For example, the first call to addSidebar icon would
        // be as follows:
        // addSidebarIcon(graph, sidebar, 'Website', 'images/icons48/earth.png');
        addSidebarIcon(graph, sidebar,
            'Component'//+
            //'<img src="images/icons48/earth.png" width="48" height="48">'+
            //'<br>'+
            //'<a href="http://www.jgraph.com" target="_blank">Browse</a>'
            ,'images/icons48/sig.png');
        /*addSidebarIcon(graph, sidebar,
            '<h1 style="margin:0px;">Process</h1><br>'+
            '<img src="images/icons48/gear.png" width="48" height="48">'+
            '<br><select><option>Value1</option><option>Value2</option></select><br>',
            'images/icons48/gear.png');
        addSidebarIcon(graph, sidebar,
            '<h1 style="margin:0px;">Keys</h1><br>'+
            '<img src="images/icons48/keys.png" width="48" height="48">'+
            '<br>'+
            '<button onclick="mxUtils.alert(\'generate\');">Generate</button>',
            'images/icons48/keys.png');
        addSidebarIcon(graph, sidebar,
            '<h1 style="margin:0px;">New Mail</h1><br>'+
            '<img src="images/icons48/mail_new.png" width="48" height="48">'+
            '<br><input type="checkbox"/>CC Archive',
            'images/icons48/mail_new.png');
        addSidebarIcon(graph, sidebar,
            '<h1 style="margin:0px;">Server</h1><br>'+
            '<img src="images/icons48/server.png" width="48" height="48">'+
            '<br>'+
            '<input type="text" size="12" value="127.0.0.1"/>',
            'images/icons48/server.png');*/

        // Displays useful hints in a small semi-transparent box.
        var hints = document.createElement('div');
        hints.style.position = 'absolute';
        hints.style.overflow = 'hidden';
        hints.style.width = '230px';
        hints.style.bottom = '56px';
        hints.style.height = '76px';
        hints.style.right = '20px';
        
        hints.style.background = 'black';
        hints.style.color = 'white';
        hints.style.fontFamily = 'Arial';
        hints.style.fontSize = '10px';
        hints.style.padding = '4px';

        mxUtils.setOpacity(hints, 50);
        
        mxUtils.writeln(hints, '- Drag an image from the sidebar to the graph');
        mxUtils.writeln(hints, '- Doubleclick on a vertex or edge to edit');
        mxUtils.writeln(hints, '- Shift- or Rightclick and drag for panning');
        mxUtils.writeln(hints, '- Move the mouse over a cell to see a tooltip');
        mxUtils.writeln(hints, '- Click and drag a vertex to move and connect');
        mxUtils.writeln(hints, '- Ports are managed with right click');
        document.body.appendChild(hints);
        
        // Creates a new DIV that is used as a toolbar and adds
        // toolbar buttons.
        var spacer = document.createElement('div');
        spacer.style.display = 'inline';
        spacer.style.padding = '8px';
        
        addToolbarButton(editor, toolbar, 'groupOrUngroup', '(Un)group', 'images/group.png');
        
        /*
        // Defines a new action for deleting or ungrouping
        editor.addAction('groupOrUngroup', function(editor, cell) {
            cell = cell || editor.graph.getSelectionCell();
            if (cell != null && editor.graph.isSwimlane(cell)) {
                editor.execute('ungroup', cell);
            } else {
                editor.execute('group');
            }
        });*/

        addToolbarButton(editor, toolbar, 'delete', 'Delete', 'images/delete2.png');
        
        toolbar.appendChild(spacer.cloneNode(true));
        
        addToolbarButton(editor, toolbar, 'cut', 'Cut', 'images/cut.png');
        addToolbarButton(editor, toolbar, 'copy', 'Copy', 'images/copy.png');
        addToolbarButton(editor, toolbar, 'paste', 'Paste', 'images/paste.png');

        toolbar.appendChild(spacer.cloneNode(true));
        
        addToolbarButton(editor, toolbar, 'undo', '', 'images/undo.png');
        addToolbarButton(editor, toolbar, 'redo', '', 'images/redo.png');
        
        toolbar.appendChild(spacer.cloneNode(true));
        
        addToolbarButton(editor, toolbar, 'show', 'Show', 'images/camera.png');
        addToolbarButton(editor, toolbar, 'print', 'Print', 'images/printer.png');
        
        toolbar.appendChild(spacer.cloneNode(true));

        // Defines a new export action
        editor.addAction('export', exportToJson);
        addToolbarButton(editor, toolbar, 'export', 'Export', 'images/export1.png');


        // Import action
        document.getElementById('files').addEventListener('change', handleFileSelect, false);
        editor.addAction('import', function(editor, cell) {					
            var elem = document.getElementById("files");
            if(elem && document.createEvent) {
               var evt = document.createEvent("MouseEvents");
               evt.initEvent("click", true, false);
               elem.dispatchEvent(evt);
            }
        });
        addToolbarButton(editor, toolbar, 'import', 'Import', 'images/folder.png');
        
        // Adds toolbar buttons into the status bar at the bottom
        // of the window.
        addToolbarButton(editor, status, 'collapseAll', 'Collapse All', 'images/navigate_minus.png', true);
        addToolbarButton(editor, status, 'expandAll', 'Expand All', 'images/navigate_plus.png', true);

        status.appendChild(spacer.cloneNode(true));
        
        addToolbarButton(editor, status, 'enterGroup', 'Enter', 'images/view_next.png', true);
        addToolbarButton(editor, status, 'exitGroup', 'Exit', 'images/view_previous.png', true);

        status.appendChild(spacer.cloneNode(true));

        addToolbarButton(editor, status, 'zoomIn', '', 'images/zoom_in.png', true);
        addToolbarButton(editor, status, 'zoomOut', '', 'images/zoom_out.png', true);
        addToolbarButton(editor, status, 'actualSize', '', 'images/view_1_1.png', true);
        addToolbarButton(editor, status, 'fit', '', 'images/fit_to_size.png', true);
        
        // Creates the outline (navigator, overview) for moving
        // around the graph in the top, right corner of the window.
        var outln = new mxOutline(graph, outline);

        // To show the images in the outline, uncomment the following code
        //outln.outline.labelsVisible = true;
        //outln.outline.setHtmlLabels(true);
        
        // Fades-out the splash screen after the UI has been loaded.
        var splash = document.getElementById('splash');
        if (splash != null) {
            try {
                mxEvent.release(splash);
                mxEffects.fadeOut(splash, 100, true);
            } catch (e) {
                // mxUtils is not available (library not loaded)
                splash.parentNode.removeChild(splash);
            }
        }
    }

    graph.popupMenuHandler.factoryMethod = function(menu, cell, evt) {
        return createPopupMenu(graph, menu, cell, evt);
    };



    // Needs to set a flag to check for dynamic style changes,
    // that is, changes to styles on cells where the style was
    // not explicitely changed using mxStyleChange
    graph.getView().updateStyle = true;
    
    // Overrides mxGraphModel.getStyle to return a specific style
    // for edges that reflects their target terminal (in this case
    // the strokeColor will be equal to the target's fillColor).
    var previous = graph.model.getStyle;
    
    //Dynamic styles
    graph.model.getStyle = function(cell) {
        if (cell != null) {
            var style = previous.apply(this, arguments);
            
            if (this.isEdge(cell)) {
                
                var target = this.getTerminal(cell, false);
                var source = this.getTerminal(cell, true);
                style = 'strokeWidth=2;strokeColor=black;';

                var dash = false;
                if(target && target.children) {
                    target.children.forEach(function (c){
                        if(c.k=='port') {
                            dash = true;
                        }
                    });
                }

                if(source && source.children) {
                    source.children.forEach(function (c){
                        if(c.k=='port') {
                            dash = true;
                        }
                    });
                }

                if (target != null && source !=null) {
                    if(target.k && target.k == "port" || 
                       source.k && source.k == "port" || dash) {
                        var state = graph.getView().getState(target);
                        style += ';endArrow=dash';
                        
                    } else {
                        if(cell.value && cell.value=="extends") {
                            style += ';endArrow=extend';
                        } else {
                            style += ';endArrow=block';
                        }
                    }
                }
            }
            else if (this.isVertex(cell)) {
                var geometry = this.getGeometry(cell);
                var adjust = false; //adjust label position
                if (cell.children) {
                    cell.children.forEach( function (e) {
                        if(!e.k) {
                            adjust = true;
                        }
                    });
                }
                //move label to top
                if(adjust) {
                    style += ';verticalAlign=top';
                }
            }
            return style;
        }
        return null;
    };

    graph.isCellMovable = function(cell) {
        if(cell.k=="lbl") {
            return false;
        }
        return true;				
    }

    graph.isCellConnectable = function(cell) {
        if(cell.k=="lbl") {
            return false;
        }
        return true;				
    }
    
/*
    graph.addMouseListener( {
        currentState: null,
        currentIconSet: null,
        mouseDown: function(sender, me) {
            console.log("mouse down");
            var tmp = graph.view.getState(me.getCell());
            if(tmp) {
                console.log(tmp);
                cell = tmp;
                console.log(cell.parent);
                tp = cell.parent;
            }
        },
        mouseMove: function(sender, me) {
            //console.log("mouse move");
        },
        mouseUp: function(sender, me) { 
            console.log("mouse up");
            if(cell) {
                console.log(cell);
                cell.parent = tp;
                cell = null;
            }						
        },
        dragEnter: function(evt, state) {
            //console.log("drag enter");
        },
        dragLeave: function(evt, state) {
            //console.log("drag leave");
        }
    });*/


    /* //event for edge created
    //https://jgraph.github.io/mxgraph/docs/js-api/files/handler/mxConnectionHandler-js.html
    graphComponent.getConnectionHandler().addListener(mxEvent.CONNECT, new mxIEventListener()\n{\n  public void invoke(Object sender, mxEventObject evt)\n  {\n    System.out.println("edge="+evt.getProperty("cell"));\n  }\n});\n
    */
};


function addPort(graph, cell, x, y,pos=+'l', id, lbl) {
    console.log(id + ", " + lbl);
    graph.model.beginUpdate();
    serial++;
    var s = serial;
    if(!id) {
        id = "port"+serial;
    }
    if(!lbl) {
        lbl = "lbl"+serial;
    }
    var port = graph.insertVertex(cell, id, null, x, y, 16, 16,
        'image=editors/images/rectangle.gif;align=right;imageAlign=right;verticalLabelPosition=bottom;verticalAlign=top', true);
    var lbl = graph.insertVertex(port, id, lbl, x, y, 0, 0,
        'align=right;imageAlign=right;resizable=0;dragEnabled=0;', false);
    lbl.k = 'lbl';
    lbl.setConnectable(true);
    port.geometry.offset = new mxPoint(-6, -8);
    port.k = "port";
    port.pos=pos;
    graph.model.endUpdate();
}


/**
 * Create the popup menu
 */
function createPopupMenu(graph, menu, cell, evt) {
    if (cell != null) {
        if(cell.k && cell.k === "port") {
            menu.addItem('Remove', 'images/delete2.png', function() {
            graph.model.beginUpdate();
            graph.removeCells([cell]);
            graph.model.endUpdate();
        });
        } else {
            initCellPorts(cell);
            menu.addItem('Add port Right', 'images/right.png', function() {
                cell.cr++;
                addPort(graph, cell, 1,0.1 + 0.2*(cell.cr-1),'r');
            });

            menu.addItem('Add port Left', 'images/left.png', function() {
                cell.cl++;
                addPort(graph, cell, 0, 0.1 + 0.2*(cell.cl-1),'l');
            });
            menu.addItem('Add port Top', 'images/up.png', function() {
                cell.ct++;
                addPort(graph, cell, 0.1 + 0.2*(cell.ct-1), 0,'t');
            });
            menu.addItem('Add port Bottom', 'images/down.png', function() {
                cell.cb++;
                addPort(graph, cell, 0.1 + 0.2*(cell.cb-1), 1,'b');
            });
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
    if(cell.spec) {
        tb.value = cell.spec;
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
        cell.spec = tb.value;
        console.log(cell);
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
    if (cell.spec!=='') {
        // Creates a new overlay with an image and a tooltip
        var overlay = new mxCellOverlay(new mxImage('editors/images/overlays/comment.png', 16, 16), cell.spec);
        //overlay.verticalAlign = mxConstants.ALIGN_MIDDLE;
        //overlay.align = mxConstants.ALIGN_CENTER;
        // Installs a handler for clicks on the overlay		
        overlay.addListener(mxEvent.CLICK, function(sender, evt2) {
            showSpec(cell, graph);
        });
        graph.addCellOverlay(cell, overlay);
    } else {
        graph.removeCellOverlays(cell);
    }
}

/*
var overlay = new mxCellOverlay(
								new mxImage('editors/images/overlays/check.png', 16, 16),
								'Overlay tooltip');

							// Installs a handler for clicks on the overlay							
							overlay.addListener(mxEvent.CLICK, function(sender, evt2)
							{
								mxUtils.alert('Overlay clicked');
							});
							
							// Sets the overlay for the cell in the graph
                            graph.addCellOverlay(cell, overlay);
                            */


/**
 * Add button to the toolbar
 */
function addToolbarButton(editor, toolbar, action, label, image, isTransparent)
{
    var button = document.createElement('button');
    button.style.fontSize = '10';
    if (image != null)
    {
        var img = document.createElement('img');
        img.setAttribute('src', image);
        img.style.width = '16px';
        img.style.height = '16px';
        img.style.verticalAlign = 'middle';
        img.style.marginRight = '2px';
        button.appendChild(img);
    }
    if (isTransparent)
    {
        button.style.background = 'transparent';
        button.style.color = '#FFFFFF';
        button.style.border = 'none';
    }
    mxEvent.addListener(button, 'click', function(evt)
    {
        editor.execute(action);
    });
    mxUtils.write(button, label);
    toolbar.appendChild(button);
};


/**
 * Export the model to EMDL json
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
            s.id=tcell.value;
            if(tcell.parent && tcell.parent.k && tcell.parent.k==='port') {
                s.id = tcell.parent.id;
            }
            s.value=tcell.value;
            s.x = tcell.geometry.x;
            s.y = tcell.geometry.y;
            s.width = tcell.geometry.width;
            s.height = tcell.geometry.height;
            if(tcell.spec) {
                s.spec = tcell.spec;
            }

            if(tcell.parent.k && tcell.parent.k==='port') {
                s.kind = 'port';
                s.position = tcell.parent.pos;
            }

            //set parent
            if(tcell.parent) {
                if(tcell.parent.k && tcell.parent.k === 'port') {
                    //parent of port label is a rectangle with no value
                    s.parent=tcell.parent.parent.value;
                } else {
                    s.parent=tcell.parent.value;
                }
            }
            
            //Check children
            if(tcell.children) {
                s.children=[];
                tcell.children.forEach(function (c) {
                    if(c.value) {
                        s.children.push(c.value);
                    }
                    if(c.k && c.k==='port') {
                        s.children.push(c.id);
                    }
                });
            }
            
            json.chart.states.push(s);
        }

        //edges
        if(model.cells[k].edge) {
            var t = {};
            t.id = model.cells[k].value;
            t.name = model.cells[k].value;
            

            var s = {};
            s.id = model.cells[k].source.value;
            if(model.cells[k].source.k==='port') {
                s.id = model.cells[k].source.id;
            }
            t.source = s;
            
            var s = {};
            s.id = model.cells[k].target.value;
            if(model.cells[k].target.k==='port') {
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

    
    //TODO show window
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
 * Handle file open event
 */
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var text = reader.result;
            buildModel(JSON.parse(text));
        }
        reader.readAsText(f, "utf-8");
    }
}

/**
 * Initialize the counter of ports
 */
function initCellPorts(cell) {
    if(!cell) {
        return;
    }
    //right
    if(!cell.cr) {
        cell.cr = 0;
    }
    //left	
    if(!cell.cl) {
        cell.cl = 0;
    }	
    //top					
    if(!cell.ct) {
        cell.ct = 0;
    }
    //bottom
    if(!cell.cb) {
        cell.cb = 0;
    }			
}



function processCell(states, cell, parent) {
    if(cell.drawn) {
        return;
    }
    if(cell.kind && cell.kind==='port') {
        if(parent) {
            initCellPorts(cell);
            if(cell.position==='l') {
                cell.cl++; 
            }
            if(cell.position==='r') {
                cell.cr++; 
            }
            if(cell.position==='b') {
                cell.cb++; 
            }
            if(cell.position==='t') {
                cell.ct++; 
            }
            addPort(_graph,parent,cell.x,cell.y,cell.position, cell.id, cell.value);
        } else {
            return;
        }        
    } else {
        if(parent || !cell.parent) {
            var v1 = _graph.insertVertex(parent, cell.id, cell.id, cell.x, cell.y, cell.width, cell.height);
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
        processOverlay(v1,_graph);
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
            var e1 = _graph.insertEdge(parent, t.id, t.id, sv, tv);
        });
        serial = json.descriptor.serial;
    }
    finally
    {
        model.endUpdate();		
    }
}


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
    
    if (mxClient.IS_IE)
    {
        new mxDivResizer(background);
    }
    
    var x = Math.max(0, document.body.scrollWidth/2-width/2);
    var y = Math.max(10, (document.body.scrollHeight ||
                document.documentElement.scrollHeight)/2-height*2/3);
    var wnd = new mxWindow(title, content, x, y, width, height, false, true);
    wnd.setClosable(true);
    
    // Fades the background out after after the window has been closed
    wnd.addListener(mxEvent.DESTROY, function(evt)
    {
        graph.setEnabled(true);
        mxEffects.fadeOut(background, 50, true, 
            10, 30, true);
    });

    graph.setEnabled(false);
    graph.tooltipHandler.hide();
    wnd.setVisible(true);
};

/**
 * Create sidebar icon
 */
function addSidebarIcon(graph, sidebar, label, image)
{
    // Function that is executed when the image is dropped on
    // the graph. The cell argument points to the cell under
    // the mousepointer if there is one.
    var funct = function(graph, evt, cell, x, y)
    {
        var parent = graph.getDefaultParent();
        var model = graph.getModel();
        
        var v1 = null;
        
        model.beginUpdate();
        try	{
            // NOTE: For non-HTML labels the image must be displayed via the style
            // rather than the label markup, so use 'image=' + image for the style.
            // as follows: v1 = graph.insertVertex(parent, null, label,
            // pt.x, pt.y, 120, 120, 'image=' + image);
            v1 = graph.insertVertex(parent, null, label, x, y, 80, 60);
            //v1.setConnectable(false); //set true for other models
            v1.setConnectable(true); //set true for other models
            

            // Presets the collapsed size
            //v1.geometry.alternateBounds = new mxRectangle(0, 0, 120, 40);
                                
            // Adds the ports at various relative locations
            /*var port = graph.insertVertex(v1, null, 'Trigger', 0, 0.25, 16, 16,
                    'port;image=editors/images/overlays/flash.png;align=right;imageAlign=right;spacingRight=18', true);
            port.geometry.offset = new mxPoint(-6, -8);

            graph.multiplicities.push(new mxMultiplicity(
                true, "Trigger", null, null, 1, 2, ['Error'],
                'Source Must Have 1 or 2 Targets',
                'Source Must Connect to Target',true));*/

            /*
            var port = graph.insertVertex(v1, null, 'Input', 0, 0.75, 16, 16,
                    'port;image=editors/images/overlays/check.png;align=right;imageAlign=right;spacingRight=18', true);
            port.geometry.offset = new mxPoint(-6, -4);*/
            
            /*
            var port = graph.insertVertex(v1, null, 'Error', 1, 0.25, 16, 16,
                    'port;image=editors/images/overlays/error.png;spacingLeft=18', true);
            port.geometry.offset = new mxPoint(-8, -8);*/
            /*
            var port = graph.insertVertex(v1, null, 'Result', 1, 0.75, 16, 16,
                    'port;image=editors/images/overlays/information.png;spacingLeft=18', true);
            port.geometry.offset = new mxPoint(-8, -4);*/
        }
        finally
        {
            model.endUpdate();
        }
        
        graph.setSelectionCell(v1);
    }
    
    // Creates the image which is used as the sidebar icon (drag source)
    var img = document.createElement('img');
    img.setAttribute('src', image);
    img.style.width = '48px';
    img.style.height = '48px';
    img.title = 'Drag this to the diagram to create a new vertex';
    sidebar.appendChild(img);
    
    var dragElt = document.createElement('div');
    dragElt.style.border = 'dashed gray 1px';
    dragElt.style.width = '80px';
    dragElt.style.height = '60px';
                          
    // Creates the image which is used as the drag icon (preview)
    var ds = mxUtils.makeDraggable(img, graph, funct, dragElt, 0, 0, true, true);
    ds.setGuidesEnabled(true);
};

/**
 * Configure styles
 */ 
function configureStylesheet(graph)
{
    var style = new Object();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    //style[mxConstants.STYLE_GRADIENTCOLOR] = '#F5F5F5';
    style[mxConstants.STYLE_FILLCOLOR] = '#F5F5F5';
    style[mxConstants.STYLE_STROKECOLOR] = '#000';
    style[mxConstants.STYLE_FONTCOLOR] = '#000000';
    style[mxConstants.STYLE_ROUNDED] = false;
    style[mxConstants.STYLE_OPACITY] = '90';
    style[mxConstants.STYLE_FONTSIZE] = '15';
    style[mxConstants.STYLE_FONTSTYLE] = 0;
    style[mxConstants.STYLE_IMAGE_WIDTH] = '48';
    style[mxConstants.STYLE_IMAGE_HEIGHT] = '48';
    graph.getStylesheet().putDefaultVertexStyle(style);


    // NOTE: Alternative vertex style for non-HTML labels should be as
    // follows. This repaces the above style for HTML labels.
    /*var style = new Object();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_IMAGE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
    style[mxConstants.STYLE_SPACING_TOP] = '56';
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#7d85df';
    style[mxConstants.STYLE_STROKECOLOR] = '#5d65df';
    style[mxConstants.STYLE_FILLCOLOR] = '#adc5ff';
    style[mxConstants.STYLE_FONTCOLOR] = '#1d258f';
    style[mxConstants.STYLE_FONTFAMILY] = 'Verdana';
    style[mxConstants.STYLE_FONTSIZE] = '12';
    style[mxConstants.STYLE_FONTSTYLE] = '1';
    style[mxConstants.STYLE_ROUNDED] = '1';
    style[mxConstants.STYLE_IMAGE_WIDTH] = '48';
    style[mxConstants.STYLE_IMAGE_HEIGHT] = '48';
    style[mxConstants.STYLE_OPACITY] = '80';
    graph.getStylesheet().putDefaultVertexStyle(style);*/

    style = new Object();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
    style[mxConstants.STYLE_FILLCOLOR] = '#FF9103';
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#F8C48B';
    style[mxConstants.STYLE_STROKECOLOR] = '#E86A00';
    style[mxConstants.STYLE_FONTCOLOR] = '#000000';
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_OPACITY] = '80';
    style[mxConstants.STYLE_STARTSIZE] = '30';
    style[mxConstants.STYLE_FONTSIZE] = '16';
    style[mxConstants.STYLE_FONTSTYLE] = 1;
    graph.getStylesheet().putCellStyle('group', style);
    
    style = new Object();
    /*style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
    style[mxConstants.STYLE_FONTCOLOR] = '#774400';
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_PERIMETER_SPACING] = '6';
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    //style[mxConstants.STYLE_FONTSIZE] = '10';
    style[mxConstants.STYLE_FONTSTYLE] = 2;*/
    style[mxConstants.STYLE_IMAGE_WIDTH] = '16';
    style[mxConstants.STYLE_IMAGE_HEIGHT] = '16';
    graph.getStylesheet().putCellStyle('port', style);
    

    style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#FFFFFF';
    style[mxConstants.STYLE_STROKEWIDTH] = '2';
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_STROKECOLOR] = "#000";
    style[mxConstants.STYLE_ENDARROW] = "none";
};