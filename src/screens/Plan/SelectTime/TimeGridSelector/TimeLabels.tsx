import { theme } from "constants/theme";
import React from "react";
import { Box, Text } from "react-native-magnus";

type timeProps = {
  startTime: number;
  endTime: number;
};

const TimeLabels = ({ startTime, endTime }: timeProps) => {
  let labels: string[] = [];
  for (let x = startTime; x <= endTime; x += 1) {
    let suffix: string;
    let time = x;
    if (x === 12) {
      suffix = "NN";
    } else if (x === 24 || x === 0) {
      suffix = "MN";
      time = 12;
    } else if (x < 12) {
      suffix = "AM";
    } else {
      suffix = "PM";
      time = x - 12;
    }
    labels.push(`${time} ${suffix}`);
  }

  return (
    <Box>
      {labels.map((label, index) => (
        <Box
          key={index}
          bg={theme.colors.backgroundlight}
          h={41}
          w={60}
          pr={10}
        >
          <Text
            fontFamily="inter-regular"
            textAlign="right"
            color={theme.colors.textgray400}
            fontSize={12}
          >
            {label}
          </Text>
        </Box>
      ))}
    </Box>
  );
};

export default TimeLabels;
