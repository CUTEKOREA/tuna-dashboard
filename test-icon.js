const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { Workflow, Network, Share2 } = require('lucide-react');

console.log("Workflow:");
console.log(renderToStaticMarkup(createElement(Workflow)));
console.log("\nNetwork:");
console.log(renderToStaticMarkup(createElement(Network)));
console.log("\nShare2:");
console.log(renderToStaticMarkup(createElement(Share2)));
