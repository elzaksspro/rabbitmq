var args = process.argv.slice(2);
console.log("args\n", args);
var severity = (args.length > 0) ? args[0] : 'info';
console.log("severity\n", severity);
var message = args.slice(1).join(' ') || 'Hello world';
console.log("message\n", message);