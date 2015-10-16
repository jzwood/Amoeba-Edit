window.onload = function(){
    
    //Change css textbox height to match the screen
    function rescaleHeight(bottomMargin){
        $('.mytextboxclass').css({'height':(window.outerHeight - bottomMargin)+'px'});
    };
    
    var save = [];//repository of saves local to session
    
    //FULLSCREEN code tweaked from http://www.sitepoint.com/html5-full-screen-api/
    function enableFullscreen(){
        var pfx = ["webkit", "moz", "ms", "o", ""];
        function RunPrefixMethod(obj, method) {
            var p = 0, m, t;
            while (p < pfx.length && !obj[m]) {
                m = method;
                if (pfx[p] == "") {
                    m = m.substr(0,1).toLowerCase() + m.substr(1);
                }
                m = pfx[p] + m;
                t = typeof obj[m];
                if (t != "undefined") {
                    pfx = [pfx[p]];
                    return (t == "function" ? obj[m]() : obj[m]);
                }
                p++;
            }
        }
        var wholeScreen = document.getElementById("html");
        
        wholeScreen.ondblclick = function(){
            if (RunPrefixMethod(document, "FullScreen") || RunPrefixMethod(document, "IsFullScreen")) {
                //RunPrefixMethod(document, "CancelFullScreen");
                //DO NOTHING
            }
            else {
                RunPrefixMethod(wholeScreen, "RequestFullScreen");
                rescaleHeight(50);
            }
        }
    }

    function prev(text, index, letters){
        return text.substring(index-letters,index).toLowerCase();
    };
    
    //allows for typed input to have interesting effects on the DOM
    function enableSmartInput(id) {
        var textArea = document.getElementById(id);
        
        //will innocently change entire document color if you happen to type a color name
        textArea.onkeyup = function(e){
            var val = this.value,
                start = this.selectionStart,
                code = e.keyCode;

            var wordcount = val.trim().length ? val.match(/\S+/g).length : 0;
            var lines = val.trim().length ? val.split("\n").length : 0;

            document.getElementById("wordcount").innerHTML = "Wordcount:"  + String(wordcount);
            document.getElementById("lines").innerHTML = "&nbsp;| Lines:"  + String(lines);

            switch(code){
                case 68://d
                    if (prev(val,start,3) === "red") {
                        $("#mytextbox").css("color", "#B02020");
                    }break;
                case 78://n
                    if (prev(val,start,5) === "green") {
                        $("#mytextbox").css("color", "#42D273");
                    }break;
                case 69://e
                    if (prev(val,start,4) === "blue") {
                        $("#mytextbox").css("color", "#46BCDE");
                    }else if(prev(val,start,6) === "orange"){
                        $("#mytextbox").css("color", "#E57254");
                    }else if(prev(val,start,5) === "white"){
                        $("#mytextbox").css("color", "#D4D4D4");
                    }
                    break;
                case 75://k
                    if (prev(val,start,5) === "black") {
                        $("#mytextbox").css("color", "black");
                    }else if(prev(val,start,12) === "invisibleink"){ //easter egg
                        if(document.getElementById("night-day?").innerHTML === "&nbsp;|&nbsp;Day"){
                            $("#mytextbox").css("color", "white");
                        }else{
                            $("#mytextbox").css("color", "#333333");
                        }
                    }
                    break;
                case 89://y
                    if (prev(val,start,4) === "gray") {
                        $("#mytextbox").css("color", "#D4D4D4");
                    }break;
                default:
                    //DO NOTHING
            }
        };
        
        //handles special input for (, ), {, and } chars
        textArea.onkeypress = function(e){
            //console.log(e.keyCode);
            var val = this.value,
                start = this.selectionStart,
                end = this.selectionEnd;
                code = e.keyCode;

            if (code === 123 || code === 125) { //curly braces {}
                if (start === end) {
                    if (code === 123) {
                        this.value = val.substring(0, start) + '{}' + val.substring(end);
                        this.selectionStart = this.selectionEnd = start + 1;
                    }else{
                        this.value = val.substring(0, start) + '}' + val.substring(end);
                        this.selectionStart = this.selectionEnd = start + 1;
                    }
                }else{
                    this.value = val.substring(0, start) + '{' + val.substring(start,end) + '}' + val.substring(end);
                }
                return false;
            }else if (code === 40 || code === 41) { //parenthesis ()
                if (start === end) {
                    this.value = val.substring(0, start) + String.fromCharCode(code) + val.substring(end);
                    this.selectionStart = this.selectionEnd = start + 1;
                }else{
                    this.value = val.substring(0, start) + '(' + val.substring(start,end) + ')' + val.substring(end);
                }
                return false;
            }
        };
        //enables multi-line tab and smart tabbing
        //Modified code found at @ http://jsfiddle.net/tovic/2wAzx/light/
        textArea.onkeydown = function(e) {
            if (e.keyCode === 9) { // tab was pressed
                // get caret position/selection
                var val = this.value,
                    start = this.selectionStart,
                    end = this.selectionEnd;
                
                //multi-line tabbing
                if (start < end) {
                    //end of line char for windows 
                    var pc = /\n/gm;
                    //... 			   for apple
                    var apple = /\r/gm;
                    if (pc.test(val.substring(start,end))){
                        this.value = val.substring(0, start) + '\t' + 
                            val.substring(start,end).replace(pc,'\n\t')+
                            val.substring(end);	
                    }else if (apple.test(val.substring(start,end))){
                        this.value = val.substring(0, start) + '\t' + 
                            val.substring(start,end).replace(apple,'\n\t')+
                            val.substring(end);	
                    }else{
                        //selected multiple chars on one line before tabbing
                        this.value = val.substring(0, start) + '\t' + val.substring(end);
                    }				
                }else{
                    // set textarea value to: text before caret + tab + text after caret
                    this.value = val.substring(0, start) + '\t' + val.substring(end);
                }
                // put caret at right position again
                this.selectionStart = this.selectionEnd = start + 1;
                // prevent the focus lose
                return false;
            }
        };
    }
    
    function enableCtrlSave() {
        //ctr-s saves entire document to your clipboard as well as keeps a local repository of each save
        shortcut.add("Ctrl+s",function() {
            var textbox = document.getElementById("mytextbox");
            var cursorPos = textbox.selectionStart;
            textbox.select();//selects all the text
            document.execCommand('copy');//copies selected text to clipboard
            save.push(document.getElementById('mytextbox').value);//pushes saved text to local repository
            console.log(save);
            textbox.selectionStart = textbox.selectionEnd = cursorPos;//deselects text and resets cursor position
        });
    }
    
    rescaleHeight(150);
    enableFullscreen();
    enableCtrlSave();
    //e.g. allows the tab character onkeypress (onkeydown) inside textarea...
    enableSmartInput('mytextbox');
    
}
