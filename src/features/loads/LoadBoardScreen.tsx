import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client/react';
import { colors, spacing } from '../../shared/theme';
import { GET_RECOMMENDED_LOADS } from './queries';
import LoadCard from './LoadCard';

export default function LoadBoardScreen() {
  const { data, loading, error } = useQuery(GET_RECOMMENDED_LOADS);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Recommended Loads</Text>

      {loading ? (
        <ActivityIndicator style={styles.status} color={colors.accent} />
      ) : error ? (
        <Text style={styles.message}>Error: {error.message}</Text>
      ) : (
        <FlatList
          testID="load-list"
          data={data?.recommendedLoads ?? []}
          keyExtractor={(load) => load.id}
          renderItem={({ item }) => <LoadCard load={item} />}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.message}>No loads found</Text>}
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
    paddingVertical: spacing.md,
  },
  status: { marginTop: spacing.xl },
  message: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  listContent: { padding: spacing.md },
  separator: { height: spacing.md },
});