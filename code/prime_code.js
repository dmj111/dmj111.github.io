
const create_array = (() => {
    // Create an array of values as the result of calling fcn[i] for 0
    // <= i < n
    if(typeof Int8Array === 'function') {
        return (n) => {
            return new Int8Array(n);
        };
    } else {
        return () => {
            return new Array();
        };
    }
})();

const array_init = function(fcn, n) {
    const result = create_array(n);
    for(let i = 0; i < n; i++) {
	result[i] = fcn(i);
    }
    return result;
};

// Simple sieve.
const sieve1 = function(n) {
    // alert("version 2");
    const values = array_init(() => 1, n);

    values[1] = 0;
    values[0] = 0;

    for(let i = 0; i < n; i++) {
	if(values[i] > 0) {
            if(i*i > n) { break; }
            for(let j = i*i; j < n; j += i) {
		values[j] = 0;
            }
	}
    }

    const result = [];
    for(let j = 0; j < values.length; j += 1) {
	if(values[j] > 0) {
            result.push(j);
	}
    }
    return result;
};


export {sieve1};
