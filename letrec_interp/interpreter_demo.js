/*global window */

window.onload = function() {
    var button = document.getElementById("submit"),
        input = document.getElementById("input"),
        output = document.getElementById("output");

    function run(input) {
        var ast, msg;
        try {
            ast = grammar.parse(input);
        } catch (e) {
            msg = "error line: " + e.line + " col: " + e.column +
                " expected: " + e.expected + " found: " + e.found;
            return msg;
        }
        // assert("input:", input);
        // assert("ast:", s(ast));
        // assert(ast.tag === "program", "is a program");

        if(ast.tag === "program") {
            try {
                return interpreter.value_of_program(ast);
            } catch(e) {
                return "error: " + e;
            }
        } else {
            return "input not a program";
        }
    }

    function evaluate() {
        var out = run(input.value);
        output.innerHTML = "<pre>" + JSON.stringify(out) + "</pre>";
    }

    button.addEventListener("click", evaluate, false);


};
