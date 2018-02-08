class s {
    static l(obj) { console.log(obj); }
}

String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}


String.prototype.escape=function(begin, end, oldchar, newchar) {
    var nstr = "";
    var b = false;
    for(var i=0;i<this.length;i++) {
        var char = this.charAt(i);
        
        begin.forEach(e => {
            if(this.charAt(i)===e) {
                b = true;
            }
        });

        if(b && this.charAt(i) === oldchar) {
            //nstr = this.replaceAt(i, newchar);
            char = newchar;
        }
        
        end.forEach(e => {
            if(this.charAt(i)===e) {
                b = false;
            }
        });
        nstr += char;
    }
    return nstr;
}

String.prototype.slim=function(number) {
    return this.substring(number,this.length-number);
}