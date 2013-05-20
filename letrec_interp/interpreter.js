/*globals: interpreter */

var interpreter = (function() {
    var itrp = {};

    /*
     expval : int / bool / proc
     denval:  int / bool / proc

     values:
     num-val : int->expval
     bool-val: bool->expval
     proc-val: proc->expval

     expval->num : expval->int
     expval->bool : expval->bool
     expval->proc : expval -> proc

     environment:
     empty -> new env
     extend(env, var, val) -> new env
     */

    itrp.new_environment = function() { return undefined; };

    itrp.extend_environment = function(environment, var_, val) {
        return {tag: "", var_: var_, val: val, env: environment};
    };

    itrp.extend_environment_rec = function(
        environment, procs) {
        var frame = {tag: "rec",
                     env: environment,
                     procs: {} },
            i, proc;
        for(i = 0; i < procs.length; i += 1) {
            proc = procs[i];
            frame.procs[proc.p_name] = proc;
        }
        return frame;
    };

    itrp.apply_env = function(env, var_) {
        var proc;
        while(true) {
            if(env === undefined) {
                throw "failed to find " + var_;
            }
            if(env.tag === "") {
                if(env.var_ === var_) {
                    return env.val;
                } else {
                    env = env.env;
                }
            } else if (env.tag === "rec") {
                proc = env.procs[var_];
                if(proc === undefined)  {
                    env = env.env;
                } else {
                    return itrp.proc_val(itrp.new_procedure(
                        proc.b_vars, proc.p_body, env));
                }
            } else {
                throw "unknown tag....";
            }
        }
    };

    itrp.exp_to_num = function(expval) {
        if(expval.tag !== "num") throw "expected a num";
        return expval.val;
    };

    itrp.exp_to_bool = function(expval) {
        if(expval.tag !== "bool") throw "expected a bool";
        return expval.val;
    };

    itrp.exp_to_proc = function(expval) {
        if(expval.tag !== "proc") throw "expected a proc";
        return expval.val;
    };


    itrp.num_val = function(num) {
        return {tag: "num", val: num};
    };

    itrp.bool_val = function(bool) {
        return {tag: "bool", val: bool};
    };

    itrp.proc_val = function(proc) {
        return {tag: "proc", val: proc};
    };

    var op_table = {"-": function(a, b) { return a - b; },
                    "+": function(a, b) { return a + b; },
                    "*": function(a, b) { return a * b; },
                    "/": function(a, b) { return (a / b) | 0; }};

    var compare_table = {"equal?": function(a, b) { return a === b; },
                         "less?": function(a, b) { return a < b; },
                         "greater?": function(a, b) { return a > b; }};

    var value_of = function(exp, env) {
        // console.log("value of (" + JSON.stringify(exp) + ")" +
        // " in env " + JSON.stringify(env));
        var tag = exp.tag,
            val, proc, arg, args, i;
        if(tag === "const-exp") {
            return itrp.num_val(exp.num);
        } else if (tag === "var-exp") {
            return itrp.apply_env(env, exp.var_);
        } else if (tag === "op-exp") {
            return itrp.num_val(
                op_table[exp.op](
                    itrp.exp_to_num(value_of(exp.exp1, env)),
                    itrp.exp_to_num(value_of(exp.exp2, env))));
        } else if (tag === "zero-exp") {
            val = itrp.exp_to_num(value_of(exp.exp1, env));
            if(val === 0) {
                return itrp.bool_val(true);
            } else {
                return itrp.bool_val(false);
            }
        } else if (tag === "if-exp") {
            val = itrp.exp_to_bool(value_of(exp.exp1, env));
            if(val) {
                return value_of(exp.exp2, env);
            } else {
                return value_of(exp.exp3, env);
            }
        } else if (tag === "let-exp") {
            val = value_of(exp.exp1, env);
            return value_of(
                exp.body, itrp.extend_environment(env, exp.var_, val));
        } else if (tag === "minus-exp") {
            return itrp.num_val(-itrp.exp_to_num(
                value_of(exp.exp1, env)));
        } else if (tag === "comp-exp") {
            return itrp.bool_val(
                compare_table[exp.comp](
                    itrp.exp_to_num(value_of(exp.exp1, env)),
                    itrp.exp_to_num(value_of(exp.exp2, env))));
        } else if (tag === "proc-exp") {
            return itrp.proc_val(itrp.new_procedure(
                [exp.var_], exp.body, env));
        } else if (tag === "call-exp") {
            proc = itrp.exp_to_proc(value_of(exp.rator, env));
            args = [];
            for(i = 0; i < exp.rands.length; i += 1) {
                args[i] = value_of(exp.rands[i], env);
            }
            return itrp.apply_procedure(proc, args);
        } else if (tag === "letrec-exp") {
            return value_of(
                exp.letrec_body,
                itrp.extend_environment_rec(env, exp.procs));
        } else {
            throw "not implemented for exp " + exp.tag;
        }
    };

    itrp.new_procedure = function(vars, body, env) {
        return {vars: vars, body: body, env: env};
    };

    itrp.apply_procedure = function(proc, args) {
        var new_env = proc.env, i;
        if(proc.vars.length !== args.length) {
            throw "wrong nmber of arguments";
        }

        for(i = 0; i < args.length; i += 1) {
            new_env = itrp.extend_environment(
                new_env, proc.vars[i], args[i]);
        }
        return value_of(proc.body, new_env);
    };

    itrp.value_of_program = function(program) {
        if(program.tag !== "program") {
            throw "expected a program";
        }
        return value_of(program.exp1, itrp.new_environment());
    };


    return itrp;
}());
