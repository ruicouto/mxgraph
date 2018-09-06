class Metamodel {

    static parse(metamodel) {

        var pmmodel = {};

        var params = {};

        var print = false;
        var annotation = "";

        var kind = "none";
        metamodel.split("\n").forEach( l => {           
            if(print) {
                print = false;
            }

            if(l.match(/--@container/)) {
                kind = "container";   
                print = true;
            }

            if(l.match(/--@leaf/)) {
                kind = "leaf";
                print = true;
            }

            if(l.match(/--@port/)) {
                kind = "port";
                print = true;
                /*l.split("(")[1].split(")")[0].split(",").forEach(p=>{
                    var k = p.split("=")[0].trim();
                    var v = p.split("=")[1].trim();
                    params[k] = v;
                });*/
                //params
            }

            if(l.match(/.* *sig *.*/g)) {
                var signature = l;
                var names = [];
                var name = signature.match(/.* *sig *(.*) *\{.*/)[1].trim();
                name = name.split(' ')[0];
                name.split(",").forEach(n=>{
                    names.push(n.trim());
                });

                var props = {};
                var match = annotation.match(/--@([a-z]+) *(\(.*\))? */)

                if(match) {
                    var knd = match[1];
                    var prs = match[2];
                    props.k = knd;
                    
                    if(match.length>2 && prs) {
                        var prs = prs.slice(1,prs.length-1).escape(["{","["],["}","]"],",",";");
                        var prs = prs.escape(["{","["],["}","]"],"=","^");
                        prs.split(",").forEach(p => {
                            //console.log("P>> " + p);
                            p = p.trim();
                            var k = p.split("=")[0].trim();
                            var v = p.split("=")[1].trim();
                            
                            if(v.indexOf("[")>=0) { //array
                                v = v.slim(1);
                                var vals = v.split(";");
                                props[k] = vals;
                            } else if(v.indexOf("{")>=0) { //map
                                v = v.slim(1);
                                props[k] = {};
                                v.split(";").forEach(vl=> {
                                    //var kv = {};
                                    //kv[vl.split("^")[0].trim()] = vl.split("^")[1].trim();
                                    props[k][vl.split("^")[0].trim()] = vl.split("^")[1].trim();
                                });
                            } else { //value
                                props[k] = v;
                            }
                        });
                    }

                }
                Object.keys(params).forEach(k=>{
                    props[k] = params[k];
                });
                names.forEach(n=> {
                    var nprop = {};
                    Object.keys(props).forEach(k=>{
                        nprop[k] = props[k];
                    });
                    nprop.name = n;
                    pmmodel[n] = nprop;
                });
                //cleanup
                annotation = "";
            }
            if(print) {
                annotation  = l;
            }
        });
        return pmmodel;
    }

    

}

