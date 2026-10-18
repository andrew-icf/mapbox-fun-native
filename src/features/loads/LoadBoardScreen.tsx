import { StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { colors } from '../../shared/theme';
import { GET_RECOMMENDED_LOADS } from './queries';

export default function LoadBoardScreen() {
  const { data, loading, error } = useQuery(GET_RECOMMENDED_LOADS);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {loading ? 'Loading...' : error ? `Error: ${error.message}` : `${data?.recommendedLoads.length} loads`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  title: { color: colors.textPrimary, fontSize: 18, fontWeight: '600' },
});