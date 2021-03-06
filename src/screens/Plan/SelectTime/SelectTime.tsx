import React from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import AlertAsync from "react-native-alert-async";
import { Box, WINDOW_HEIGHT } from "react-native-magnus";
import Container from "components/Container";

import {
  CreateMeetupStackParamList,
  DayTimings,
  DiscussDetailsStackParamList,
  PreferredDuration,
} from "types/types";
import { StackScreenProps } from "@react-navigation/stack";
import { RouteProp, useRoute } from "@react-navigation/native";
import { CaptionText } from "components/StyledText";
import DateTimeRowComponent from "components/DateTimeRowComponent";
import {
  addPreferredDuration,
  deletePreferredDuration,
  getAllPreferredDurationsFromMeeting,
  getPreferredDurations,
  updatePreferredDuration,
} from "lib/api/meetup";
import { useAuth } from "lib/auth";
import {
  addHours,
  isBefore,
  parseISO,
  isAfter,
  startOfDay,
  compareAsc,
} from "date-fns";
import HeaderComponent from "screens/Plan/Components/SectionHeaderComponent";
import MainTimeGridSelector from "./TimeGridSelector/MainTimeGridSelector";
import Loading from "components/Loading";
import uuid from "react-native-uuid";
import { getMinutesFromStartOfDay } from "lib/helpers";

