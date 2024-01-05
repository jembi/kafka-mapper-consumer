import { Box, Card, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { JSONTree } from "react-json-tree";
import { theme, getLabelStyle } from "../theme";

export function JSONViewer({ data }) {
  /* Based on react-json-tree from redux-devtools developers
  https://github.com/reduxjs/redux-devtools/tree/main/packages/react-json-tree
  */

  return (
    <>
      <Card
        variant="outlined"
        sx={{ p: 3, maxHeight: "480px", overflow: "auto" }}
      >
        {data !== null ? (
          <JSONTree
            shouldExpandNodeInitially={(keyPath, data, level) => level < 3}
            collectionLimit={20}
            data={data}
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
