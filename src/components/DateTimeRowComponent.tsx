import React, { useState } from "react";
import { theme } from "constants/theme";
import { Pressable } from "react-native";
import { Div } from "react-native-magnus";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BodyTextRegular, MiniText } from "components/StyledText";
import { format } from "date-fns";

interface Props {
  start: Date;
  end: Date;
}

const DateTimeRowComponent = ({ start, end }: Props) => {
  const [fromDate, setFromDate] = useState(start);
  const [fromMode, setFromMode] = useState("date");
  const [showFromDateTimePicker, setShowFromDateTimePicker] = useState(false);

  const [toDate, setToDate] = useState(end);
  const [toMode, setToMode] = useState("date");
  const [showToDateTimePicker, setShowToDateTimePicker] = useState(false);

  const onChangeFrom = (_, selectedDate: Date) => {
    if (!selectedDate) {
      setShowFromDateTimePicker(false);
      return;
    }
    if (fromMode === "date") {
      setFromMode("time");
      return;
    }
    const currentDate = selectedDate || fromDate;
    setShowFromDateTimePicker(false); // closes the picker
    setFromDate(currentDate);
  };

  const onChangeTo = (_, selectedDate: Date) => {
    if (!selectedDate) {
      setShowToDateTimePicker(false);
      return;
    }

    if (toMode === "date") {
      setToMode("time");
      return;
    }
    const currentDate = selectedDate || toDate;
    setShowToDateTimePicker(false); // closes the picker
    setToDate(currentDate);
  };
  return (
    <Div
      row
      justifyContent="space-between"
      alignItems="center"
      overflow="hidden"
      mb={8}
    >
      <Div
        borderColor={theme.colors.linegray}
        borderWidth={1}
        w={150}
        h={30}
        rounded={5}
        justifyContent="center"
        alignItems="center"
      >
        <Pressable
          onPress={() => {
            setFromMode("date");
            setShowFromDateTimePicker(true);
          }}
        >
          <BodyTextRegular>{format(fromDate, "EEEE, d MMM")}</BodyTextRegular>
        </Pressable>
      </Div>

      <Div row alignItems="center" justifyContent="flex-end">
        <Pressable
          onPress={() => {
            setFromMode("time");
            setShowFromDateTimePicker(true);
          }}
        >
          <Div
            borderColor={theme.colors.linegray}
            borderWidth={1}
            w={50}
            h={30}
            rounded={5}
            justifyContent="center"
            alignItems="center"
          >
            <MiniText>{format(fromDate, "HH:mm")}</MiniText>
          </Div>
        </Pressable>

        <MiniText px={4}>-</MiniText>

        <Pressable
          onPress={() => {
            setToMode("time");
            setShowToDateTimePicker(true);
          }}
        >
          <Div
            borderColor={theme.colors.linegray}
            borderWidth={1}
            w={50}
            h={30}
            rounded={5}
            justifyContent="center"
            alignItems="center"
          >
            <MiniText>{format(toDate, "HH:mm")}</MiniText>
          </Div>
        </Pressable>
      </Div>

      {/* <Input onFocus={showDatepicker} placeholder="Add a date!" w={windowWidth * 0.4} mr={iconPadding} fontSize={fontSize * 0.75} value={date.toString()}/>
<Input onFocus={showTimepicker} placeholder="Start" w={windowWidth * 0.2} mr={iconPadding} fontSize={fontSize * 0.75}/>

<Input onFocus={showTimepicker} placeholder="End" w={windowWidth * 0.2} fontSize={fontSize * 0.75}/> */}
      {showFromDateTimePicker && (
        <DateTimePicker
          value={fromDate}
          //@ts-ignore
          mode={fromMode}
          is24Hour={true}
          display="default"
          onChange={onChangeFrom}
        />
      )}

      {showToDateTimePicker && (
        <DateTimePicker
          value={toDate}
          //@ts-ignore
          mode={toMode}
          is24Hour={true}
          display="default"
          onChange={onChangeTo}
        />
      )}
    </Div>
  );
};

export default DateTimeRowComponent;