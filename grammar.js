/**
 * @file Health Level Seven
 * @author Gat Sirivong <sirivong@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const fieldSeparator = "|";
const componentSeparator = "^";
const repeatSeparator = "~";
const escapeCharacter = "\\";
const subComponentSeparator = "&";
const delimiters = [
  componentSeparator,
  repeatSeparator,
  escapeCharacter,
  subComponentSeparator,
];
const lineEndingRegex = /\r|\r\n|\n/;

export default grammar({
  name: "hl7",

  rules: {
    document: ($) =>
      seq($.msh, repeat(seq($.segment, lineEndingRegex)), optional($.segment)),
    field_separator: ($) => fieldSeparator,
    msh: ($) =>
      seq(
        "MSH",
        fieldSeparator,
        delimiters.join(""),
        repeat(seq(fieldSeparator, $.field)),
        lineEndingRegex,
      ),
    segment: ($) => seq($.segment_name, repeat(seq(fieldSeparator, $.field))),
    segment_name: ($) => /[A-Z]{1}[A-Z0-9]{2}/,
    field: ($) => seq(optional(repeatSeparator), $.repeat),
    repeat: ($) => seq(optional(componentSeparator), $.component),
    component: ($) => seq(optional(subComponentSeparator), $.subcomponent),
    subcomponent: ($) => choice($.text, $.number, $.float, $.boolean),
    number: (_) => choice(/\d+/, /0[xX][0-9a-fA-F]+/),
    float: (_) => choice(/\d*\.\d+/, /\d+\.\d*/),
    boolean: (_) => choice("true", "false"),
    text: (_) =>
      token(
        choice(
          new RegExp(`[^${fieldSeparator}\\r\\n]*`),
          seq('"', repeat(choice(/[^"]/, '""')), '"'),
        ),
      ),
  },
});
