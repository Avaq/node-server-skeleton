'use strict';

/**
 * Allows for creating one-line strings over multiple lines with template strings.
 *
 * Behaves like how HTML treats strings over multiple lines. Newlines are turned
 * into spaces, multiple concurrent spaces are treated as one.
 *
 * @return {String} The final concatenated string.
 */
exports.line = function(strings) {
  const values = Array.from(arguments).slice(1);
  return strings
  .map((v, i) => v.replace(/[\n\s\r ]+/g, ' ') + (values[i] || ''))
  .join('')
  .trim(' \n');
};


//Create a URL string by encoding the values.
exports.url = function(strings) {
  const values = Array.from(arguments).slice(1);
  return strings.map((v, i) => v + encodeURIComponent(values[i] || '')).join('');
};