const SelectTime = ({
  navigation,
}: StackScreenProps<CreateMeetupStackParamList, "SelectTime">) => {
  const fake = [
    { "2021-07-16T06:00:00.000Z": 0 },
    { "2021-07-16T06:30:00.000Z": 1 },
    { "2021-07-16T07:00:00.000Z": 2 },
    { "2021-07-16T07:30:00.000Z": 2 },
    { "2021-07-16T08:00:00.000Z": 3 },
    { "2021-07-16T08:30:00.000Z": 3 },
    { "2021-07-16T09:00:00.000Z": 4 },
    { "2021-07-16T09:30:00.000Z": 5 },
    { "2021-07-16T10:00:00.000Z": 5 },
    { "2021-07-16T10:30:00.000Z": 5 },
    { "2021-07-16T11:00:00.000Z": 6 },
    { "2021-07-16T11:30:00.000Z": 6 },
    { "2021-07-16T12:00:00.000Z": 7 },
    { "2021-07-16T12:30:00.000Z": 7 },
  ];

  const route = useRoute<RouteProp<DiscussDetailsStackParamList, "PickTime">>();
  const { meetupId } = route.params;
  const authData = useAuth();

  const [meetupTimings, setMeetupTimings] = React.useState<DayTimings[]>([]);
  const [preferredDurations, setPreferredDurations] = React.useState<
    PreferredDuration[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const [isEditMode, setIsEditMode] = React.useState(false);

  const fetchAndSetData = async () => {
    setIsLoading(true);
    // get the data on meetupTimings to render on calendar Grid
    const preferredDurations = await getAllPreferredDurationsFromMeeting(
      meetupId
    );
    let dayTimingsArray: DayTimings[] = [];
    preferredDurations.forEach((pd) => {
      // startAt and endAt are guaranteed to be on same day
      let dateStr = startOfDay(parseISO(pd.startAt)).toISOString();

      // Check if this dateStr appears in dayTimingsArray.
      let index = dayTimingsArray.findIndex((dt) => dt.date === dateStr);

      if (index === -1) {
        let newDayTimings = {
          date: dateStr,
          startTimings: [],
        };
        for (let i = 0; i < 24 * 2; i++) {
          newDayTimings.startTimings.push([]);
        }

        dayTimingsArray.push(newDayTimings);
        index = dayTimingsArray.length - 1;
      }

      // Grab the dt.startTimings first that corresponds to this dateStr.
      let dayTimings: DayTimings = dayTimingsArray[index];

      // For the interval between startAt and endAt, decide how to populate the array of dt.startTimings.
      // Need to map the index in dayTimings to a particular time.
      let startIndex = Math.floor(
        getMinutesFromStartOfDay(parseISO(pd.startAt)) / 30
      );
      let endIndex = Math.floor(
        getMinutesFromStartOfDay(parseISO(pd.endAt)) / 30
      );

      for (let i = startIndex; i < endIndex; i++) {
        dayTimings.startTimings[i].push(pd.userUid);
      }
    });
    // Sort by date
    dayTimingsArray.sort((a, b) =>
      compareAsc(parseISO(a.date), parseISO(b.date))
    );

    setMeetupTimings(dayTimingsArray);

    // get data to render the datetimerow picker
    const resp = await getPreferredDurations(meetupId, authData.userData.uid);
    setPreferredDurations(resp);
    setIsLoading(false);
  };

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      await fetchAndSetData();
    });
    return unsubscribe;
  }, []);

  const handleEditPress = () => {
    setIsEditMode(true);
  };
  const handleDonePress = async () => {
    setIsEditMode(false);
  };
  let rightComponent = (
    <TouchableOpacity
      onPress={!isEditMode ? () => handleEditPress() : () => handleDonePress()}
    >
      <CaptionText>{isEditMode ? "Done" : "Edit"}</CaptionText>
    </TouchableOpacity>
  );

  const onAddPreferredDuration = async (prefDuration: PreferredDuration) => {
    const { startAt, endAt } = prefDuration;

    if (!startAt || !endAt || isAfter(parseISO(startAt), parseISO(endAt))) {
      Alert.alert("", "Please input a valid time period.");
      return;
    }

    prefDuration.id = uuid.v4() as string;
    prefDuration.userUid = authData.userData.uid;
    prefDuration.username = authData.userData.username;
    try {
      await addPreferredDuration(prefDuration, meetupId, authData.userData.uid);
    } catch (error) {
      Alert.alert("", error.message);
    }

    // Refresh all data
    await fetchAndSetData();
  };

  const onDeletePreferredDuration = async (prefDurationId: string) => {
    try {
      await deletePreferredDuration(
        prefDurationId,
        meetupId,
        authData.userData.uid
      );
    } catch (error) {
      Alert.alert("", error.message);
    }
    // Refresh all data
    await fetchAndSetData();
  };

  const onEditPreferredDuration = async (
    preferredDuration: PreferredDuration
  ) => {
    try {
      await updatePreferredDuration(
        meetupId,
        authData.userData.uid,
        preferredDuration
      );
    } catch (error) {
      Alert.alert("", error.message);
    }
  };

  return (
    <Container avoidHeader>
      <ScrollView
        style={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}
      >
        <Box h={WINDOW_HEIGHT * 0.5}>
          <MainTimeGridSelector meetupTimings={meetupTimings} />
        </Box>
        <Box mt={28}>
          <HeaderComponent title="Add new timing" />

          <DateTimeRowComponent
            preferredDuration={null}
            mode="add"
            handleAddButtonPress={onAddPreferredDuration}
          />
        </Box>
        <Box mt={28}>
          <HeaderComponent
            title="When are you free?"
            rightComponent={rightComponent}
          />
          {!isLoading ? (
            preferredDurations ? (
              <Box>
                {preferredDurations?.map((preferredDuration, index) => {
                  return (
                    <DateTimeRowComponent
                      key={index}
                      preferredDuration={preferredDuration}
                      mode={isEditMode ? "edit" : "default"}
                      handleDeleteButtonPress={onDeletePreferredDuration}
                      handleEdit={onEditPreferredDuration}
                    />
                  );
                })}
              </Box>
            ) : (
              <Box alignItems="center">
                <CaptionText>You have not entered a time</CaptionText>
              </Box>
            )
          ) : (
            <Loading />
          )}
        </Box>
      </ScrollView>
    </Container>
  );
};

export default SelectTime;

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    // backgroundColor: "red",
  },
});
