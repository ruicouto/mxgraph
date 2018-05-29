function init(container, outline, toolbar, sidebar, status) {
    _sidebar = sidebar;
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
        // Enables snapping waypoints to terminals
        mxEdgeHandler.prototype.snapToTerminals = true;
        // Creates a wrapper editor with a graph inside the given container.
        // The editor is used to create certain functionality for the
        // graph, such as the rubberband selection, but most parts
        // of the UI are custom in this example.
        var editor = new mxEditor();
        var graph = editor.graph;
        var model = graph.getModel();
        _graph = graph;
        //enable cells to be dropped into other
        graph.setDropEnabled(true);
        //allow loops
        graph.setAllowLoops(true);
        // Does not allow dangling edges
        graph.setAllowDanglingEdges(false);
        // Show icon while connections are previewed
        graph.connectionHandler.getConnectImage = function(state) {
            return new mxImage(state.style[mxConstants.STYLE_IMAGE], 16, 16);
        };
        // Centers the port icon on the target port
        graph.connectionHandler.targetConnectImage = true;
        // Enables new connections
        graph.setConnectable(true);

        // Sets the graph container and configures the editor
        editor.setGraphContainer(container);
        //Load keyboard shortcuts
        var config = mxUtils.load('editors/config/keyhandler-commons.xml').getDocumentElement();
        editor.configure(config);

        // Alt disables guides
        mxGuide.prototype.isEnabledForEvent = function(evt) {
            return !mxEvent.isAltDown(evt);
        };  

        
        // Workaround for Internet Explorer ignoring certain CSS directives
        if (mxClient.IS_QUIRKS) {
            document.body.style.overflow = 'hidden';
            new mxDivResizer(container);
            new mxDivResizer(outline);
            new mxDivResizer(toolbar);
            new mxDivResizer(sidebar);
            new mxDivResizer(status);
        }

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
            //TODO: allow only for leafs in containers, and in ports
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

        

        // Adds all required styles to the graph (see below)
        configureStylesheet(graph);

        // Adds sidebar icons.
        //
        // NOTE: For non-HTML labels a simple string as the third argument
        // and the alternative style as shown in configureStylesheet should
        // be used. For example, the first call to addSidebar icon would
        // be as follows:
        // addSidebarIcon(graph, sidebar, 'Website', 'images/icons48/earth.png');
        addSidebarIcon(graph, sidebar,'Container','images/icons48/sig.png','container','container');
        addSidebarIcon(graph, sidebar,'Component','images/icons48/leaf.png','component','component');
        addSidebarIcon(graph, sidebar,'Port','images/port.svg','port','port');
        
        //addSidebarIcon(graph, sidebar,'Leaf','images/icons48/leaf.svg','leaf');
        
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
        
        //addToolbarButton(editor, toolbar, 'groupOrUngroup', '(Un)group', 'object-group');
        
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

        toolbar.appendChild(spacer.cloneNode(true));

        addToolbarButton(editor, toolbar, 'export', 'Save', 'save');
        addToolbarButton(editor, toolbar, 'import', 'Open', 'folder-open');
        addToolbarButton(editor, toolbar, 'import_m', 'Open Metamodel', 'arrow-circle-up');
        

        toolbar.appendChild(spacer.cloneNode(true));

        addToolbarButton(editor, toolbar, 'undo', '', 'undo');
        addToolbarButton(editor, toolbar, 'redo', '', 'redo');

        
        
        toolbar.appendChild(spacer.cloneNode(true));
        
        addToolbarButton(editor, toolbar, 'cut', '', 'cut');
        addToolbarButton(editor, toolbar, 'copy', '', 'copy');
        addToolbarButton(editor, toolbar, 'paste', '', 'paste');

        //addToolbarButton(editor, toolbar, 'delete', 'Delete', 'eraser');
                
        
        
        toolbar.appendChild(spacer.cloneNode(true));
        
        addToolbarButton(editor, toolbar, 'show', 'Show', 'camera-retro');
        addToolbarButton(editor, toolbar, 'print', 'Print', 'print');
        
        

        //Define the export action
        editor.addAction('export', exportToJson);
        

        toolbar.appendChild(spacer.cloneNode(true));

        //Define import metamodel action
        document.getElementById('metamodel').addEventListener('change', handleMetamodelSelect, false);
        editor.addAction('import_m', function(editor, cell) {					
            var elem = document.getElementById("metamodel");
            if(elem && document.createEvent) {
               var evt = document.createEvent("MouseEvents");
               evt.initEvent("click", true, false);
               elem.dispatchEvent(evt);
            }
        });
        

        //Define import model action
        document.getElementById('files').addEventListener('change', handleFileSelect, false);
        editor.addAction('import', function(editor, cell) {
            var isEmpty = _graph.getChildVertices(_graph.getDefaultParent()).length==0;
            if (isEmpty || confirm("Current model will be discarded!") == true) {
                var elem = document.getElementById("files");
                if(elem && document.createEvent) {
                var evt = document.createEvent("MouseEvents");
                evt.initEvent("click", true, false);
                elem.dispatchEvent(evt);
                }
            }  
        });
        
        
        //generate alloy action
        editor.addAction('exportAlloy', function(editor, cell) {
            var src = exportAlloy(graph);
            var textarea = document.createElement('textarea');
            textarea.style.width = '400px';
            textarea.style.height = '400px';
            textarea.value = src;
            showModalWindow(graph, 'XML', textarea, 410, 440);
        });
        addToolbarButton(editor, toolbar, 'exportAlloy', 'Export to Alloy', 'cogs');

        toolbar.appendChild(spacer.cloneNode(true));

        //status.appendChild(spacer.cloneNode(true));
        
        /*var a = document.createElement('a');
        a.style.cssText = 'margin-left:20px;margin-top:10px;text-decoration:none;color: #EEE;';
        var linkText = document.createTextNode("Sample metamodel");
        var i = document.createElement('i');
        i.className="fas fa-download";
        a.append(i);
        a.appendChild(linkText);
        a.title = "Sample metamodel";
        a.href = "sample.zip";
        toolbar.appendChild(a);*/


        var a = document.createElement('a');
        a.style.cssText = 'margin-left:20px;margin-top:10px;text-decoration:none;';
        var linkText = document.createTextNode("About");
        var i = document.createElement('i');
        i.className="fas fa-info";
        a.append(i);
        a.appendChild(linkText);
        a.title = "About";
        a.href = "about.html";

        toolbar.appendChild(a);

        // Adds toolbar buttons into the status bar at the bottom
        // of the window.
        addToolbarButton(editor, status, 'collapseAll', ' (collapse)', 'compress', true);
        addToolbarButton(editor, status, 'expandAll', ' (expand)', 'expand', true);

        status.appendChild(spacer.cloneNode(true));
        
        addToolbarButton(editor, status, 'enterGroup', ' (enter)', 'sign-in-alt', true);
        addToolbarButton(editor, status, 'exitGroup', ' (exit)', 'sign-out-alt', true);

        status.appendChild(spacer.cloneNode(true));

        addToolbarButton(editor, status, 'zoomIn', ' (zoom in)', 'search-plus', true);
        addToolbarButton(editor, status, 'zoomOut', ' (zoom out)', 'search-minus', true);
        addToolbarButton(editor, status, 'actualSize', ' (1:1)', 'ruler-combined', true);
        addToolbarButton(editor, status, 'fit', ' (fit)', 'expand-arrows-alt', true);
        
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
                s.l("IS AN EDGE");
                var target = this.getTerminal(cell, false);
                var source = this.getTerminal(cell, true);
                style = 'strokeWidth=2;strokeColor=black;';
                
                var dash = false;
                if(target && target.children) {
                    target.children.forEach(function (c){
                        if(c.meta && c.meta.role==='port') {
                            dash = true;
                        }
                    });
                }

                if(source && source.children) {
                    source.children.forEach(function (c){
                        if(c.meta.role==='port') {
                            dash = true;
                        }
                    });
                }

                if (target != null && source !=null) {
                    //if one vertex has/is a port, don't draw an arrow
                    if(target.meta.role && target.meta.role === 'port' || 
                       source.meta.role && source.meta.role === 'port' || dash) {
                        var state = graph.getView().getState(target);
                        style += ';endArrow=dash';
                    } else {
                        //if value is extends, change arrow head
                        if(cell.value && cell.value=="extends") {
                            style += ';endArrow=extend';
                        } else {
                            style += ';endArrow=block';
                        }
                    }
                }

            } else if (this.isVertex(cell)) {
                //s.l("IS A VERTEX");
                
                var geometry = this.getGeometry(cell);
                var adjust = false; //adjust label position
                /*if (cell.children) {
                    cell.children.forEach( function (e) {
                        if(!e.meta || !e.meta.role || e.meta.role!=='port') {
                            adjust = true;
                        }
                    });
                }*/
                
                //move label to top
                if(adjust) {
                    style += ';verticalAlign=top';
                }
                if(cell.meta && cell.meta.kind ) {
                    
                    if(cell.meta.kind === 'port') {
                        style+=";shape=image;image=images/port.svg;";
                    } else if (cell.meta.kind === 'container') {
                        style += ';verticalAlign=top';
                    }
                    
                    //set the node style
                    /*var tc = _metamodel.elements.filter(function f(e) {return e.id == cell.meta.kind})[0];
                    if(tc) {
                        style+=";shape=image;image="+tc.image+";";
                    }*/
                }
                if(cell.meta && cell.meta.role && cell.meta.role ==='port') {
                    //draw port input/output image
                    if(cell.meta.direction) {
                        if(cell.meta.direction === 'I') {
                            //style+=";shape=image;image=images/port_in.svg;";
                        } 
                        if(cell.meta.direction === 'O') {
                            //style+=";shape=image;image=images/port_out.svg;";
                        }

                        /*if(cell.meta.position==='b') {
                            style+=";rotation=90";
                        } else if(cell.meta.position==='l') {
                            style+=";rotation=180";
                        } else if(cell.meta.position==='t') {
                            style+=";rotation=-90";
                        }*/
                    }
                }
            }
            return style;
        }
        return null;
    };

    graph.isCellMovable = function(cell) {
        if(cell && cell.meta && cell.meta.role && cell.meta.role==="lbl") {
            return false;
        }
        return true;				
    }

    graph.isCellConnectable = function(cell) {
        if(cell && cell.meta && cell.meta.role && cell.meta.role=="lbl") {
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
}


/**
 * Add button to the toolbar
 */
function addToolbarButton(editor, toolbar, action, label, image, isTransparent)
{
    var button = document.createElement('a');
    button.style.fontSize = '16';
    if (image != null) {
        /*var img = document.createElement('img');
        img.setAttribute('src', image);
        img.style.width = '16px';
        img.style.height = '16px';
        img.style.verticalAlign = 'middle';
        img.style.marginRight = '2px';
        button.appendChild(img);*/

        var i = document.createElement('i');
        i.innerHTML="<i class=\"fas fa-"+image+"\"></i>";
        button.appendChild(i);
    }
    if (isTransparent) {
        //button.style.background = 'transparent';
        //button.style.color = '#FFFFFF';
        //button.style.border = 'none';
    }
    mxEvent.addListener(button, 'click', function(evt) {
        editor.execute(action);
    });
    mxUtils.write(button, label);
    toolbar.appendChild(button);
};


function processToolbox() {
    _sidebar.innerHTML = "";
    Object.keys(_metamodel).forEach(name => {
        var label = name;
        if(_metamodel[name].props &&  _metamodel[name].props.label) {
            label = _metamodel[name].props.label;
        }
         
        var kind = _metamodel[name].k;
        var params = _metamodel[name];
        
        var img;
        if(!label) {
            label = name;
        }

        if(kind==="leaf") {
            img = "images/icons48/leaf.svg";
        } else if(kind === "container") {
            img = "images/icons48/sig.png";
        } else if(kind === "port") {
            console.log(params);
            if(params.kind==="I") {
                img = "images/port_in.svg";
            } else if(params.kind==="O") {
                img = "images/port_out.svg";
            } else {
                img = "images/port.svg";
            }
            
        }

        addSidebarIcon(_graph, _sidebar,name,img,label,kind, params);
    });
}

/**
 * Initialize the counter of ports
 */
function initCellPorts(cell) {
    if(!cell) {
        return;
    }
    if(!cell.meta) {
        cell.meta = {};
    }
    //right
    if(!cell.meta.ports_right) {
        cell.meta.ports_right=0;
    }
    //left	
    if(!cell.meta.ports_left) {
        cell.meta.ports_left=0;
    }	
    //top					
    if(!cell.meta.ports_top) {
        cell.meta.ports_top=0;
    }
    //bottom
    if(!cell.meta.ports_bottom) {
        cell.meta.ports_bottom=0;
    }			
}



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

    //style[mxConstants.STYLE_EDGE] = mxEdgeStyle.EntityRelation;
    //style[mxConstants.STYLE_EDGE] = mxEdgeStyle.Loop;
    //style[mxConstants.STYLE_EDGE] = mxEdgeStyle.SegmentConnector;
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.OrthConnector;
    
    graph.getStylesheet().putCellStyle('group', style);		
    graph.alternateEdgeStyle = 'elbow=vertical';
    style[mxConstants.STYLE_ROUNDED] = true;


};