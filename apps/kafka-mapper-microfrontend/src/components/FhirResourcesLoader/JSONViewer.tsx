import { Box, Card, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { JSONTree, StylingValue } from "react-json-tree";
import { useFhirMapperConfig } from "../FhirMapperConfigProvider";


export const getLabelStyle: StylingValue = ({ style }, nodeType) => ({
  style: {
    ...style,
    fontFamily: "monospace",
  },
});

export function JSONViewer(props) {
  /* Based on react-json-tree from redux-devtools developers
  https://github.com/reduxjs/redux-devtools/tree/main/packages/react-json-tree
  */
  const { activeFhirResource } = useFhirMapperConfig();
  const theme = {
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
  return (
    <>
      <Card
        variant="outlined"
        sx={{ p: 3, maxHeight: "480px", overflow: "auto" }}
      >
        {activeFhirResource ? (
          <JSONTree
            collectionLimit={20}
            data={activeFhirResource}
            theme={{
              extend: theme,
              nestedNodeLabel: getLabelStyle,
              valueLabel: getLabelStyle,
            }}
          />
        ) : (
          <Box textAlign={"center"}>
            <UploadFileIcon />
            <Typography align="center" variant="body1">
              No file available
            </Typography>
          </Box>
        )}
      </Card>
    </>
  );
}
