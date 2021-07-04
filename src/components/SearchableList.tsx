import { theme } from "constants/theme";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import { FlatList, ListRenderItem } from "react-native";
import { Box, Icon, Input, Text } from "react-native-magnus";
import Loading from "./Loading";
import { SearchInput } from "./StyledInput";

interface SearchableListProps<ItemProp> {
  data: ItemProp[];
  isLoading: boolean;
  renderItem: ListRenderItem<ItemProp>;
  inputPlaceholder: string;
}

const SearchableList = <
  ItemProp extends {
    id?: string;
    uid?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    username?: string;
  }
>({
  data,
  isLoading,
  renderItem,
  inputPlaceholder,
}: SearchableListProps<ItemProp>) => {
  if (isLoading) {
    return <Loading />;
  }

  const [searchQuery, setSearchQuery] = useState("");

  const getFilteredUsers = (users: ItemProp[]) => {
    if (!users) {
      return [];
    }
    let filtered = users.filter((user) => {
      return (
        !searchQuery ||
        user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user?.firstName + " " + user?.lastName)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    return filtered;
  };

  return (
    <Box justifyContent="flex-end">
      <SearchInput
        inputPlaceholder={inputPlaceholder}
        value={searchQuery}
        onChangeText={setSearchQuery}
        showPrefix
      />

      <FlatList
        data={getFilteredUsers(data)}
        extraData={getFilteredUsers(data)}
        keyExtractor={(item) => item.id || item.uid}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
};

export default SearchableList;

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: "#D8D8D8",
    marginLeft: "18%",
  },
});
