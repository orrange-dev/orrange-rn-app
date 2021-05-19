import { StackScreenProps } from "@react-navigation/stack";
import DatePicker from "components/DatePicker";
import StyledButton from "components/StyledButton";
import { theme } from "constants/theme";
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
        px={width * 0.1}
        textAlign="center"
        fontSize="5xl"
      >
        Which days do you wish to meet on?
      </Text>
      <Box flex={1} alignItems="center">
        <DatePicker />
      </Box>

      <StyledButton
        onPress={() => navigation.push("PickTime")}
        bg={theme.colors.primary400}
        position="absolute"
        bottom={25}
      >
        Confirm
      </StyledButton>
    </Container>
  );
};

export default CreatePlan;
