import { theme } from "constants/theme";
import { add, format, startOfDay } from "date-fns";
import React from "react";
import { Box, Text } from "react-native-magnus";
import GridCell from "./GridCell";

type dayProps = {
  date: Date;
  startTime: number;
  endTime: number;
  isRightMostDay?: boolean;
};

const Day = ({ date, startTime, endTime, isRightMostDay }: dayProps) => {
  // Get all periods by hour from startTime to endTime

  const dateStart = startOfDay(date);

  let allStartTimes: Date[] = [];
  for (let x = startTime; x < endTime; x += 1) {
    allStartTimes.push(add(dateStart, { hours: x }));
  }

  return (
    <Box alignItems="center">
      <Text
        fontFamily="poppins-regular"
        color={theme.colors.textgray}
        fontSize={14}
      >
        {format(date, "EEE")}
      </Text>
      <Text
        fontFamily="poppins-regular"
        color={theme.colors.textgray}
        fontSize={14}
      >
        {format(date, "d")}
      </Text>

      <Box>
        {allStartTimes.map((start, index) => (
          <GridCell
            key={index}
            start={start}
            isRightMostCell={isRightMostDay}
            isBottomMostCell={index === allStartTimes.length - 1}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Day;
