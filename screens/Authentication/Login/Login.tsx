import React, { useState } from "react";
import { auth } from "firebase.js";

import Container from "components/Container";

import { Text, Button, Input } from "react-native-magnus";


const Login = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const login = () => {
        auth.signInAnonymously()
  .then(() => {
    // Signed in..
    console.log('signed in!');
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log('not signed in', errorMessage);
  });
    }

    return (
        <Container>
            <Text fontSize="7xl" textAlign="center" color="#F78826">
                Logo
            </Text>
            <Text fontSize="6xl" mx="xl" my="xl" fontFamily="inter-regular">
                User
            </Text>
            <Input
                fontSize="xl"
                h={60}
                mx="xl"
                bg="#EFEFEF"
                rounded="xl"
                borderWidth={0}
                onChangeText={setUsername}
                value={username}
            /> 
            <Text fontSize="6xl" mx="xl" my="xl" fontFamily="inter-regular">
                Password
            </Text>
            <Input
                fontSize="xl"
                h={60}
                mx="xl"
                bg="#EFEFEF"
                rounded="xl"
                borderWidth={0}
                secureTextEntry
                onChangeText={setPassword}
                value={password}
            />
            <Button bg="#F78826" px="3xl" my="3xl" alignSelf="center" onPress={login}>
                <Text fontSize="6xl">
                    Login
                </Text>
            </Button>
        </Container>
    )
}

export default Login;
