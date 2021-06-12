import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { RootStackParamList } from "types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "lib/auth";
import Container from "components/Container";
import LargeButton from "components/LargeButton";
import { Box, WINDOW_HEIGHT } from "react-native-magnus";

const CODE_LENGTH = 6;

export default function VerificationScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Verify">>();
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "Verify">>();
  const authData = useAuth();

  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);

  const ref = useBlurOnFulfill({
    value: verificationCode,
    cellCount: CODE_LENGTH,
  });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: verificationCode,
    setValue: setVerificationCode,
  });

  const onVerificationPress = useCallback(async () => {
    setLoading(true);
    authData.verify(route.params.verificationId, verificationCode);
    console.log("Verified code");
  }, [verificationCode]);

  useEffect(() => {
    if (verificationCode.length == 6) {
      onVerificationPress();
    }
  }, [verificationCode.length]);

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}
        >
          <View style={styles.container}>
            <CodeField
              ref={ref}
              {...props}
              value={verificationCode}
              onChangeText={setVerificationCode}
              cellCount={CODE_LENGTH}
              rootStyle={styles.codeFieldRoot}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={({ index, symbol, isFocused }) => (
                <View
                  key={index}
                  style={[styles.cell, isFocused && styles.focusCell]}
                >
                  <Text
                    style={styles.cellText}
                    onLayout={getCellOnLayoutHandler(index)}
                  >
                    {symbol || (isFocused ? <Cursor /> : null)}
                  </Text>
                </View>
              )}
            />
            <Box position="absolute" bottom={WINDOW_HEIGHT * 0.05}>
              <LargeButton
                title="Verify Code"
                loading={loading}
                onPress={onVerificationPress}
              />
            </Box>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Container>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    flex: 1,
    height: 120,
    width: 90,
    alignSelf: "center",
    margin: 30,
  },
  input: {
    width: "80%",
    height: 48,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "white",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 30,
    marginRight: 30,
    paddingLeft: 16,
    paddingRight: 16,
  },
  button: {
    backgroundColor: "#788eec",
    marginLeft: 30,
    marginRight: 30,
    marginTop: 20,
    padding: 10,
    height: 48,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  root: { flex: 1, padding: 20 },
  title: { textAlign: "center", fontSize: 30 },
  codeFieldRoot: { marginTop: 20 },
  cell: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#00000030",
    textAlign: "center",
    borderRadius: 8,
    margin: 5,
    backgroundColor: "white",
  },
  cellText: {
    fontSize: 24,
  },
  focusCell: {
    borderColor: "blue",
  },
});