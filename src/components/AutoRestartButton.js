import React from "react";
import { useSnapshot } from "valtio";
import Button from "@mui/material/Button";

export default function AutoRestartButton({ slot, ...buttonProps }) {
  const progress = useSnapshot(slot).autoRestartFraction;
  return (
    <Button
      variant="contained"
      {...buttonProps}
      style={{ backgroundSize: `${progress * 100}% 100%` }}
      sx={
        progress == null
          ? undefined
          : {
              backgroundImage:
                "linear-gradient(rgba(0 ,0 ,0 ,0.2), rgba(0 ,0 ,0 ,0.2))",
              backgroundRepeat: "no-repeat",
            }
      }
    />
  );
}
