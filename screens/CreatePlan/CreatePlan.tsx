import { StackScreenProps } from "@react-navigation/stack";
import React from "react";
import { useWindowDimensions } from "react-native";
import { Box, Button, Text } from "react-native-magnus";
import BottomNavBar from "../../components/BottomNavBar";
import Container from "../../components/Container";
import { RootStackParamList } from "../../types";

const CreatePlan = ({
  navigation,
}: StackScreenProps<RootStackParamList, "CreatePlan">) => {
  const { width, height } = useWindowDimensions();
  return (
    <Container>
      <Text
        mt={height * 0.1}
        px={width * 0.2}
        textAlign="center"
        fontSize="5xl"
      >
        Which days do you wish to meet on?
      </Text>
      <Box flex={1} alignItems="center">
        <Text>Date Picker Component</Text>
      </Box>

      <BottomNavBar>
        <Button
          onPress={() => navigation.push("PickTime")}
          bg="backgroundlight"
          alignSelf="center"
          color="textdark"
        >
          Onwards!
        </Button>
      </BottomNavBar>
    </Container>
  );
};

export default CreatePlan;
