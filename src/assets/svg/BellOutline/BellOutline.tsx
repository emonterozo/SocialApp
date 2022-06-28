import React from "react";
import Svg, { Path } from "react-native-svg";

interface IBellOutline {
  color?: string;
  width?: number;
  height?: number;
}

const BellOutline = ({
  color = "#000000",
  width = 10,
  height = 10,
}: IBellOutline) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24">
      <Path
        fill={color}
        fillRule="evenodd"
        d="M10 21H14C14 22.1 13.1 23 12 23S10 22.1 10 21M21 19V20H3V19L5 17V11C5 7.9 7 5.2 10 4.3V4C10 2.9 10.9 2 12 2S14 2.9 14 4V4.3C17 5.2 19 7.9 19 11V17L21 19M17 11C17 8.2 14.8 6 12 6S7 8.2 7 11V18H17V11Z"
      />
    </Svg>
  );
};

export default BellOutline;
