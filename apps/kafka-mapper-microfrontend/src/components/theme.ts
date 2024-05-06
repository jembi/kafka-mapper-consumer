import { StylingValue } from "react-json-tree";

export const theme = {
  name: "black-and-white",
  scheme: "black-and-white",
  author: "",
  base00: "#FFFFFF",
  base01: "#000000",
  base02: "#000000",
  base03: "#000000",
  base04: "#000000",
  base05: "#000000",
  base06: "#000000",
  base07: "#000000",
  base08: "#000000",
  base09: "#000000",
  base0A: "#000000",
  base0B: "#000000",
  base0C: "#000000",
  base0D: "#000000",
  base0E: "#000000",
  base0F: "#000000",
};

export const getLabelStyle: StylingValue = ({ style }, nodeType) => ({
  style: {
    ...style,
    fontFamily: "monospace",
  },
});
