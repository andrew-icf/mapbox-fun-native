import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client/react';
import { colors, spacing } from '../../shared/theme';
import { GET_RECOMMENDED_LOADS } from './queries';
import { useLoadSearch } from './loadSearch';
import LoadCard from './LoadCard';

export default function LoadBoardScreen() {
  const { searchText, setSearchText, searchQuery } = useLoadSearch();

  const { data, previousData, loading, error } = useQuery(GET_RECOMMENDED_LOADS, {
    variables: { originCity: searchQuery || undefined },
  });

  // Keep showing the last results while a new search loads, instead of flashing a spinner
  const loads = (data ?? previousData)?.recommendedLoads;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Recommended Loads</Text>
      <Text style={styles.subtitle}>{searchQuery ? `Search Origin: ${searchQuery}` : 'All origins'}</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={colors.textSecondary} />
        <TextInput
          testID="origin-search"
          style={styles.searchInput}
          placeholder="Search origin city"
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          autoCorrect={false}
          autoCapitalize="words"
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      {error ? (
        <Text style={styles.message}>Error: {error.message}</Text>
      ) : loading && !loads ? (
        <ActivityIndicator style={styles.status} color={colors.accent} />
      ) : (
        <FlatList
          testID="load-list"
          data={loads ?? []}
          keyExtractor={(load) => load.id}
          renderItem={({ item }) => <LoadCard load={item} />}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={styles.listContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={styles.message}>{searchQuery ? `No loads from "${searchQuery}"` : 'No loads found'}</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    paddingTop: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingBottom: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 15, paddingVertical: spacing.sm },
  status: { marginTop: spacing.xl },
  message: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  listContent: { padding: spacing.md },
  separator: { height: spacing.md },
});