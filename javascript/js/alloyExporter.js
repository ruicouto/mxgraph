
var ae_data;


function exportAlloy(graph) {
    ae_data = {};
    var all = graph.getChildVertices(graph.getDefaultParent());
    console.log(all);
    all.forEach(c=> {
        exportAlloyRec(c);
        /*console.log("=");
        console.log(c);*/
    });
    console.log("--DONE--");
    console.log(ae_data);
    var src = exportAlloyTxt();
    console.log(src);
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
